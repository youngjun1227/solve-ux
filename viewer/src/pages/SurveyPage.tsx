import { useState } from 'react'
import { Link } from 'react-router-dom'
import MarkdownBody from '../components/MarkdownBody'
import { cards } from '../lib/cards'

// 설문 문서(정본·초안)와 감사 보고서의 정의처는 아래 md 파일들이다.
// 파일을 고치면 (뷰어가 켜져 있으면) 이 화면에 바로 반영된다.
// 여러 날짜의 문서가 쌓일 수 있으므로 glob 으로 읽고 최신순으로 세운다.
const finalModules = import.meta.glob('../../../03_validation/design/survey_deploy_*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const draftModules = import.meta.glob('../../../03_validation/design/survey_draft_*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const auditModules = import.meta.glob('../../../_meta/redteam_survey_*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

type Doc = { key: string; path: string; date: string; markdown: string }

/** 파일명 끝의 YYYYMMDD 를 2026-08-13 꼴로. 없으면 빈 문자열. */
function dateFromName(file: string): string {
  const m = /(\d{4})(\d{2})(\d{2})\.md$/.exec(file)
  return m === null ? '' : `${m[1]}-${m[2]}-${m[3]}`
}

function toDocs(modules: Record<string, string>, dir: string): Doc[] {
  return Object.entries(modules)
    .map(([path, markdown]) => {
      const file = path.split('/').pop() ?? ''
      return { key: file, path: `${dir}/${file}`, date: dateFromName(file), markdown }
    })
    .sort((a, b) => b.key.localeCompare(a.key))
}

const finals = toDocs(finalModules, '03_validation/design')
const drafts = toDocs(draftModules, '03_validation/design')
const audits = toDocs(auditModules, '_meta')

// 설문의 관문 일정. 8/15 일정 전면 개편(PROJECT_PLAN 버전 2.0) 반영:
// 고정 날짜는 8/15 오후 배포 · 8/19 마감 (그리고 9/11 테스트) — 나머지는 잠정.
const GATES = [
  { date: '8/13', label: '초안 작성 · 1차 감사', fixed: false, done: true },
  { date: '8/14', label: '2차 감사 · 반영', fixed: false, done: true },
  { date: '8/15', label: '폼 확정 · 오후 배포', fixed: true, done: false },
  { date: '8/17', label: '응답 중간 점검', fixed: false, done: false },
  { date: '8/19', label: '설문 마감', fixed: true, done: false },
  { date: '8/25', label: '종합 회의 — H 확정 · Gate 1 (신한라이프 본사 17시)', fixed: true, done: false },
]

export default function SurveyPage() {
  const tabs = [
    ...finals.map((d) => ({ kind: 'final' as const, doc: d })),
    ...drafts.map((d) => ({ kind: 'draft' as const, doc: d })),
    ...audits.map((d) => ({ kind: 'audit' as const, doc: d })),
  ]
  const [active, setActive] = useState(tabs[0]?.doc.key ?? '')

  // H 초안은 이미 카드로 읽히고 있다. 여기서는 목록만 이어 준다 (정의처를 복제하지 않는다).
  const hDrafts = cards
    .filter((c) => c.kind === 'H' && c.isDraft && c.status !== 'dropped')
    .sort((a, b) => a.num - b.num)

  if (tabs.length === 0) {
    return (
      <div className="page">
        <div className="empty">
          <p>
            아직 설문 초안이 없습니다 (03_validation/design/survey_draft_&#123;날짜&#125;.md).
            만들어지면 여기 자동으로 나타납니다.
          </p>
        </div>
      </div>
    )
  }

  const current = tabs.find((t) => t.doc.key === active) ?? tabs[0]

  return (
    <div className="page">
      <p className="directions-intro">
        8/15 오후에 배포하는 <strong>설문지</strong>와 그 이력(초안·감사 보고서)입니다.
        문항은 전부 가설(H)에 묶여 있고, 각 문항에는 <strong>반증 조건</strong>이 붙어 있습니다 —
        그런 답이 나오면 우리 판단이 틀린 것입니다.
        <strong> 수정은 파일에 하고, 이 화면은 읽기용입니다.</strong>
      </p>

      <div className="survey-warn ok">
        <strong>최종본 확정 (8/15) — 오늘 오후 배포.</strong> 실제 구글폼이 제작됐고, 정본은{' '}
        <code>survey_deploy_20260814.md</code>(6차 — 폼과 동기화)입니다. 초안·감사 탭은
        이력 보존용이며 문항 번호가 최종본과 다릅니다. 배포 전 마무리: 시안 이미지([IMG-2])
        · 링크 2개 · 페이지 3 이후 대조 · 전 경로 통과 확인. 마감은 8/19(수)입니다.
      </div>

      <ol className="survey-gates" aria-label="배포까지 남은 관문">
        {GATES.map((g) => (
          <li
            key={g.date}
            className={['survey-gate', g.fixed ? 'fixed' : '', g.done ? 'done' : '']
              .filter(Boolean)
              .join(' ')}
          >
            <span className="survey-gate-date">{g.date}</span>
            <span className="survey-gate-label">{g.label}</span>
            {g.fixed ? <span className="survey-gate-tag">고정 날짜</span> : null}
          </li>
        ))}
      </ol>

      {hDrafts.length > 0 ? (
        <p className="survey-hlist">
          <span className="survey-hlist-label">묶여 있는 가설 초안</span>
          {hDrafts.map((c) => (
            <Link key={c.id} to={`/card/${c.id}`} className="survey-hchip" title={c.summary}>
              {c.id}
            </Link>
          ))}
        </p>
      ) : null}

      <div className="tabs" role="tablist" aria-label="설문 문서">
        {tabs.map((t) => (
          <button
            key={t.doc.key}
            type="button"
            role="tab"
            aria-selected={t.doc.key === current.doc.key}
            className={t.doc.key === current.doc.key ? 'tab active' : 'tab'}
            onClick={() => setActive(t.doc.key)}
          >
            {t.kind === 'final' ? '배포 최종본' : t.kind === 'draft' ? '설문지 초안' : '감사 보고서'}
            <span className="tab-count">{t.doc.date}</span>
          </button>
        ))}
      </div>

      <p className="sheet-meta">
        <code>{current.doc.path}</code>
        {current.kind === 'audit' ? (
          <span className="sheet-meta-note">
            {' '}— 감사역은 설문을 고치지 않습니다. 지적만 하고 수정은 설문 주인이 합니다.
          </span>
        ) : null}
      </p>

      <article className="doc-sheet">
        <MarkdownBody markdown={current.doc.markdown} />
      </article>
    </div>
  )
}
