import type { CreateMealPayload, MealWithTotal, PlanningResult } from '../types/planning'

// Loads one week of planning (GET /meals?from&to) and exposes the mutations.
// Keyed by the week start so navigating weeks refetches; every mutation refreshes
// so the strip totals, day summary and slot cards stay in sync. Nutrition is
// computed server-side — we only ever send slots, recipe ids and portions.
export const usePlanningWeek = (
  from: MaybeRefOrGetter<string>,
  to: MaybeRefOrGetter<string>,
) => {
  const api = useApi()

  const { data, pending, error, refresh } = useAsyncData(
    () => `planning-${toValue(from)}`,
    () => api<PlanningResult>('/meals', { query: { from: toValue(from), to: toValue(to) } }),
    { watch: [() => toValue(from)] },
  )

  const days = computed(() => data.value?.days ?? [])

  // Add a recipe to a slot. If a meal already exists for that (date, slot) we
  // append an item to it; otherwise we create the meal with that first item.
  const addRecipe = async (params: {
    date: string
    slot: MealWithTotal['slot']
    recipeId: number
    portions?: number
    existingMealId?: number
  }) => {
    const portions = params.portions ?? 1
    if (params.existingMealId) {
      await api(`/meal-items/${params.existingMealId}`, {
        method: 'POST',
        body: { portions, recipe: { id: params.recipeId } },
      })
    }
    else {
      const body: CreateMealPayload = {
        date: params.date,
        slot: params.slot,
        mealItems: [{ portions, recipe: { id: params.recipeId } }],
      }
      await api('/meals', { method: 'POST', body })
    }
    await refresh()
  }

  // Remove one item. When it's the meal's last item we delete the whole meal so
  // the slot returns to empty rather than lingering as an empty meal.
  const removeItem = async (meal: MealWithTotal, itemId: number) => {
    if (meal.mealItems.length <= 1) {
      await api(`/meals/${meal.id}`, { method: 'DELETE' })
    }
    else {
      await api(`/meal-items/${itemId}`, { method: 'DELETE' })
    }
    await refresh()
  }

  // Change one item's portions in place via PUT /meal-items/:id. Updating the
  // single row (rather than replacing the meal's whole item list) keeps item ids
  // stable, so the open detail sheet stays bound to the same line. Server
  // recomputes the totals; we refresh to pull them.
  const setPortions = async (_meal: MealWithTotal, itemId: number, portions: number) => {
    await api(`/meal-items/${itemId}`, { method: 'PUT', body: { portions } })
    await refresh()
  }

  // Copy every (non-empty) meal of a source day onto each target date.
  const duplicateDay = async (sourceMeals: MealWithTotal[], targetDates: string[]) => {
    for (const date of targetDates) {
      for (const meal of sourceMeals) {
        if (!meal.mealItems.length) continue
        const body: CreateMealPayload = {
          date,
          slot: meal.slot,
          mealItems: meal.mealItems.map(item => ({
            portions: item.portions,
            recipe: { id: item.recipe.id },
          })),
        }
        await api('/meals', { method: 'POST', body })
      }
    }
    await refresh()
  }

  return { days, pending, error, refresh, addRecipe, removeItem, setPortions, duplicateDay }
}
