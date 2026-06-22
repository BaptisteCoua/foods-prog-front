import type { FoodType } from '../types/ingredient'

// The user's food categories, used to tag ingredients (GET /food-types).
export const useFoodTypes = () => {
  const api = useApi()

  const { data } = useAsyncData('food-types', () => api<FoodType[]>('/food-types'))

  const foodTypes = computed(() => data.value ?? [])

  return { foodTypes }
}
