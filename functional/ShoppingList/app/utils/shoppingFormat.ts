import type { UnitType } from '../types/shoppingList'

// Display helpers for the shopping list. Quantities come in g/ml, prices in
// integer cents — all conversions to human units live here.

export const centsToEuros = (cents: number): number => cents / 100

// Integer cents → « 12,34 € » (French formatting, 2 decimals).
export const formatTotalPrice = (cents: number): string => {
  const euros = centsToEuros(cents).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${euros} €`
}

// A g/ml quantity → human label, rolling up to kg/L past 1000 (e.g. 1250 g →
// « 1,25 kg », 300 ml → « 300 ml »). Trailing zeros are trimmed.
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
