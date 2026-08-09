import { useState } from 'react'
import MarkdownBody from '../components/MarkdownBody'

// 개인 기록지의 정의처는 01_evidence/competitor/평가지_{앱}_{사람}.md 파일들이다.
// 파일을 고치면 (뷰어가 켜져 있으면) 이 화면에 바로 반영된다.
const modules = import.meta.glob('../../../01_evidence/competitor/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const APP_LABEL: Record<string, string> = {
  monimo: '모니모',
  toss: '토스',
  supersol: 'SuperSOL',
}

// 사람 순서 — ID 대역 순서와 같게 둔다 (팀장 100 / 팀원1 200 / 팀원2 300 / 팀원3 400)
const PERSON_ORDER = ['팀장', '팀원1', '팀원2', '팀원3']

type Sheet = {
  key: string
  app: string
  appLabel: string
  person: string
  path: string
  markdown: string
  filled: number
  total: number
}

/**
 * "- 본 것:" 뒤부터 그다음 "- 관련:" 앞까지를 한 항목의 답으로 본다.
 * 답이 비어 있으면 아직 안 채운 항목이다.
 */
function countAnswers(markdown: string): { filled: number; total: number } {
  const lines = markdown.split('\n')
  let filled = 0
  let total = 0
  let inAnswer = false
  let buffer = ''

  const flush = () => {
    if (!inAnswer) return
    if (buffer.trim() !== '') filled += 1
    inAnswer = false
    buffer = ''
  }

  for (const line of lines) {
    const seen = /^\s*-\s*본 것\s*:(.*)$/.exec(line)
    if (seen !== null) {
      flush()
      total += 1
      inAnswer = true
      buffer = seen[1]
      continue
    }
    if (inAnswer) {
      // "- 관련:" 이나 새 항목 제목을 만나면 그 항목의 답은 끝난 것이다
      if (/^\s*-\s*관련\s*:/.test(line) || line.startsWith('#')) flush()
      else buffer += '\n' + line
    }
  }
  flush()

  return { filled, total }
}

const sheets: Sheet[] = Object.entries(modules)
  .map(([path, markdown]): Sheet | null => {
    const file = path.split('/').pop() ?? ''
    const m = /^평가지_(.+?)_(.+?)\.md$/.exec(file)
    if (m === null) return null
    const [, app, person] = m
    return {
      key: file,
      app,
      appLabel: APP_LABEL[app] ?? app,
      person,
      path: `01_evidence/competitor/${file}`,
      markdown,
      ...countAnswers(markdown),
    }
  })
  .filter((s): s is Sheet => s !== null)
  .sort((a, b) => {
    if (a.app !== b.app) return a.app.localeCompare(b.app)
    const ai = PERSON_ORDER.indexOf(a.person)
    const bi = PERSON_ORDER.indexOf(b.person)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })

export default function RecordSheetPage() {
  const [active, setActive] = useState(sheets[0]?.key ?? '')

  if (sheets.length === 0) {
    return (
      <div className="page">
        <div className="empty">
          <p>
            아직 개인 기록지가 없습니다 (01_evidence/competitor/평가지_&#123;앱&#125;_&#123;사람&#125;.md).
            만들어지면 여기 자동으로 나타납니다.
          </p>
        </div>
      </div>
    )
  }

  const current = sheets.find((s) => s.key === active) ?? sheets[0]

  return (
    <div className="page">
      <p className="directions-intro">
        각자 앱을 보면서 채우는 <strong>개인 기록지</strong>입니다. 사람마다 한 부씩이고,
        같은 앱을 두 명이 보므로 계정 조건에 따라 답이 다를 수 있습니다 — 그게 정상입니다.
        <strong> 기록은 파일에 하고, 이 화면은 읽기용입니다.</strong> 남의 기록지는 고치지 않습니다.
      </p>

      <div className="tabs" role="tablist" aria-label="기록지">
        {sheets.map((s) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={s.key === current.key}
            className={s.key === current.key ? 'tab active' : 'tab'}
            onClick={() => setActive(s.key)}
          >
            {s.appLabel} · {s.person}
            <span className="tab-count">
              {s.filled}/{s.total}
            </span>
          </button>
        ))}
      </div>

      <p className="sheet-meta">
        <code>{current.path}</code> · 채운 항목 <strong>{current.filled}</strong> / {current.total}
        {current.filled < current.total ? (
          <span className="sheet-meta-note">
            {' '}— 빈칸은 아직 안 본 항목입니다. 다 채우지 않아도 됩니다.
          </span>
        ) : null}
      </p>

      <article className="doc-sheet">
        <MarkdownBody markdown={current.markdown} />
      </article>
    </div>
  )
}
