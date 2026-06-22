// Mirrors the backend meal-planning contract (GET /meals?from&to, POST /meals,
// PUT /meals/:id, POST /meal-items/:mealId, DELETE /meal-items/:id).
// The API pre-joins everything per day and computes nutrition + cost server-side
// — never recompute here. Cost is integer cents; calories/macros are decimals.
import type { Recipe } from '../../../Recipe/app/types/recipe'

// The four time slots a meal can occupy (matches the backend MealSlot enum).
export type MealSlot = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'

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

// One recipe placed in a meal, with how many portions of it are served.
// `total` is the line's nutrition (per-portion × portions), computed API-side.
export interface MealItem {
  id: number
  portions: number
  recipe: Recipe
  total: MealNutrition
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
  total: MealNutrition
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
