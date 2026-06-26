// Display helpers for a meal line, whatever its kind (recipe / ingredient /
// free). Since logged hors-plan lines (ingredient & free) now live in the same
// meals as planned recipes, every consumer must read a line through these
// helpers rather than assuming `item.recipe` is set.
import type { MealItem } from '../types/planning'

export const isRecipeItem = (item: MealItem): boolean =>
  item.kind === 'RECIPE' && Boolean(item.recipe)

/** Name to display for any line. */
export const mealItemName = (item: MealItem): string => {
  if (item.kind === 'INGREDIENT') return item.ingredient?.name ?? 'Aliment'
  if (item.kind === 'FREE') return item.name ?? 'Repas libre'
  return item.recipe?.name ?? 'Plat'
}

/** Meal-type tag names of a line — empty for non-recipe lines. */
export const mealItemCourseTags = (item: MealItem): string[] =>
  item.recipe?.mealTypes?.map(type => type.name) ?? []

const formatQty = (value: number): string => {
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

/** Secondary label: quantity for an ingredient, portions for a recipe. */
export const mealItemDetail = (item: MealItem): string => {
  if (item.kind === 'INGREDIENT' && item.ingredient && item.quantity != null) {
    const unit = item.ingredient.unitType === 'VOLUME' ? 'ml' : 'g'
    return `${formatQty(item.quantity)} ${unit}`
  }
  if (item.kind === 'RECIPE' && item.portions != null && item.portions !== 1) {
    return `×${formatQty(item.portions)} portions`
  }
  return ''
}
