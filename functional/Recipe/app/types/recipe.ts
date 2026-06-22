// Mirrors the backend Recipe contract (/recipes, /meal-types).
// The API computes nutrition + cost server-side and returns `total` (whole
// recipe) and `perServing` (÷ servings). Cost is integer cents; quantities are
// in g/ml for the WHOLE recipe (not per serving).
import type { Ingredient } from '../../../Ingredient/app/types/ingredient'

export interface MealType {
  id: number
  name: string
}

// Aggregated macros + cost (cost in cents, unrounded).
export interface RecipeNutrition {
  calories: number
  proteinG: number
  carbG: number
  fatG: number
  costCents: number
}

// A recipe line as returned by the API: a quantity of a (full) ingredient.
export interface RecipeIngredientLine {
  id: number
  quantity: number
  ingredient: Ingredient
}

export interface Recipe {
  id: number
  name: string
  description: string | null
  steps: string | null
  img: string | null
  servings: number
  prepTimeMin: number | null
  cookTimeMin: number | null
  recipeIngredients: RecipeIngredientLine[]
  mealTypes: MealType[]
  total: RecipeNutrition
  perServing: RecipeNutrition
}

export interface RecipePayload {
  name: string
  description?: string
  steps?: string
  img?: string
  servings: number
  prepTimeMin?: number
  cookTimeMin?: number
  mealTypes?: { id: number }[]
  recipeIngredients?: { quantity: number, ingredient: { id: number } }[]
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pageCount: number
}
