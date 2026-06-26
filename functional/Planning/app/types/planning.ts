// Mirrors the backend meal-planning contract (GET /meals?from&to, POST /meals,
// PUT /meals/:id, POST /meal-items/:mealId, DELETE /meal-items/:id).
// The API pre-joins everything per day and computes nutrition + cost server-side
// — never recompute here. Cost is integer cents; calories/macros are decimals.
import type { Ingredient } from '../../../Ingredient/app/types/ingredient'
import type { Recipe } from '../../../Recipe/app/types/recipe'

// The four time slots a meal can occupy (matches the backend MealSlot enum).
export type MealSlot = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'

// Nature of a meal line (matches the backend MealItemKind enum):
//  - RECIPE     : `portions` of a `recipe` (the planning board) ;
//  - INGREDIENT : a `quantity` (g/ml) of a single `ingredient` (quick-logged) ;
//  - FREE       : a free-text `name` with frozen macros (e.g. a meal eaten out).
export type MealItemKind = 'RECIPE' | 'INGREDIENT' | 'FREE'

// Aggregated macros + cost (cost in cents, unrounded).
export interface MealNutrition {
  calories: number
  proteinG: number
  carbG: number
  fatG: number
  costCents: number
}

// Daily nutrition target (no cost). Null on a day when the user has no profile.
export interface TargetMacros {
  calories: number
  proteinG: number
  carbG: number
  fatG: number
}

// One line of a meal. Polymorphic via `kind`: a recipe (portions), a single
// ingredient (quantity in g/ml) or a free entry (name + frozen macros). Only the
// fields relevant to the line's `kind` are set; the others are null. `total` is
// the line's nutrition, always computed API-side. `eaten` is the user's tick.
export interface MealItem {
  id: number
  kind: MealItemKind
  // RECIPE
  portions: number | null
  recipe: Recipe | null
  // INGREDIENT
  quantity: number | null
  ingredient: Ingredient | null
  // FREE
  name: string | null
  total: MealNutrition
  eaten: boolean
}

// A meal (one slot on one date) with its computed nutrition total.
export interface MealWithTotal {
  id: number
  date: string
  slot: MealSlot
  mealItems: MealItem[]
  total: MealNutrition
}

// One day of the planning: its meals, the day total, the target and the gap
// (target − actual) — all computed by the API.
export interface DayPlan {
  date: string
  meals: MealWithTotal[]
  // Planned total of the day (sum of every meal).
  total: MealNutrition
  // Consumed total: sum of the lines ticked as eaten only.
  consumed: MealNutrition
  target: TargetMacros | null
  gap: TargetMacros | null
}

// Response of GET /meals?from&to.
export interface PlanningResult {
  from: string
  to: string
  days: DayPlan[]
}

// Body of POST /meal-items/:mealId and of each entry in CreateMealPayload.mealItems.
export interface MealItemPayload {
  portions: number
  recipe: { id: number }
}

// Body of POST /meals (and, partially, PUT /meals/:id).
export interface CreateMealPayload {
  date: string
  slot: MealSlot
  mealItems?: MealItemPayload[]
}

// Body of the line in POST /meals/log — discriminated by `kind`. `eaten`
// defaults to true server-side (a log records what was actually eaten).
export type LogItemPayload
  = | { kind: 'RECIPE', portions: number, recipe: { id: number }, eaten?: boolean }
    | { kind: 'INGREDIENT', quantity: number, ingredient: { id: number }, eaten?: boolean }
    | {
      kind: 'FREE'
      name: string
      calories: number
      proteinG?: number
      carbG?: number
      fatG?: number
      eaten?: boolean
    }

// Body of POST /meals/log: drop a line on a (date, slot); the meal is created
// for that slot if it doesn't exist yet.
export interface LogMealPayload {
  date: string
  slot: MealSlot
  item: LogItemPayload
}
