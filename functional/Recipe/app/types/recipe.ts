// Mirrors the backend Recipe contract (/recipes, /meal-types).
// The API computes nutrition + cost server-side and returns `total` (whole
// recipe) and `perServing` (÷ servings). Cost is integer cents; quantities are
// in g/ml for the WHOLE recipe (not per serving).
import type { Ingredient } from '../../../Ingredient/app/types/ingredient'

export interface MealType {
  id: number
  name: string
}

// A dietary regime tag (/dietary-regimes): vegetarian, vegan, gluten-free…
export interface DietaryRegime {
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

// Sharing scope of a personal recipe. FRIENDS is reserved (friends feature not
// implemented yet). The global reference catalog (userId null) is independent.
export type RecipeVisibility = 'PRIVATE' | 'PUBLIC' | 'FRIENDS'

// Reduced author info, only present on shared recipes (GET /recipes/shared).
export interface RecipeAuthor {
  displayName: string | null
  picture?: string | null
}

export interface Recipe {
  id: number
  // null = global reference catalog; otherwise the owner's id.
  userId: number | null
  visibility: RecipeVisibility
  // Set on clones: id of the source recipe (catalog or another user's public).
  sourceRecipeId?: number | null
  // On clonable recipes (catalog / shared): true if I already saved a copy.
  alreadySaved?: boolean
  // Number of likes received (denormalised, maintained server-side).
  likesCount: number
  // On likable recipes (catalog / shared): true if the current user liked it.
  liked?: boolean
  name: string
  description: string | null
  steps: string | null
  img: string | null
  servings: number
  prepTimeMin: number | null
  cookTimeMin: number | null
  recipeIngredients: RecipeIngredientLine[]
  mealTypes: MealType[]
  dietaryRegimes: DietaryRegime[]
  total: RecipeNutrition
  perServing: RecipeNutrition
  author?: RecipeAuthor
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
  dietaryRegimes?: { id: number }[]
  recipeIngredients?: { quantity: number, ingredient: { id: number } }[]
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pageCount: number
}
