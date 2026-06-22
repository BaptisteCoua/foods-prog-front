// Mirrors the backend Ingredient contract (/ingredients, /food-types).
// Nutrition values are per 100 g / 100 ml; price is stored as integer cents
// per kg (WEIGHT) or per litre (VOLUME).

export type UnitType = 'WEIGHT' | 'VOLUME'

export interface FoodType {
  id: number
  types: string
}

export interface Ingredient {
  id: number
  name: string
  unitType: UnitType
  calories: number
  proteinG: number
  carbG: number
  fatG: number
  pricePerKgCents: number
  foodTypes: FoodType[]
}

export interface IngredientPayload {
  name: string
  unitType: UnitType
  calories: number
  proteinG: number
  carbG: number
  fatG: number
  pricePerKgCents: number
  foodTypes?: { id: number }[]
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pageCount: number
}

export const UNIT_OPTIONS: { value: UnitType, label: string, icon: string }[] = [
  { value: 'WEIGHT', label: 'Solide (g)', icon: 'mdi-weight-gram' },
  { value: 'VOLUME', label: 'Liquide (ml)', icon: 'mdi-cup-water' },
]
