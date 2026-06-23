// Persisted multi-criteria sort preference for the data lists (ingredients,
// recipes…). Keyed by list name so each list keeps its own choice, mirroring
// useListViewStore. Defaults to an empty list (key absent → no sort → API's
// default alphabetical order).
export const useListSortStore = defineStore('list-sort', () => {
  const sortsByList = ref<Record<string, SortClause[]>>({})

  const get = (key: string): SortClause[] => sortsByList.value[key] ?? []

  const set = (key: string, sorts: SortClause[]) => {
    sortsByList.value[key] = sorts
  }

  const clear = (key: string) => {
    sortsByList.value[key] = []
  }

  return { sortsByList, get, set, clear }
}, {
  persist: true,
})
