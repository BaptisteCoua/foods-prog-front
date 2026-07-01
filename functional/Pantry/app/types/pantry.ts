// Mirrors the backend pantry contract (GET /pantry). `availableQuantity` =
// purchased − consumed, the consumed part being derived from meals marked eaten.
// It may be negative ("en manque") when more was eaten than bought. Quantities
// are in g/ml (per the ingredient's unitType).

export type UnitType = 'WEIGHT' | 'VOLUME'

// One stock line of the pantry.
export interface PantryLine {
  id: number
  ingredientId: number
  name: string
  unitType: UnitType
  purchasedQuantity: number
  consumedQuantity: number
  availableQuantity: number
}

// PUT /pantry — set the desired AVAILABLE quantity for an ingredient.
export interface PantrySetPayload {
  ingredientId: number
  quantity: number
}

// PATCH /pantry/adjust — add a signed delta to the purchased balance ("buy" = +).
export interface PantryAdjustPayload {
  ingredientId: number
  delta: number
}
