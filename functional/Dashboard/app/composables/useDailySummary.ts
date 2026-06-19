export interface MacroSummary {
  key: string
  label: string
  consumed: number
  target: number
  unit: string
  color: string
}

// Placeholder daily summary for the dashboard shell. Slice "Profil & cible" will
// replace the static targets with GET /me/target, and meal planning will feed
// `consumed` from the day's planned meals.
export const useDailySummary = () => {
  const macros = ref<MacroSummary[]>([
    { key: 'calories', label: 'Calories', consumed: 0, target: 2100, unit: 'kcal', color: 'primary' },
    { key: 'protein', label: 'Protéines', consumed: 0, target: 140, unit: 'g', color: 'secondary' },
    { key: 'carb', label: 'Glucides', consumed: 0, target: 230, unit: 'g', color: 'tertiary' },
    { key: 'fat', label: 'Lipides', consumed: 0, target: 70, unit: 'g', color: 'info' },
  ])

  const hasPlannedMeals = ref(false)

  return { macros, hasPlannedMeals }
}
