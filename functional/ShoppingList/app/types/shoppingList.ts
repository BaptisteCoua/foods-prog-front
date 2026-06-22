// Mirrors the backend shopping-list contract (GET /shopping-list?from&to).
// The API groups every planned recipe ingredient over the range by ingredient,
// sums the required quantity and computes the cost — never recompute here.
// `quantity` is in g/ml, `costCents` is integer cents.

export type UnitType = 'WEIGHT' | 'VOLUME'

// One aggregated grocery line (one ingredient, summed over the whole period).
export interface ShoppingListLine {
  ingredientId: number
  name: string
  unitType: UnitType
  quantity: number
  costCents: number
}

// Response of GET /shopping-list?from&to: the lines + the total cost.
export interface ShoppingList {
  from: string
  to: string
  lines: ShoppingListLine[]
  totalCostCents: number
}

// The period presets offered by the selector. All resolve to a { from, to }.
export type PresetKey = 'day' | 'week' | 'month' | 'custom'

// A resolved date range (local 'YYYY-MM-DD' strings, inclusive bounds).
export interface Period {
  from: string
  to: string
}
