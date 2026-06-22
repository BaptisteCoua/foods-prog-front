import type { MealType } from '../types/recipe'

// The user's meal categories, used to tag recipes (GET /meal-types).
export const useMealTypes = () => {
  const api = useApi()

  const { data } = useAsyncData('meal-types', () => api<MealType[]>('/meal-types'))

  const mealTypes = computed(() => data.value ?? [])

  return { mealTypes }
}
