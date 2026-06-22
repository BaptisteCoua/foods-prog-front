import { toast } from 'vue3-toastify'
import type { Recipe } from '../types/recipe'

// Page-level logic for the recipe list: client-side search + delete-with-
// confirmation. Data + mutations come from useRecipes.
export const useRecipeList = () => {
  const { items, pending, error, refresh, remove } = useRecipes()

  const search = ref('')
  const confirmTarget = ref<Recipe | null>(null)
  const isDeleting = ref(false)

  const filteredItems = computed(() => {
    const query = search.value.trim().toLowerCase()
    if (!query) return items.value
    return items.value.filter(item => item.name.toLowerCase().includes(query))
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
