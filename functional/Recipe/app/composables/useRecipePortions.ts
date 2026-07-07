import type { Recipe, RecipeNutrition } from '../types/recipe'

// Client-side portion simulator for the detail page. The API stores nutrition
// for the recipe's own `servings`; per-serving values are invariant when you
// cook for more/fewer people, so scaling only multiplies the WHOLE-recipe
// quantities (ingredients + `total`) by `portions / recipe.servings`.
// Nothing is persisted — this is a visualisation aid for cooking for N people.
const DEFAULT_PORTIONS = 1

export const useRecipePortions = (recipe: Ref<Recipe | null | undefined>) => {
  const portions = ref(DEFAULT_PORTIONS)

  // Reset to a single portion whenever the recipe (re)loads.
  watch(
    recipe,
    (value) => {
      if (value) portions.value = DEFAULT_PORTIONS
    },
    { immediate: true },
  )

  const scaleFactor = computed(() => {
    const base = recipe.value?.servings ?? 1
    return base ? portions.value / base : 1
  })

  const isScaled = computed(() => portions.value !== DEFAULT_PORTIONS)

  const scaleNutrition = (nutrition: RecipeNutrition): RecipeNutrition => ({
    calories: nutrition.calories * scaleFactor.value,
    proteinG: nutrition.proteinG * scaleFactor.value,
    carbG: nutrition.carbG * scaleFactor.value,
    fatG: nutrition.fatG * scaleFactor.value,
    costCents: nutrition.costCents * scaleFactor.value,
  })

  // Whole-recipe total scaled to the chosen portions.
  const scaledTotal = computed(() =>
    recipe.value ? scaleNutrition(recipe.value.total) : null,
  )

  // Ingredient lines with quantities scaled to the chosen portions.
  const scaledIngredients = computed(() =>
    (recipe.value?.recipeIngredients ?? []).map(line => ({
      id: line.id,
      name: line.ingredient.name,
      imageUrl: line.ingredient.imageUrl,
      foodTypes: line.ingredient.foodTypes,
      unitType: line.ingredient.unitType,
      cookedFactor: line.ingredient.cookedFactor,
      quantity: line.quantity * scaleFactor.value,
    })),
  )

  const increment = () => {
    portions.value += 1
  }

  const decrement = () => {
    if (portions.value > 1) portions.value -= 1
  }

  const reset = () => {
    portions.value = DEFAULT_PORTIONS
  }

  return {
    portions,
    isScaled,
    scaledTotal,
    scaledIngredients,
    increment,
    decrement,
    reset,
  }
}
