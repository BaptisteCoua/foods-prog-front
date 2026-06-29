// Persisted "detailed vs compact" preference for the data lists (ingredients,
// recipes…). Keyed by list name so each list keeps its own choice, and shared
// across navigation/reload. The default per list comes from DEFAULT_DETAILED;
// lists absent from that map default to detailed.
const DEFAULT_DETAILED: Record<string, boolean> = {
  ingredients: false, // la liste des ingrédients s'ouvre en mode réduit (compact)
}

export const useListViewStore = defineStore('list-view', () => {
  const detailedByList = ref<Record<string, boolean>>({})

  const isDetailed = (key: string) => detailedByList.value[key] ?? DEFAULT_DETAILED[key] ?? true

  const toggle = (key: string) => {
    detailedByList.value[key] = !isDetailed(key)
  }

  return { detailedByList, isDetailed, toggle }
}, {
  persist: true,
})
