import { toast } from 'vue3-toastify'
import type { Ingredient } from '../types/ingredient'

// Page-level logic for the ingredient list: client-side search, plus the
// delete-with-confirmation flow. Data + mutations come from useIngredients.
export const useIngredientList = () => {
  const { items, pending, error, refresh, remove } = useIngredients()

  const search = ref('')
  const selectedFoodTypeIds = ref<number[]>([])
  const confirmTarget = ref<Ingredient | null>(null)
  const isDeleting = ref(false)

  const listView = useListViewStore()
  const detailed = computed(() => listView.isDetailed('ingredients'))
  const toggleView = () => listView.toggle('ingredients')

  const filteredItems = computed(() => {
    const query = search.value.trim().toLowerCase()
    const typeIds = selectedFoodTypeIds.value
    return items.value.filter((item) => {
      const matchesQuery = !query || item.name.toLowerCase().includes(query)
      const matchesType = !typeIds.length || item.foodTypes.some(type => typeIds.includes(type.id))
      return matchesQuery && matchesType
    })
  })

  const askDelete = (ingredient: Ingredient) => {
    confirmTarget.value = ingredient
  }

  const cancelDelete = () => {
    confirmTarget.value = null
  }

  const confirmDelete = async () => {
    if (!confirmTarget.value) return
    isDeleting.value = true
    try {
      await remove(confirmTarget.value.id)
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

  return {
    items,
    filteredItems,
    pending,
    error,
    refresh,
    search,
    selectedFoodTypeIds,
    detailed,
    toggleView,
    confirmTarget,
    isDeleting,
    askDelete,
    cancelDelete,
    confirmDelete,
  }
}
