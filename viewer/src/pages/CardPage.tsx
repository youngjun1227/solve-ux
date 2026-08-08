import { Link, useParams } from 'react-router-dom'
import { KIND_META, byId } from '../lib/cards'
import MarkdownBody from '../components/MarkdownBody'

const FIELD_LABELS: Record<string, string> = {
  author: '작성자',
  date: '작성일',
  status: '상태',
  grade: '근거 등급',
  source_org: '발행기관',
  published: '발행일',
  url: '원문 주소',
  local_file: '원본 파일',
  page: '인용 페이지',
  app: '앱',
  user_task: '사용자 태스크',
  capture: '캡처 파일',
  captured: '캡처 날짜',
  screen: '캡처 파일',
  question: '질문 원문',
  asked: '물어본 날',
  answer_type: '답변 종류',
  confidential: '대외비',
  evidence: '근거 카드',
  source_types: '근거 종류',
  validated_by: '검증',
  hypothesis: '가설',
  survey_q: '설문 문항',
  n: '표본 수',
  rate: '비율',
  gate: 'Gate',
  pain_point: 'Pain Point',
  solution: '개선안',
  metric: '지표',
  baseline: '기준값',
  result: '결과',
}
const HIDDEN_FIELDS = new Set(['id', 'type', 'summary'])
const FIELD_ORDER = Object.keys(FIELD_LABELS)

function IdOrText({ value }: { value: string }) {
  return byId.has(value) ? (
    <Link to={`/card/${value}`} className="card-link">
      {value}
    </Link>
  ) : (
    <>{value}</>
  )
}

function FieldValue({ name, value }: { name: string; value: unknown }) {
  if (Array.isArray(value)) {
    if (value.length === 0) return <em className="missing">비어 있음</em>
    return (
      <span className="chips">
        {value.map((v, i) => (
          <span key={i} className="chip">
            <IdOrText value={String(v)} />
          </span>
        ))}
      </span>
    )
  }
  const s = String(value)
  if (s === '') return <em className="missing">비어 있음</em>
  if (name === 'url') {
    return (
      <a href={s} target="_blank" rel="noreferrer">
        {s}
      </a>
    )
  }
  if (name === 'grade') return <span className={`chip grade-${s}`}>{s}</span>
  return <IdOrText value={s} />
}

export default function CardPage() {
  const { id = '' } = useParams()
  const card = byId.get(id)

  if (!card) {
    return (
      <div className="page">
        <div className="empty">
          <p>
            <strong>{id}</strong> 카드를 찾지 못했습니다. 아직 만들어지지 않았거나
            번호가 잘못 적혔을 수 있습니다.
          </p>
          <Link to="/">← 목록으로</Link>
        </div>
      </div>
    )
  }

  const meta = KIND_META[card.kind]
  const fieldNames = [
    ...FIELD_ORDER.filter((k) => k in card.front),
    ...Object.keys(card.front).filter((k) => !HIDDEN_FIELDS.has(k) && !(k in FIELD_LABELS)),
  ]

  return (
    <div className="page">
      <Link to={`/?kind=${card.kind}`} className="back">
        ← {card.kind} · {meta.label} 목록
      </Link>

      <article className="card-sheet" style={{ ['--kind-color' as string]: meta.color }}>
        <header className="card-head">
          <span className="card-id">{card.id}</span>
          <span className="card-kind">{meta.label}</span>
          {card.isDraft ? <span className="chip chip-draft">초안 — 8/17 회의에서 확정 전</span> : null}
          <h1 className="card-summary">
            {card.summary !== '' ? card.summary : <em className="missing">summary 없음</em>}
          </h1>
          <p className="card-path">{card.path}</p>
        </header>

        {card.parseError !== null ? <p className="parse-error">⚠️ {card.parseError}</p> : null}

        <dl className="fields">
          {fieldNames.map((name) => (
            <div key={name} className="field">
              <dt>{FIELD_LABELS[name] ?? name}</dt>
              <dd>
                <FieldValue name={name} value={card.front[name]} />
              </dd>
            </div>
          ))}
        </dl>

        <MarkdownBody markdown={card.body} />

        {card.referencedBy.length > 0 ? (
          <footer className="backlinks">
            <h2>이 카드를 인용하는 카드</h2>
            <span className="chips">
              {card.referencedBy.map((ref) => (
                <span key={ref} className="chip">
                  <Link to={`/card/${ref}`} className="card-link">
                    {ref}
                  </Link>
                </span>
              ))}
            </span>
          </footer>
        ) : null}
      </article>
    </div>
  )
}
