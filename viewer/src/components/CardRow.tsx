import { Link } from 'react-router-dom'
import { KIND_META, type Card } from '../lib/cards'

export default function CardRow({ card }: { card: Card }) {
  const dropped = card.status === 'dropped'
  return (
    <li className={dropped ? 'row dropped' : 'row'}>
      <Link to={`/card/${card.id}`} className="row-link">
        <span className="row-rail" style={{ background: KIND_META[card.kind].color }} />
        <span className="row-id">{card.id}</span>
        <span className="row-summary">
          {card.summary !== '' ? card.summary : <em className="missing">summary 없음</em>}
          {card.isDraft ? <span className="chip chip-draft">초안</span> : null}
          {dropped ? <span className="chip chip-dropped">dropped</span> : null}
        </span>
        <span className="row-meta">
          {card.grade !== '' ? <span className={`chip grade-${card.grade}`}>{card.grade}</span> : null}
          <span className="row-author">{card.author}</span>
          <span className="row-date">{card.date}</span>
        </span>
      </Link>
    </li>
  )
}
