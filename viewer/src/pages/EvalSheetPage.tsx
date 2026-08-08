import MarkdownBody from '../components/MarkdownBody'

// 평가지 본체와 부속 안내의 정의처는 00_project/ 의 md 파일 둘이다.
// 파일을 고치면 (뷰어가 켜져 있으면) 이 화면에 바로 반영된다.
const sheetModules = import.meta.glob('../../../00_project/competitor_eval_sheet.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const guideModules = import.meta.glob('../../../00_project/competitor_eval_guide.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const sheet = Object.values(sheetModules)[0]
const guide = Object.values(guideModules)[0]

export default function EvalSheetPage() {
  return (
    <div className="page">
      <p className="directions-intro">
        경쟁 앱(모니모·토스)과 SuperSOL 캡처 때 쓰는 평가지입니다. 원본은{' '}
        <code>00_project/competitor_eval_sheet.md</code> — 기록은 파일에 하고,
        이 화면은 읽기용입니다.
      </p>
      {sheet !== undefined ? (
        <article className="doc-sheet">
          <MarkdownBody markdown={sheet} />
        </article>
      ) : (
        <div className="empty">
          <p>
            아직 평가지 파일이 없습니다 (00_project/competitor_eval_sheet.md).
            만들어지면 여기 자동으로 나타납니다.
          </p>
        </div>
      )}
      {guide !== undefined ? (
        <details className="doc-details">
          <summary>부속 안내 — 작성 규칙 · 캡처 규칙 · 확인 한계 (캡처 전에 한 번 읽기)</summary>
          <article className="doc-sheet">
            <MarkdownBody markdown={guide} />
          </article>
        </details>
      ) : null}
    </div>
  )
}
