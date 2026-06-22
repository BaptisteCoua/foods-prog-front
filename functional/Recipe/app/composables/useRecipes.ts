import type { Paginated, Recipe, RecipePayload } from '../types/recipe'

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

  return { items, pending, error, refresh, create, update, remove }
}
