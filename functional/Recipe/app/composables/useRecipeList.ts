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
