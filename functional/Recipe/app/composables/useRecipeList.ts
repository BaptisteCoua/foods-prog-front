import { toast } from 'vue3-toastify'
import type { Paginated, Recipe } from '../types/recipe'

// Browsing scope of the recipe list:
// - 'mine'    → GET /recipes?scope=MINE     (only my own recipes)
// - 'catalog' → GET /recipes?scope=CATALOG  (global reference library)
// - 'shared'  → GET /recipes/shared         (other users' PUBLIC recipes)
export type RecipeScope = 'mine' | 'catalog' | 'shared'

// Page-level logic for the recipe list. The list is fetched server-side, 15
// items at a time (lazy-loading / infinite scroll), with search + meal-type +
// dietary-regime filters pushed to the API so they stay correct over the full
// dataset — not just the rows already loaded. Filterable categories come from
// useMealTypes / useDietaryRegimes. The same search/filters drive both scopes.
const PAGE_SIZE = 15
const SEARCH_DEBOUNCE_MS = 300

export const useRecipeList = (scope: Ref<RecipeScope> = ref<RecipeScope>('mine')) => {
  const api = useApi()
  const { mealTypes } = useMealTypes()
  const { dietaryRegimes, ensureLoaded: ensureRegimesLoaded } = useDietaryRegimes()
  const { clone: cloneRecipe, unclone: uncloneRecipe } = useRecipes()
  const profileStore = useProfileStore()

  const endpoint = computed(() => (scope.value === 'shared' ? '/recipes/shared' : '/recipes'))
  // Scope sent to GET /recipes (ignored by /recipes/shared).
  const scopeParam = computed(() =>
    scope.value === 'catalog' ? 'CATALOG' : scope.value === 'mine' ? 'MINE' : undefined)

  const items = ref<Recipe[]>([])
  const total = ref(0)
  const page = ref(1)
  const pending = ref(true)
  const loadingMore = ref(false)
  const error = ref(false)

  const search = ref('')
  const selectedMealTypeIds = ref<number[]>([])
  const selectedDietaryRegimeIds = ref<number[]>([])

  const listView = useListViewStore()
  const detailed = computed(() => listView.isDetailed('recipes'))
  const toggleView = () => listView.toggle('recipes')

  // Multi-criteria sort on the PER-SERVING values shown on the card, pushed to
  // the API so it holds over the full dataset (not just lazy-loaded rows).
  const sortStore = useListSortStore()
  // Popularité (nb d'enregistrements) n'a de sens que sur du contenu partagé :
  // on l'expose pour la bibliothèque et les recettes partagées, pas pour « mine ».
  const sortOptions = computed<SortOption[]>(() => {
    const options: SortOption[] = []
    if (scope.value !== 'mine') options.push({ value: 'saves', label: 'Popularité' })
    options.push(
      { value: 'calories', label: 'Calories' },
      { value: 'protein', label: 'Protéines' },
      { value: 'carb', label: 'Glucides' },
      { value: 'fat', label: 'Lipides' },
      { value: 'price', label: 'Prix' },
    )
    return options
  })
  const sorts = computed<SortClause[]>({
    get: () => sortStore.get('recipes'),
    set: value => sortStore.set('recipes', value),
  })

  const hasMore = computed(() => items.value.length < total.value)
  const hasActiveFilter = computed(
    () => Boolean(search.value?.trim())
      || selectedMealTypeIds.value.length > 0
      || selectedDietaryRegimeIds.value.length > 0,
  )

  const buildQuery = (targetPage: number) => {
    const query: Record<string, unknown> = { page: targetPage, limit: PAGE_SIZE }
    if (scopeParam.value) query.scope = scopeParam.value
    const term = search.value?.trim()
    if (term) query.search = term
    if (selectedMealTypeIds.value.length) query.mealTypeIds = selectedMealTypeIds.value
    if (selectedDietaryRegimeIds.value.length) query.dietaryRegimeIds = selectedDietaryRegimeIds.value
    if (sorts.value.length) query.sort = serializeSorts(sorts.value)
    return query
  }

  const fetchPage = (targetPage: number) =>
    api<Paginated<Recipe>>(endpoint.value, { query: buildQuery(targetPage) })

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

  // Gate the facet watcher until the first load: applying the profile-based
  // default below mutates selectedDietaryRegimeIds, and we don't want that
  // programmatic change to fire a second load on top of the initial one.
  const initialized = ref(false)

  // Preselect the dietary-regime filter from the user's profile (diet type +
  // gluten/lactose allergies) so the list defaults to what they can eat. Set
  // once, before the first fetch; the user stays free to change it afterwards.
  const applyProfileDefaults = () => {
    if (selectedDietaryRegimeIds.value.length) return
    selectedDietaryRegimeIds.value = profileRegimeDefaultIds(profileStore.profile, dietaryRegimes.value)
  }

  // Any search/filter change rewinds to page 1. Search is debounced so we don't
  // hit the API on every keystroke.
  let searchTimer: ReturnType<typeof setTimeout> | null = null
  watch(search, () => {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => load(), SEARCH_DEBOUNCE_MS)
  })
  watch([selectedMealTypeIds, selectedDietaryRegimeIds], () => {
    if (initialized.value) load()
  }, { deep: true })
  watch(sorts, () => load(), { deep: true })
  // Switching tab (mine ↔ shared) reloads from the matching endpoint.
  watch(scope, () => load())

  // Clone a recipe (global catalog or another user's public one) into the
  // user's own collection; refreshes the shared library cache used elsewhere.
  const isCloning = ref<number | null>(null)
  const cloneToMine = async (recipe: Recipe) => {
    if (isCloning.value) return
    isCloning.value = recipe.id
    // MAJ optimiste : la pastille passe « enregistrée » et le compteur +1
    // immédiatement (sinon l'utilisateur ne comprend pas que l'action a marché).
    const item = items.value.find(r => r.id === recipe.id)
    if (item) {
      item.alreadySaved = true
      item.savesCount += 1
    }
    try {
      await cloneRecipe(recipe.id)
      toast.success('Recette ajoutée à tes recettes.')
    }
    catch {
      if (item) {
        item.alreadySaved = false
        item.savesCount = Math.max(0, item.savesCount - 1)
      }
      toast.error('Impossible d\'enregistrer cette recette.')
    }
    finally {
      isCloning.value = null
    }
  }

  // Remove the saved copy of a shared recipe (inverse of cloneToMine). Flips the
  // source card back to "Enregistrer" and refreshes the shared library cache.
  const uncloneFromMine = async (recipe: Recipe) => {
    if (isCloning.value) return
    isCloning.value = recipe.id
    // MAJ optimiste : retour à « non enregistrée » et compteur −1.
    const item = items.value.find(r => r.id === recipe.id)
    if (item) {
      item.alreadySaved = false
      item.savesCount = Math.max(0, item.savesCount - 1)
    }
    try {
      await uncloneRecipe(recipe.id)
      toast.success('Recette retirée de tes recettes.')
    }
    catch {
      if (item) {
        item.alreadySaved = true
        item.savesCount += 1
      }
      toast.error('Impossible de retirer cette recette.')
    }
    finally {
      isCloning.value = null
    }
  }

  // Delete-with-confirmation flow.
  const confirmTarget = ref<Recipe | null>(null)
  const isDeleting = ref(false)

  const askDelete = (recipe: Recipe) => {
    confirmTarget.value = recipe
  }

  const cancelDelete = () => {
    confirmTarget.value = null
  }

  const confirmDelete = async () => {
    const target = confirmTarget.value
    if (!target) return
    isDeleting.value = true
    try {
      await api(`/recipes/${target.id}`, { method: 'DELETE' })
      // Drop locally to avoid a scroll jump, keep the count honest, and refresh
      // the shared library cache used by the planning's recipe picker.
      items.value = items.value.filter(item => item.id !== target.id)
      total.value = Math.max(0, total.value - 1)
      await refreshNuxtData('recipes')
      toast.success('Recette supprimée.')
      confirmTarget.value = null
    }
    catch {
      toast.error('Suppression impossible.')
    }
    finally {
      isDeleting.value = false
    }
  }

  // Resolve the profile + regime catalog first so the default regime filter is
  // applied within the initial request (no empty-then-filtered double load).
  onMounted(async () => {
    await Promise.all([profileStore.ensureLoaded(), ensureRegimesLoaded()])
    applyProfileDefaults()
    await load()
    initialized.value = true
  })

  return {
    scope,
    items,
    total,
    pending,
    loadingMore,
    error,
    hasMore,
    hasActiveFilter,
    loadMore,
    refresh,
    reload: refresh,
    isCloning,
    cloneToMine,
    uncloneFromMine,
    mealTypes,
    selectedMealTypeIds,
    dietaryRegimes,
    selectedDietaryRegimeIds,
    search,
    detailed,
    toggleView,
    sorts,
    sortOptions,
    confirmTarget,
    isDeleting,
    askDelete,
    cancelDelete,
    confirmDelete,
  }
}
