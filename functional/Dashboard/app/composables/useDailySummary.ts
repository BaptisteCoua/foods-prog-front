export interface MacroSummary {
  key: string
  label: string
  consumed: number
  target: number
  unit: string
  color: string
}

export interface PlannedMeal {
  id: number
  title: string
  slotLabel: string
  portions: number
  kcal: number
  from: string
  to: string
}

type DashboardStatus = 'loading' | 'onboarding' | 'error' | 'ready'

interface NutritionTargetResponse {
  calories: number
  proteinG: number
  carbG: number
  fatG: number
}

interface MealNutrition {
  calories: number
  proteinG: number
  carbG: number
  fatG: number
}

interface PlanningMealItem {
  portions: number
  recipe: { name: string } | null
}

interface PlanningMeal {
  id: number
  slot: keyof typeof SLOT_LABELS
  total: MealNutrition
  mealItems: PlanningMealItem[]
}

interface PlanningDay {
  date: string
  meals: PlanningMeal[]
  total: MealNutrition
}

interface PlanningResult {
  days: PlanningDay[]
}

const SLOT_LABELS = {
  BREAKFAST: 'Petit-déjeuner',
  LUNCH: 'Déjeuner',
  DINNER: 'Dîner',
  SNACK: 'Collation',
} as const

const MEAL_GRADIENTS = [
  { from: '#818CF8', to: '#34D399' },
  { from: '#F59E0B', to: '#FB7185' },
  { from: '#34D399', to: '#22D3EE' },
  { from: '#FB7185', to: '#F59E0B' },
]

const EMPTY_NUTRITION: MealNutrition = { calories: 0, proteinG: 0, carbG: 0, fatG: 0 }

// Real daily summary for the dashboard: the user's nutrition target (GET /me/target)
// and today's planned meals (GET /meals?from=today&to=today). When the user hasn't
// set up a profile/target yet, the target call fails and we surface an onboarding
// state instead of numbers.
export const useDailySummary = () => {
  const api = useApi()
  const today = toIsoDate(new Date())

  const { data, pending, error, refresh } = useAsyncData('dashboard-summary', async () => {
    const [target, planning] = await Promise.all([
      api<NutritionTargetResponse>('/me/target').catch(() => null),
      api<PlanningResult>('/meals', { query: { from: today, to: today } }),
    ])
    return { target, day: planning.days[0] ?? null }
  })

  const target = computed(() => data.value?.target ?? null)
  const consumed = computed(() => data.value?.day?.total ?? EMPTY_NUTRITION)

  const status = computed<DashboardStatus>(() => {
    if (pending.value) return 'loading'
    if (error.value) return 'error'
    if (!target.value) return 'onboarding'
    return 'ready'
  })

  const calorieTarget = computed(() => Math.round(target.value?.calories ?? 0))
  const calorieConsumed = computed(() => Math.round(consumed.value.calories))
  const calorieRemaining = computed(() => Math.max(0, calorieTarget.value - calorieConsumed.value))
  const calorieProgress = computed(() =>
    calorieTarget.value > 0 ? calorieConsumed.value / calorieTarget.value : 0,
  )

  const macros = computed<MacroSummary[]>(() => {
    const t = target.value
    if (!t) return []
    const c = consumed.value
    return [
      { key: 'protein', label: 'Protéines', consumed: Math.round(c.proteinG), target: Math.round(t.proteinG), unit: 'g', color: 'macro-protein' },
      { key: 'carb', label: 'Glucides', consumed: Math.round(c.carbG), target: Math.round(t.carbG), unit: 'g', color: 'macro-carb' },
      { key: 'fat', label: 'Lipides', consumed: Math.round(c.fatG), target: Math.round(t.fatG), unit: 'g', color: 'macro-fat' },
    ]
  })

  const meals = computed<PlannedMeal[]>(() =>
    (data.value?.day?.meals ?? []).map((meal, index) => ({
      id: meal.id,
      title: mealTitle(meal),
      slotLabel: SLOT_LABELS[meal.slot] ?? 'Repas',
      portions: meal.mealItems.reduce((sum, item) => sum + item.portions, 0),
      kcal: Math.round(meal.total.calories),
      ...MEAL_GRADIENTS[index % MEAL_GRADIENTS.length],
    })),
  )

  const hasPlannedMeals = computed(() => meals.value.length > 0)

  const dateLabel = computed(() => {
    const formatted = new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date())
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  })

  return {
    status,
    refresh,
    dateLabel,
    calorieTarget,
    calorieConsumed,
    calorieRemaining,
    calorieProgress,
    macros,
    meals,
    hasPlannedMeals,
  }
}

const mealTitle = (meal: PlanningMeal): string => {
  const names = meal.mealItems.map(item => item.recipe?.name).filter(Boolean)
  return names.length > 0 ? names.join(', ') : 'Repas'
}

const toIsoDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
