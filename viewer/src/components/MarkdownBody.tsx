import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link } from 'react-router-dom'
import { byId } from '../lib/cards'

const ID_RE = /\b(?:O|E|S|C|X|H|P|SOL|M)-\d{3}\b/g

/** 본문 속 카드 ID(O-105 등)를, 실제로 존재하는 카드일 때만 링크로 바꾼다. */
function autolink(markdown: string): string {
  return markdown.replace(ID_RE, (id) => (byId.has(id) ? `[${id}](/card/${id})` : id))
}

export default function MarkdownBody({ markdown }: { markdown: string }) {
  const linked = useMemo(() => autolink(markdown), [markdown])
  return (
    <div className="md-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) =>
            href?.startsWith('/card/') ? (
              <Link to={href} className="card-link">
                {children}
              </Link>
            ) : (
              <a href={href} target="_blank" rel="noreferrer">
                {children}
              </a>
            ),
        }}
      >
        {linked}
      </ReactMarkdown>
    </div>
  )
}
