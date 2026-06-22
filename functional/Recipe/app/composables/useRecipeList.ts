import { toast } from 'vue3-toastify'
import type { Recipe } from '../types/recipe'

// Page-level logic for the recipe list: client-side search + meal-type
// filtering + delete-with-confirmation. Data + mutations come from useRecipes,
// the filterable meal categories from useMealTypes.
export const useRecipeList = () => {
  const { items, pending, error, refresh, remove } = useRecipes()
  const { mealTypes } = useMealTypes()
  const { dietaryRegimes } = useDietaryRegimes()

  const search = ref('')
  const selectedMealTypeIds = ref<number[]>([])
  const selectedDietaryRegimeIds = ref<number[]>([])
  const confirmTarget = ref<Recipe | null>(null)
  const isDeleting = ref(false)

  // Progressive rendering: keep the whole (already-fetched + filtered) list in
  // memory but only mount a growing window of cards, +15 each time the bottom
  // sentinel scrolls into view.
  const PAGE_SIZE = 15
  const visibleCount = ref(PAGE_SIZE)

  // A recipe matches the search by name and each active filter (meal-type and
  // dietary-regime) when it carries at least one of the selected tags (an empty
  // selection means that filter is inactive).
  const filteredItems = computed(() => {
    const query = search.value.trim().toLowerCase()
    const typeIds = selectedMealTypeIds.value
    const regimeIds = selectedDietaryRegimeIds.value

    return items.value.filter((item) => {
      const matchesSearch = !query || item.name.toLowerCase().includes(query)
      const matchesType = !typeIds.length
        || item.mealTypes.some(type => typeIds.includes(type.id))
      const matchesRegime = !regimeIds.length
        || item.dietaryRegimes.some(regime => regimeIds.includes(regime.id))
      return matchesSearch && matchesType && matchesRegime
    })
  })

  // The slice actually rendered, and whether more remain to reveal.
  const visibleItems = computed(() => filteredItems.value.slice(0, visibleCount.value))
  const hasMore = computed(() => visibleCount.value < filteredItems.value.length)

  // Any change to the result set (search, filters, refetch) rewinds the window.
  watch(() => filteredItems.value.length, () => {
    visibleCount.value = PAGE_SIZE
  })

  // Called by the bottom sentinel's v-intersect when it enters the viewport.
  const loadMore = (isIntersecting: boolean) => {
    if (isIntersecting && hasMore.value) {
      visibleCount.value += PAGE_SIZE
    }
  }

  const askDelete = (recipe: Recipe) => {
    confirmTarget.value = recipe
  }

  const cancelDelete = () => {
    confirmTarget.value = null
  }

  const confirmDelete = async () => {
    if (!confirmTarget.value) return
    isDeleting.value = true
    try {
      await remove(confirmTarget.value.id)
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

  return {
    items,
    filteredItems,
    visibleItems,
    hasMore,
    loadMore,
    mealTypes,
    selectedMealTypeIds,
    dietaryRegimes,
    selectedDietaryRegimeIds,
    pending,
    error,
    refresh,
    search,
    confirmTarget,
    isDeleting,
    askDelete,
    cancelDelete,
    confirmDelete,
  }
}
