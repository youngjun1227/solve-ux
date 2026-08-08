import { byId } from '../lib/cards'
import { collections, collectionsError } from '../lib/collections'
import CardRow from '../components/CardRow'

export default function DirectionsPage() {
  if (collectionsError !== null) {
    return (
      <div className="page">
        <div className="empty">
          <p>{collectionsError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <p className="directions-intro">
        아이디어(개선 방향)별로 근거 카드를 모아 봅니다. 연결 목록은{' '}
        <code>_meta/collections.yaml</code> 이 정의처이며 <strong>8/17 회의에서
        확정 전인 초안</strong>입니다 — 파일에서 ID를 넣고 빼면 이 화면이 바로
        바뀝니다.
      </p>

      {collections.map((col) => (
        <section key={col.title} className="direction">
          <h2 className="direction-title">{col.title}</h2>
          {col.note !== '' ? <p className="direction-note">{col.note}</p> : null}

          {col.groups.map((group) => {
            const found = group.cards.filter((id) => byId.has(id))
            const missing = group.cards.filter((id) => !byId.has(id))
            return (
              <div key={group.label} className="direction-group">
                <h3 className="direction-group-label">
                  {group.label} <span className="tab-count">{group.cards.length}</span>
                </h3>
                {found.length > 0 ? (
                  <ul className="rows">
                    {found.map((id) => (
                      <CardRow key={id} card={byId.get(id)!} />
                    ))}
                  </ul>
                ) : (
                  <p className="direction-empty">연결된 카드가 아직 없습니다.</p>
                )}
                {missing.length > 0 ? (
                  <p className="direction-missing">
                    목록에는 있지만 저장소에 없는 카드: {missing.join(', ')} —
                    번호가 잘못 적혔거나 아직 안 만들어졌습니다.
                  </p>
                ) : null}
              </div>
            )
          })}
        </section>
      ))}
    </div>
  )
}
