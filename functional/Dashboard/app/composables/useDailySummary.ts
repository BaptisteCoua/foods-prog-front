import { toast } from 'vue3-toastify'

export interface MacroSummary {
  key: string
  label: string
  consumed: number
  target: number
  unit: string
  color: string
}

// One dish of today. A planned recipe is ticked off (the eaten checkbox); a
// logged hors-plan line (ingredient / free) is already eaten by definition and
// shows a "hors plan" badge instead.
export interface DayDish {
  id: number
  name: string
  slot: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
  slotLabel: string
  // Secondary label: "120 g" for an ingredient, "×2 portions" for a recipe.
  detail: string
  kcal: number
  eaten: boolean
  // true for an ingredient / free line — logged off the plan.
  logged: boolean
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
  id: number
  eaten: boolean
  kind: 'RECIPE' | 'INGREDIENT' | 'FREE'
  portions: number | null
  quantity: number | null
  total: MealNutrition
  recipe: { name: string } | null
  ingredient: { name: string, unitType: 'WEIGHT' | 'VOLUME' } | null
  name: string | null
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
  // Planned total (every meal) vs consumed total (ticked dishes only) — both API-side.
  total: MealNutrition
  consumed: MealNutrition
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

// Chronological render order of the slots, derived from the (ordered) label keys:
// petit-déjeuner en premier, puis déjeuner, dîner, collation. Used to sort today's
// meals before flattening their dishes — the API doesn't guarantee slot order.
const SLOT_ORDER = Object.keys(SLOT_LABELS) as (keyof typeof SLOT_LABELS)[]
const slotRank = (slot: keyof typeof SLOT_LABELS): number => {
  const index = SLOT_ORDER.indexOf(slot)
  return index === -1 ? SLOT_ORDER.length : index
}

const EMPTY_NUTRITION: MealNutrition = { calories: 0, proteinG: 0, carbG: 0, fatG: 0 }

// Real daily summary for the dashboard: the user's nutrition target (GET /me/target)
// and today's meals (GET /meals?from=today&to=today). The hero compares what the user
// has actually ticked as eaten (day.consumed) against the target; the planned total
// (day.total) is shown alongside so the gap between intention and reality is visible.
// When the user hasn't set up a profile/target yet, the target call fails and we
// surface an onboarding state instead of numbers.
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

  // Every line of today, kept as a reactive reference into the fetched data so a
  // tick mutates it in place (optimistic — no refetch).
  const todayItems = computed<PlanningMealItem[]>(() =>
    (data.value?.day?.meals ?? []).flatMap(meal => meal.mealItems),
  )

  // Consumed is derived locally by summing the API-computed line totals of the
  // ticked dishes. We aggregate, never recompute nutrition — so checking a dish
  // updates the hero instantly without regenerating the page.
  const consumed = computed<MealNutrition>(() =>
    todayItems.value
      .filter(item => item.eaten)
      .reduce(
        (acc, item) => ({
          calories: acc.calories + item.total.calories,
          proteinG: acc.proteinG + item.total.proteinG,
          carbG: acc.carbG + item.total.carbG,
          fatG: acc.fatG + item.total.fatG,
        }),
        { ...EMPTY_NUTRITION },
      ),
  )
  const planned = computed(() => data.value?.day?.total ?? EMPTY_NUTRITION)

  // Only fall back to skeletons / error on the very first load (no data yet). Once
  // the page is populated, a background refresh keeps the ready view mounted — so
  // ticking a dish refreshes the numbers in place without regenerating the page.
  const status = computed<DashboardStatus>(() => {
    if (pending.value && !data.value) return 'loading'
    if (error.value && !data.value) return 'error'
    if (!target.value) return 'onboarding'
    return 'ready'
  })

