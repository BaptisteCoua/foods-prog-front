// Persisted "detailed vs compact" preference for the data lists (ingredients,
// recipes…). Keyed by list name so each list keeps its own choice, and shared
// across navigation/reload. Defaults to detailed (key absent → true).
export const useListViewStore = defineStore('list-view', () => {
  const detailedByList = ref<Record<string, boolean>>({})

  const isDetailed = (key: string) => detailedByList.value[key] ?? true

  const toggle = (key: string) => {
    detailedByList.value[key] = !isDetailed(key)
  }

  return { detailedByList, isDetailed, toggle }
}, {
  persist: true,
})
