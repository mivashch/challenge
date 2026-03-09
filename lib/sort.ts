export type SortKey = 'created_asc' | 'created_desc' | 'updated_asc' | 'updated_desc' | 'alpha_asc' | 'alpha_desc'

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'created_desc', label: 'Newest first' },
  { value: 'created_asc',  label: 'Oldest first' },
  { value: 'updated_desc', label: 'Recently updated' },
  { value: 'updated_asc',  label: 'Least updated' },
  { value: 'alpha_asc',    label: 'A → Z' },
  { value: 'alpha_desc',   label: 'Z → A' },
]

export function sortItems<T extends { created_at: string; updated_at: string }>(
  items: T[],
  sortKey: SortKey,
  getLabel: (item: T) => string
): T[] {
  return [...items].sort((a, b) => {
    switch (sortKey) {
      case 'created_asc':  return a.created_at.localeCompare(b.created_at)
      case 'created_desc': return b.created_at.localeCompare(a.created_at)
      case 'updated_asc':  return a.updated_at.localeCompare(b.updated_at)
      case 'updated_desc': return b.updated_at.localeCompare(a.updated_at)
      case 'alpha_asc':    return getLabel(a).localeCompare(getLabel(b))
      case 'alpha_desc':   return getLabel(b).localeCompare(getLabel(a))
    }
  })
}
