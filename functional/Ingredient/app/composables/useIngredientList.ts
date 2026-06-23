import { toast } from 'vue3-toastify'
import type { Ingredient, Paginated } from '../types/ingredient'

// Page-level logic for the ingredient list. The list is fetched server-side,
// 15 items at a time (lazy-loading / infinite scroll), with search and
// food-type filters pushed to the API so they stay correct over the full
// dataset — not just the rows already loaded.
const PAGE_SIZE = 15
const SEARCH_DEBOUNCE_MS = 300

export const useIngredientList = () => {
  const api = useApi()

  const items = ref<Ingredient[]>([])
  const total = ref(0)
  const page = ref(1)
  const pending = ref(true)
  const loadingMore = ref(false)
  const error = ref(false)

  const search = ref('')
  const selectedFoodTypeIds = ref<number[]>([])

  const listView = useListViewStore()
  const detailed = computed(() => listView.isDetailed('ingredients'))
  const toggleView = () => listView.toggle('ingredients')

  // Multi-criteria sort, pushed to the API so it holds over the full dataset
  // (not just the rows already lazy-loaded). Persisted per list.
  const sortStore = useListSortStore()
  const sortOptions: SortOption[] = [
    { value: 'calories', label: 'Calories' },
    { value: 'protein', label: 'Protéines' },
    { value: 'carb', label: 'Glucides' },
    { value: 'fat', label: 'Lipides' },
    { value: 'price', label: 'Prix' },
  ]
  const sorts = computed<SortClause[]>({
    get: () => sortStore.get('ingredients'),
    set: value => sortStore.set('ingredients', value),
  })

  const hasMore = computed(() => items.value.length < total.value)
  const hasActiveFilter = computed(
    () => Boolean(search.value?.trim()) || selectedFoodTypeIds.value.length > 0,
  )

  const buildQuery = (targetPage: number) => {
    const query: Record<string, unknown> = { page: targetPage, limit: PAGE_SIZE }
    const term = search.value?.trim()
    if (term) query.search = term
    if (selectedFoodTypeIds.value.length) query.foodTypeIds = selectedFoodTypeIds.value
    if (sorts.value.length) query.sort = serializeSorts(sorts.value)
    return query
  }

  const fetchPage = (targetPage: number) =>
    api<Paginated<Ingredient>>('/ingredients', { query: buildQuery(targetPage) })

  // (Re)load the first page — on mount and on every search/filter change.
  const load = async () => {
    pending.value = true
    error.value = false
    try {
      const result = await fetchPage(1)
      items.value = result.items
      total.value = result.total
      page.value = 1
    }
    catch {
      error.value = true
      items.value = []
      total.value = 0
    }
    finally {
      pending.value = false
    }
  }

  // Append the next page. Called by the bottom sentinel's v-intersect.
  const loadMore = async (isIntersecting = true) => {
    if (!isIntersecting || !hasMore.value || loadingMore.value || pending.value) return
    loadingMore.value = true
    try {
      const next = page.value + 1
      const result = await fetchPage(next)
      items.value = [...items.value, ...result.items]
      total.value = result.total
      page.value = next
    }
    catch {
      // Keep what we have; the sentinel retries on the next intersection.
    }
    finally {
      loadingMore.value = false
    }
  }

  const refresh = () => load()

  // Any search/filter change rewinds to page 1. Search is debounced so we don't
  // hit the API on every keystroke.
  let searchTimer: ReturnType<typeof setTimeout> | null = null
  watch(search, () => {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => load(), SEARCH_DEBOUNCE_MS)
  })
  watch(selectedFoodTypeIds, () => load(), { deep: true })
  watch(sorts, () => load(), { deep: true })

  // Delete-with-confirmation flow.
  const confirmTarget = ref<Ingredient | null>(null)
  const isDeleting = ref(false)

  const askDelete = (ingredient: Ingredient) => {
    confirmTarget.value = ingredient
  }

  const cancelDelete = () => {
    confirmTarget.value = null
  }

  const confirmDelete = async () => {
    const target = confirmTarget.value
    if (!target) return
    isDeleting.value = true
    try {
      await api(`/ingredients/${target.id}`, { method: 'DELETE' })
      // Drop locally to avoid a scroll jump, keep the count honest, and refresh
      // the shared library cache used by the recipe form's ingredient picker.
      items.value = items.value.filter(item => item.id !== target.id)
      total.value = Math.max(0, total.value - 1)
      await refreshNuxtData('ingredients')
      toast.success('Ingrédient supprimé.')
      confirmTarget.value = null
    }
    catch {
      toast.error('Suppression impossible (ingrédient utilisé dans une recette ?).')
    }
    finally {
      isDeleting.value = false
    }
  }

  onMounted(load)

  return {
    items,
    total,
    pending,
    loadingMore,
    error,
    hasMore,
    hasActiveFilter,
    search,
    selectedFoodTypeIds,
    detailed,
    toggleView,
    sorts,
    sortOptions,
    loadMore,
    refresh,
    reload: refresh,
    confirmTarget,
    isDeleting,
    askDelete,
    cancelDelete,
    confirmDelete,
  }
}