  const calorieTarget = computed(() => Math.round(target.value?.calories ?? 0))
  const calorieConsumed = computed(() => Math.round(consumed.value.calories))
  const caloriePlanned = computed(() => Math.round(planned.value.calories))
  const calorieRemaining = computed(() => Math.max(0, calorieTarget.value - calorieConsumed.value))
  const calorieProgress = computed(() =>
    calorieTarget.value > 0 ? calorieConsumed.value / calorieTarget.value : 0,
  )
  // Share of the planned intake the user has actually ticked off (0..1).
  const plannedProgress = computed(() =>
    calorieTarget.value > 0 ? caloriePlanned.value / calorieTarget.value : 0,
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

  const dishName = (item: PlanningMealItem): string =>
    item.recipe?.name ?? item.ingredient?.name ?? item.name ?? 'Plat'

  const dishDetail = (item: PlanningMealItem): string => {
    if (item.kind === 'INGREDIENT' && item.ingredient && item.quantity != null) {
      const unit = item.ingredient.unitType === 'VOLUME' ? 'ml' : 'g'
      return `${Math.round(item.quantity)} ${unit}`
    }
    if (item.kind === 'RECIPE' && item.portions != null && item.portions !== 1) {
      const value = Number.isInteger(item.portions) ? String(item.portions) : item.portions.toFixed(1)
      return `×${value} portions`
    }
    return ''
  }

  // Every dish of today, flattened across meals in chronological slot order
  // (petit-déjeuner → déjeuner → dîner → collation) — the rows the user ticks.
  const dishes = computed<DayDish[]>(() =>
    [...(data.value?.day?.meals ?? [])]
      .sort((a, b) => slotRank(a.slot) - slotRank(b.slot))
      .flatMap(meal =>
        meal.mealItems.map(item => ({
          id: item.id,
          name: dishName(item),
          slot: meal.slot,
          slotLabel: SLOT_LABELS[meal.slot] ?? 'Repas',
          detail: dishDetail(item),
          kcal: Math.round(item.total.calories),
          eaten: item.eaten,
          logged: item.kind !== 'RECIPE',
        })),
      ),
  )

  const hasPlannedMeals = computed(() => dishes.value.length > 0)
  const eatenCount = computed(() => dishes.value.filter(dish => dish.eaten).length)

  // kcal eaten from hors-plan logs only (ingredient / free lines) — surfaced
  // alongside the hero so the off-plan share is visible, not hidden.
  const horsPlanConsumed = computed(() =>
    Math.round(
      todayItems.value
        .filter(item => item.eaten && item.kind !== 'RECIPE')
        .reduce((sum, item) => sum + item.total.calories, 0),
    ),
  )

  // Gentle "rien noté ce midi ?" prompt: it's the afternoon and nothing has
  // been eaten at lunch yet. Non-blocking — just a reminder you can still log.
  const showLunchNudge = computed(() => {
    if (status.value !== 'ready') return false
    if (new Date().getHours() < 14) return false
    return !dishes.value.some(dish => dish.slot === 'LUNCH' && dish.eaten)
  })

  // Tick / untick a dish: flip the local flag for instant feedback, persist, then
  // refresh to reconcile with the server. The refresh no longer flickers (status
  // stays 'ready' while data exists). Revert + toast on failure.
  const toggleDish = async (id: number, eaten: boolean) => {
    const item = todayItems.value.find(dish => dish.id === id)
    if (!item) return
    const previous = item.eaten
    item.eaten = eaten
    try {
      await api(`/meal-items/${id}`, { method: 'PUT', body: { eaten } })
      await refresh()
    }
    catch {
      item.eaten = previous
      toast.error('Mise à jour impossible.')
    }
  }

  // Remove a line (used to undo a wrong hors-plan log). Server then refresh.
  const removeDish = async (id: number) => {
    try {
      await api(`/meal-items/${id}`, { method: 'DELETE' })
      await refresh()
    }
    catch {
      toast.error('Suppression impossible.')
    }
  }

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
    caloriePlanned,
    calorieRemaining,
    calorieProgress,
    plannedProgress,
    macros,
    dishes,
    hasPlannedMeals,
    eatenCount,
    horsPlanConsumed,
    showLunchNudge,
    toggleDish,
    removeDish,
  }
}

const toIsoDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
