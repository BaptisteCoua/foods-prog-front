import type { Recipe } from '../../../Recipe/app/types/recipe'

// A meal-type section of the picker: its label and the recipes tagged with it.
export interface RecipeGroup {
  key: string
  label: string
  recipes: Recipe[]
}

// Feeds the "add a recipe" bottom sheet: the user's OWN recipe library (reused
// from the Recipe layer — scope MINE, no global catalog) plus a client-side
// search. Results are grouped by meal type ("plats") so it's clear at a glance
// which course each recipe belongs to. Loaded once and shared, so opening the
// sheet on any slot is instant.
export const useRecipePicker = () => {
  const { items, pending } = useRecipes()
  const { mealTypes } = useMealTypes()

  const search = ref('')

  const results = computed<Recipe[]>(() => {
    const query = search.value.trim().toLowerCase()
    const base = [...items.value].sort((a, b) => a.name.localeCompare(b.name, 'fr'))
    if (!query) return base
    return base.filter(recipe => recipe.name.toLowerCase().includes(query))
  })

  // Group the (filtered, name-sorted) results by meal type. A recipe tagged
  // with several meal types appears under each. Recipes without a meal type
  // fall into a trailing "Autres" group. Groups follow the reference meal-type
  // order (GET /meal-types) when known, else alphabetical.
  const groups = computed<RecipeGroup[]>(() => {
    const list = results.value
    const orderIndex = new Map(mealTypes.value.map((type, index) => [type.id, index]))

    const present = new Map<number, string>()
    for (const recipe of list) {
      for (const type of recipe.mealTypes) {
        if (!present.has(type.id)) present.set(type.id, type.name)
      }
    }

    const sortedTypes = [...present.entries()].sort(([idA, nameA], [idB, nameB]) => {
      const rankA = orderIndex.get(idA) ?? Number.POSITIVE_INFINITY
      const rankB = orderIndex.get(idB) ?? Number.POSITIVE_INFINITY
      if (rankA !== rankB) return rankA - rankB
      return nameA.localeCompare(nameB, 'fr')
    })

    const result: RecipeGroup[] = sortedTypes.map(([id, name]) => ({
      key: `meal-type-${id}`,
      label: name,
      recipes: list.filter(recipe => recipe.mealTypes.some(type => type.id === id)),
    }))

    const uncategorized = list.filter(recipe => !recipe.mealTypes.length)
    if (uncategorized.length) {
      result.push({ key: 'uncategorized', label: 'Autres', recipes: uncategorized })
    }

    return result
  })

  const reset = () => {
    search.value = ''
  }

  return { results, groups, pending, search, reset }
}
