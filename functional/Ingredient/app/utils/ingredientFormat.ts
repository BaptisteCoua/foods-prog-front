import type { UnitType } from '../types/ingredient'

// Display helpers for ingredient units. Nutrition is per 100 g/ml; price is in
// integer cents per kg/L. All conversions to human units live here.

export const baseQuantityLabel = (unitType: UnitType): string =>
  unitType === 'VOLUME' ? '100 ml' : '100 g'

export const priceUnitLabel = (unitType: UnitType): string =>
  unitType === 'VOLUME' ? '/L' : '/kg'

export const centsToEuros = (cents: number): number => cents / 100

export const eurosToCents = (euros: number): number => Math.round(euros * 100)

export const formatPrice = (cents: number, unitType: UnitType): string => {
  const euros = centsToEuros(cents).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${euros} €${priceUnitLabel(unitType)}`
}
