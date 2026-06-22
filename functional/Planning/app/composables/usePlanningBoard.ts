import { toast } from 'vue3-toastify'
import type { Recipe } from '../../../Recipe/app/types/recipe'
import type { DayPlan, MealSlot, MealWithTotal } from '../types/planning'
import { courseRank, MEAL_SLOTS } from '../utils/planningMeta'

const EMPTY_NUTRITION = { calories: 0, proteinG: 0, carbG: 0, fatG: 0, costCents: 0 }

// One render row of the day: a slot, its meal (or null when empty) and the items
// already sorted into course order (entrée → plat → dessert → untagged).
export interface SlotRow {
  meta: (typeof MEAL_SLOTS)[number]
  meal: MealWithTotal | null
  items: MealWithTotal['mealItems']
}

// Page orchestrator for the planning board: composes the week navigation with the
// week data, derives the strip + selected-day views, and owns the add / duplicate
// sheets. The page stays presentational and calls into here.
export const usePlanningBoard = () => {
  const nav = useWeekNavigation()
  const week = usePlanningWeek(nav.weekStart, nav.weekEnd)

  // The selected day, synthesised as empty when the API returned nothing for it.
  const selectedDay = computed<DayPlan>(() => {
    const found = week.days.value.find(day => day.date === nav.selectedDate.value)
    return found ?? {
      date: nav.selectedDate.value,
      meals: [],
      total: { ...EMPTY_NUTRITION },
      target: null,
      gap: null,
    }
  })

  // Per-slot rows for the selected day, in fixed slot order with sorted items.
  const slotRows = computed<SlotRow[]>(() =>
    MEAL_SLOTS.map((meta) => {
      const meal = selectedDay.value.meals.find(m => m.slot === meta.value) ?? null
      const items = meal
        ? [...meal.mealItems].sort(
            (a, b) =>
              courseRank((a.recipe.mealTypes ?? []).map(t => t.name))
              - courseRank((b.recipe.mealTypes ?? []).map(t => t.name)),
          )
        : []
      return { meta, meal, items }
    }),
  )

  // Completion data for each pastille of the week strip.
  const daySummaries = computed(() =>
    nav.dates.value.map((date) => {
      const day = week.days.value.find(d => d.date === date) ?? null
      const target = day?.target?.calories ?? 0
      return {
        date,
        ratio: target ? Math.min(day!.total.calories / target, 1) : null,
        hasMeals: Boolean(day?.meals.length),
        isToday: date === nav.today,
        isSelected: date === nav.selectedDate.value,
      }
    }),
  )

  // Recipes recently placed across the visible week — the fast-add shortcut.
  const recentRecipes = computed<Recipe[]>(() => {
    const seen = new Set<number>()
    const out: Recipe[] = []
    for (const day of [...week.days.value].reverse()) {
      for (const meal of day.meals) {
        for (const item of meal.mealItems) {
          if (!seen.has(item.recipe.id)) {
            seen.add(item.recipe.id)
            out.push(item.recipe)
          }
        }
      }
    }
    return out.slice(0, 6)
  })

  // ── Add-recipe sheet ──────────────────────────────────────────────────────
  const pickerOpen = ref(false)
  const pickerSlot = ref<MealSlot | null>(null)
  const busy = ref(false)

  const openPicker = (slot: MealSlot) => {
    pickerSlot.value = slot
    pickerOpen.value = true
  }

  const pickRecipe = async (recipe: Recipe) => {
    if (!pickerSlot.value) return
    const existing = selectedDay.value.meals.find(m => m.slot === pickerSlot.value)
    busy.value = true
    try {
      await week.addRecipe({
        date: nav.selectedDate.value,
        slot: pickerSlot.value,
        recipeId: recipe.id,
        existingMealId: existing?.id,
      })
      toast.success(`« ${recipe.name} » ajoutée.`)
      pickerOpen.value = false
    }
    catch {
      toast.error('Ajout impossible.')
    }
    finally {
      busy.value = false
    }
  }

  const removeItem = async (meal: MealWithTotal, itemId: number) => {
    try {
      await week.removeItem(meal, itemId)
    }
    catch {
      toast.error('Suppression impossible.')
    }
  }

  const changePortions = async (meal: MealWithTotal, itemId: number, portions: number) => {
    if (!(portions > 0)) return
    try {
      await week.setPortions(meal, itemId, portions)
    }
    catch {
      toast.error('Modification impossible.')
    }
  }

  // ── Duplicate-day sheet ───────────────────────────────────────────────────
  const duplicateOpen = ref(false)

  const openDuplicate = () => {
    duplicateOpen.value = true
  }

  const confirmDuplicate = async (targetDates: string[]) => {
    if (!targetDates.length) return
    busy.value = true
    try {
      await week.duplicateDay(selectedDay.value.meals, targetDates)
      toast.success(
        targetDates.length > 1
          ? `Journée copiée sur ${targetDates.length} jours.`
          : 'Journée copiée.',
      )
      duplicateOpen.value = false
    }
    catch {
      toast.error('Copie impossible.')
    }
    finally {
      busy.value = false
    }
  }

  return {
    ...nav,
    pending: week.pending,
    error: week.error,
    refresh: week.refresh,
    selectedDay,
    slotRows,
    daySummaries,
    recentRecipes,
    // add sheet
    pickerOpen,
    pickerSlot,
    busy,
    openPicker,
    pickRecipe,
    removeItem,
    changePortions,
    // duplicate sheet
    duplicateOpen,
    openDuplicate,
    confirmDuplicate,
  }
}
