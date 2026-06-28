// Persisted active tab/scope for segmented data lists (e.g. recipes:
// mine/catalog/shared). Keyed by list name so each list keeps its own choice,
// and shared across navigation/reload → returning to a list lands on the tab
// you left. No default stored: the caller supplies its own fallback.
export const useListScopeStore = defineStore('list-scope', () => {
  const scopeByList = ref<Record<string, string>>({})

  const get = (key: string) => scopeByList.value[key]

  const set = (key: string, value: string) => {
    scopeByList.value[key] = value
  }

  return { scopeByList, get, set }
}, {
  persist: true,
})
