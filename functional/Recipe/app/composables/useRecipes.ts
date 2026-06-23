import type { Paginated, Recipe, RecipePayload, RecipeVisibility } from '../types/recipe'

// Loads the recipe library and exposes CRUD. Keyed shared state ('recipes') so
// the list, form and detail page stay in sync; every mutation refreshes it.
// The backend returns each recipe with computed `total` / `perServing`.
export const useRecipes = () => {
  const api = useApi()

  const { data, pending, error, refresh } = useAsyncData('recipes', () =>
    api<Paginated<Recipe>>('/recipes', { query: { limit: 100 } }),
  )

  const items = computed(() => data.value?.items ?? [])

  const create = async (payload: RecipePayload) => {
    const recipe = await api<Recipe>('/recipes', { method: 'POST', body: payload })
    await refresh()
    return recipe
  }

  const update = async (id: number, payload: RecipePayload) => {
    const recipe = await api<Recipe>(`/recipes/${id}`, { method: 'PUT', body: payload })
    await refresh()
    return recipe
  }

  const remove = async (id: number) => {
    await api(`/recipes/${id}`, { method: 'DELETE' })
    await refresh()
  }

  // Clone a visible recipe (global catalog or another user's public one) into
  // the current user's own collection as an editable PRIVATE copy.
  const clone = async (id: number) => {
    const recipe = await api<Recipe>(`/recipes/${id}/clone`, { method: 'POST' })
    await refresh()
    return recipe
  }

  // Publish / unpublish one of the user's own recipes (PUBLIC ↔ PRIVATE).
  const setVisibility = async (id: number, visibility: RecipeVisibility) => {
    const recipe = await api<Recipe>(`/recipes/${id}`, { method: 'PUT', body: { visibility } })
    await refresh()
    return recipe
  }

  return { items, pending, error, refresh, create, update, remove, clone, setVisibility }
}
