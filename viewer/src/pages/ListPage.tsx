import { useDeferredValue, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { KIND_META, KIND_ORDER, cards, searchCards, type CardKind } from '../lib/cards'
import CardRow from '../components/CardRow'

export default function ListPage() {
  const [params, setParams] = useSearchParams()
  const kind = params.get('kind') ?? ''
  const query = params.get('q') ?? ''
  const author = params.get('author') ?? ''
  const deferredQuery = useDeferredValue(query)

  const setParam = (key: string, value: string) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value === '') next.delete(key)
        else next.set(key, value)
        return next
      },
      { replace: true },
    )
  }

  const authors = useMemo(() => [...new Set(cards.map((c) => c.author).filter(Boolean))], [])

  const visible = useMemo(() => {
    let list = cards
    if (kind !== '') list = list.filter((c) => c.kind === kind)
    if (author !== '') list = list.filter((c) => c.author === author)
    return searchCards(list, deferredQuery)
  }, [kind, author, deferredQuery])

  // 탭의 개수 배지는 검색·작성자 필터와 무관하게 전체 기준으로 보여준다 —
  // "저장소에 지금 몇 장 있나"가 팀이 궁금해하는 숫자이기 때문.
  const countByKind = useMemo(() => {
    const m = new Map<CardKind, number>()
    for (const c of cards) m.set(c.kind, (m.get(c.kind) ?? 0) + 1)
    return m
  }, [])

  return (
    <div className="page">
      <nav className="tabs" aria-label="카드 종류">
        <button
          type="button"
          className={kind === '' ? 'tab active' : 'tab'}
          onClick={() => setParam('kind', '')}
        >
          전체 <span className="tab-count">{cards.length}</span>
        </button>
        {KIND_ORDER.map((k) => (
          <button
            key={k}
            type="button"
            className={kind === k ? 'tab active' : 'tab'}
            style={{ ['--tab-color' as string]: KIND_META[k].color }}
            onClick={() => setParam('kind', k)}
          >
            {k} · {KIND_META[k].label} <span className="tab-count">{countByKind.get(k) ?? 0}</span>
          </button>
        ))}
      </nav>

      <div className="toolbar">
        <input
          type="search"
          className="search"
          placeholder="검색 — 요약·본문·ID·출처 (예: 보험금청구, 25%, E-119)"
          value={query}
          onChange={(e) => setParam('q', e.target.value)}
        />
        <select
          className="filter"
          value={author}
          onChange={(e) => setParam('author', e.target.value)}
          aria-label="작성자 필터"
        >
          <option value="">작성자 전체</option>
          {authors.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <span className="result-count">{visible.length}장</span>
      </div>

      {visible.length > 0 ? (
        <ul className="rows">
          {visible.map((c) => (
            <CardRow key={c.id} card={c} />
          ))}
        </ul>
      ) : (
        <div className="empty">
          {deferredQuery !== '' || author !== '' ? (
            <p>조건에 맞는 카드가 없습니다. 검색어나 필터를 지워보세요.</p>
          ) : (
            <p>
              아직 이 종류의 카드가 없습니다. 카드가 만들어지면 여기 자동으로
              나타납니다 — 새로고침도 필요 없습니다.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
