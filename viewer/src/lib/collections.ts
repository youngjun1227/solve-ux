import { load as yamlLoad } from 'js-yaml'

export interface CollectionGroup {
  label: string
  cards: string[]
}

export interface Collection {
  title: string
  note: string
  groups: CollectionGroup[]
}

// 방향별 카드 연결은 팀 판단이므로 코드가 아니라 _meta/collections.yaml 이
// 정의처다. 파일을 고치면 (뷰어가 켜져 있으면) 화면에 바로 반영된다.
const modules = import.meta.glob('../../../_meta/collections.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function parseCollections(): { collections: Collection[]; error: string | null } {
  const raw = Object.values(modules)[0]
  if (raw === undefined) {
    return { collections: [], error: '_meta/collections.yaml 파일이 없습니다.' }
  }
  try {
    const doc = yamlLoad(raw) as { collections?: unknown }
    const list = Array.isArray(doc?.collections) ? doc.collections : []
    const collections = list.map((c): Collection => {
      const item = (c ?? {}) as Record<string, unknown>
      const groups = Array.isArray(item.groups) ? item.groups : []
      return {
        title: String(item.title ?? '(제목 없음)'),
        note: String(item.note ?? ''),
        groups: groups.map((g): CollectionGroup => {
          const group = (g ?? {}) as Record<string, unknown>
          return {
            label: String(group.label ?? ''),
            cards: Array.isArray(group.cards) ? group.cards.map(String) : [],
          }
        }),
      }
    })
    return { collections, error: null }
  } catch (e) {
    return {
      collections: [],
      error: `_meta/collections.yaml 을 읽지 못했습니다: ${e instanceof Error ? e.message : String(e)}`,
    }
  }
}

export const { collections, error: collectionsError } = parseCollections()
