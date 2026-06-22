import type { Recipe } from '../types/recipe'

// Single recipe for the detail page (GET /recipes/:id) with its computed
// nutrition. Keyed per id so navigating between recipes refetches.
export const useRecipeDetail = (id: MaybeRefOrGetter<number>) => {
  const api = useApi()

  const { data, pending, error, refresh } = useAsyncData(
    () => `recipe-${toValue(id)}`,
    () => api<Recipe>(`/recipes/${toValue(id)}`),
    { watch: [() => toValue(id)] },
  )

  return { recipe: data, pending, error, refresh }
}
