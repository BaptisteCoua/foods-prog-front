import type { Recipe } from '../../../Recipe/app/types/recipe'

// Feeds the "add a recipe" bottom sheet: the user's recipe library (reused from
// the Recipe layer) plus a client-side search. Loaded once and shared, so opening
// the sheet on any slot is instant.
export const useRecipePicker = () => {
  const { items, pending } = useRecipes()

  const search = ref('')

  const results = computed<Recipe[]>(() => {
    const query = search.value.trim().toLowerCase()
    const base = [...items.value].sort((a, b) => a.name.localeCompare(b.name, 'fr'))
    if (!query) return base
    return base.filter(recipe => recipe.name.toLowerCase().includes(query))
  })

  const reset = () => {
    search.value = ''
  }

  return { results, pending, search, reset }
}
