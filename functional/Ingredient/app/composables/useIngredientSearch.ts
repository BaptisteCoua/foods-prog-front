import type { Ingredient, Paginated } from '../types/ingredient'

// Server-side ingredient search for pickers (e.g. the recipe form). The catalog
// is far larger than a single page, so instead of preloading everything we query
// /ingredients?search as the user types — debounced 400ms so one request fires
// per typing pause, not per keystroke. One instance owns one search box.
const SEARCH_DEBOUNCE_MS = 400
const RESULT_LIMIT = 20

export const useIngredientSearch = () => {
  const api = useApi()

  const search = ref('')
  const results = ref<Ingredient[]>([])
  const loading = ref(false)

  const fetchResults = async () => {
    loading.value = true
    try {
      const query: Record<string, unknown> = { page: 1, limit: RESULT_LIMIT }
      const term = search.value.trim()
      if (term) query.search = term
      const result = await api<Paginated<Ingredient>>('/ingredients', { query })
      results.value = result.items
    }
    catch {
      results.value = []
    }
    finally {
      loading.value = false
    }
  }

  // Debounce: reset the timer on every keystroke, fire only after a 400ms pause.
  let timer: ReturnType<typeof setTimeout> | null = null
  watch(search, () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(fetchResults, SEARCH_DEBOUNCE_MS)
  })

  // Seed the dropdown with a first page before the user types anything.
  onMounted(fetchResults)

  return { search, results, loading }
}
