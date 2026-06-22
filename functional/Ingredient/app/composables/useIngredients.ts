import type { Ingredient, IngredientPayload, Paginated } from '../types/ingredient'

// Loads the ingredient library and exposes the CRUD mutations. The list is keyed
// shared state ('ingredients'), so the form/list/delete all see the same data and
// every mutation refreshes it.
export const useIngredients = () => {
  const api = useApi()

  const { data, pending, error, refresh } = useAsyncData('ingredients', () =>
    api<Paginated<Ingredient>>('/ingredients', { query: { limit: 100 } }),
  )

  const items = computed(() => data.value?.items ?? [])

  const create = async (payload: IngredientPayload) => {
    await api<Ingredient>('/ingredients', { method: 'POST', body: payload })
    await refresh()
  }

  const update = async (id: number, payload: IngredientPayload) => {
    await api<Ingredient>(`/ingredients/${id}`, { method: 'PUT', body: payload })
    await refresh()
  }

  const remove = async (id: number) => {
    await api(`/ingredients/${id}`, { method: 'DELETE' })
    await refresh()
  }

  return { items, pending, error, refresh, create, update, remove }
}
