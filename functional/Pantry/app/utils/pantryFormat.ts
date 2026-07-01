import type { UnitType } from '../types/pantry'

// Display helpers for the pantry. Quantities come in g/ml. The formatter mirrors
// the shopping list's (per-layer duplication is the repo convention).

// A g/ml quantity → human label, rolling up to kg/L past 1000 (e.g. 1250 g →
// « 1,25 kg », 300 ml → « 300 ml »).
export const formatQuantity = (quantity: number, unitType: UnitType): string => {
  const isVolume = unitType === 'VOLUME'
  const smallUnit = isVolume ? 'ml' : 'g'
  const largeUnit = isVolume ? 'L' : 'kg'

  const format = (value: number): string =>
    value.toLocaleString('fr-FR', { maximumFractionDigits: 2 })

  if (quantity >= 1000) {
    return `${format(quantity / 1000)} ${largeUnit}`
  }
  return `${format(Math.round(quantity))} ${smallUnit}`
}

// The unit suffix (g / ml) for a quantity input field.
export const quantitySuffix = (unitType: UnitType): string =>
  unitType === 'VOLUME' ? 'ml' : 'g'
