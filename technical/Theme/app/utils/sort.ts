// Multi-criteria sort shared across the data lists (ingredients, recipes…).
// The order of the array IS the priority: the first clause is the primary sort.
// Serialized to the API as repeated `sort=field:direction` query params.

export type SortDirection = 'asc' | 'desc'

export interface SortClause {
  field: string
  direction: SortDirection
}

export interface SortOption {
  value: string
  label: string
}

// Toggle a (field, direction) into a clause list, preserving priority order:
// - not present            → appended (lowest priority)
// - present, same direction → removed
// - present, other direction → direction flipped in place
export const toggleSort = (
  sorts: SortClause[],
  field: string,
  direction: SortDirection,
): SortClause[] => {
  const existing = sorts.find(s => s.field === field)
  if (!existing) return [...sorts, { field, direction }]
  if (existing.direction === direction) return sorts.filter(s => s.field !== field)
  return sorts.map(s => (s.field === field ? { ...s, direction } : s))
}

// 1-based priority of a field in the list, or 0 if absent.
export const sortRank = (sorts: SortClause[], field: string): number =>
  sorts.findIndex(s => s.field === field) + 1

// Build the API query value: ['calories:desc', 'protein:asc'].
export const serializeSorts = (sorts: SortClause[]): string[] =>
  sorts.map(s => `${s.field}:${s.direction}`)
