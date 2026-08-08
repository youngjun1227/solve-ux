import { load as yamlLoad } from 'js-yaml'

/** 카드 종류 접두어. ID의 접두어까지가 이름이다 (CLAUDE.md ID 규칙). */
export type CardKind = 'O' | 'E' | 'S' | 'C' | 'X' | 'H' | 'P' | 'SOL' | 'M'

export const KIND_ORDER: CardKind[] = ['O', 'E', 'S', 'C', 'X', 'H', 'P', 'SOL', 'M']

export const KIND_META: Record<CardKind, { label: string; color: string }> = {
  O: { label: '팀 관찰', color: '#2E7D5B' },
  E: { label: '데스크', color: '#2B5FAB' },
  S: { label: '화면 분석', color: '#7A4FA8' },
  C: { label: '경쟁 앱', color: '#C06A2D' },
  X: { label: '멘토 확인', color: '#1F7A8C' },
  H: { label: '가설', color: '#8C6D1F' },
  P: { label: 'Pain Point', color: '#B23A48' },
  SOL: { label: '개선안', color: '#4A5BB5' },
  M: { label: '측정', color: '#5A6472' },
}

export interface Card {
  id: string
  kind: CardKind
  num: number
  /** 저장소 루트 기준 경로 (예: 01_evidence/desk/E-101.md) */
  path: string
  /** 02_hypothesis/draft/ 아래에 있는 H 초안 여부 */
  isDraft: boolean
  front: Record<string, unknown>
  body: string
  summary: string
  author: string
  date: string
  grade: string
  status: string
  /** 이 카드 본문·필드가 언급하는 다른 카드 ID */
  refs: string[]
  /** 이 카드를 언급하는 다른 카드 ID (역링크) */
  referencedBy: string[]
  parseError: string | null
}

const ID_RE = /\b(?:O|E|S|C|X|H|P|SOL|M)-\d{3}\b/g
const FILENAME_RE = /(?:^|\/)((?:O|E|S|C|X|H|P|SOL|M)-(\d{3}))\.md$/

// 카드가 놓이는 폴더 전부. 새 md 파일이 생기면 dev 서버가 자동 반영한다.
// (00_project·_meta 문서에도 예시 YAML이 있으므로 카드 폴더만 읽는다)
const modules = import.meta.glob(
  [
    '../../../01_evidence/team/*.md',
    '../../../01_evidence/desk/*.md',
    '../../../01_evidence/screen/*.md',
    '../../../01_evidence/competitor/*.md',
    '../../../01_evidence/expert/*.md',
    '../../../02_hypothesis/**/*.md',
    '../../../04_painpoint/*.md',
    '../../../05_solution/*.md',
    '../../../07_usertest/measurement/*.md',
  ],
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>

function parseCard(globPath: string, raw: string): Card | null {
  const m = FILENAME_RE.exec(globPath)
  if (!m) return null // 파일명이 카드 ID 형태가 아니면 카드가 아니다
  const id = m[1]
  const kind = id.slice(0, id.indexOf('-')) as CardKind
  const path = globPath.replace(/^(\.\.\/)+/, '')

  let front: Record<string, unknown> = {}
  let body = raw
  let parseError: string | null = null
  const fm = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw)
  if (fm) {
    body = raw.slice(fm[0].length)
    try {
      const loaded = yamlLoad(fm[1])
      if (loaded && typeof loaded === 'object') front = loaded as Record<string, unknown>
    } catch (e) {
      parseError = `front-matter를 읽지 못했습니다: ${e instanceof Error ? e.message : String(e)}`
    }
  } else {
    parseError = '카드 맨 위의 --- 정보 블록(front-matter)이 없습니다'
  }

  const str = (k: string) => {
    const v = front[k]
    return v == null ? '' : String(v)
  }

  const refSource = raw.replace(id, '') // 자기 자신은 참조로 세지 않는다
  const refs = [...new Set(refSource.match(ID_RE) ?? [])].filter((r) => r !== id)

  return {
    id,
    kind,
    num: Number(m[2]),
    path,
    isDraft: path.includes('02_hypothesis/draft/'),
    front,
    body,
    summary: str('summary'),
    author: str('author'),
    date: str('date'),
    grade: str('grade'),
    status: str('status'),
    refs,
    referencedBy: [],
    parseError,
  }
}

function buildCards(): { cards: Card[]; byId: Map<string, Card> } {
  const cards: Card[] = []
  for (const [globPath, raw] of Object.entries(modules)) {
    const card = parseCard(globPath, raw)
    if (card) cards.push(card)
  }
  cards.sort(
    (a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || a.num - b.num,
  )
  const byId = new Map(cards.map((c) => [c.id, c]))
  for (const card of cards) {
    for (const ref of card.refs) byId.get(ref)?.referencedBy.push(card.id)
  }
  return { cards, byId }
}

/** 모듈 로드 시 1회 계산 — dev에서는 파일이 바뀌면 페이지가 새로 계산한다. */
export const { cards, byId } = buildCards()

export function searchCards(list: Card[], query: string): Card[] {
  const q = query.trim().toLowerCase()
  if (!q) return list
  const terms = q.split(/\s+/)
  return list.filter((c) => {
    const hay = `${c.id} ${c.summary} ${c.author} ${c.body} ${Object.values(c.front).join(' ')}`.toLowerCase()
    return terms.every((t) => hay.includes(t))
  })
}
