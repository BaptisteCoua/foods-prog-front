// Display helpers for recipes. Cost comes from the API in integer cents; macros
// are decimals rounded only here. Quantities are g (WEIGHT) or ml (VOLUME).
import type { UnitType } from '../../../Ingredient/app/types/ingredient'

export const formatCost = (cents: number): string => {
  const euros = (cents / 100).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${euros} €`
}

export const formatKcal = (calories: number): string =>
  `${Math.round(calories)} kcal`

export const formatMacro = (grams: number): string =>
  `${Math.round(grams)} g`

// "12 enregistrements" — popularity metric (number of users who saved it).
export const formatSaves = (count: number): string =>
  `${count} enregistrement${count > 1 ? 's' : ''}`

export const quantityUnit = (unitType: UnitType): string =>
  unitType === 'VOLUME' ? 'ml' : 'g'

// Scaled quantities can be fractional; keep one decimal only when needed.
export const formatQuantity = (quantity: number): string => {
  const rounded = Math.round(quantity * 10) / 10
  return Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toLocaleString('fr-FR', { maximumFractionDigits: 1 })
}

// Cooked weight ≈ raw weight × cookingYield. Nutrition stays computed from the
// raw quantity (it is conserved on cooking); this is only an at-a-glance hint of
// how much the ingredient weighs once cooked. `null` when no yield is set.
export const formatCookedWeight = (
  rawQuantity: number,
  cookedFactor: number | null,
  unitType: UnitType,
): string | null => {
  if (!cookedFactor || cookedFactor === 1) return null
  return `≈ ${formatQuantity(rawQuantity * cookedFactor)} ${quantityUnit(unitType)} cuit`
}

// "25 min" / "1 h 10" / "—" — sums prep + cook time.
export const formatTotalTime = (
  prepTimeMin: number | null,
  cookTimeMin: number | null,
): string => {
  const total = (prepTimeMin ?? 0) + (cookTimeMin ?? 0)
  if (!total) return '—'
  if (total < 60) return `${total} min`
  const hours = Math.floor(total / 60)
  const minutes = total % 60
  return minutes ? `${hours} h ${minutes}` : `${hours} h`
}
