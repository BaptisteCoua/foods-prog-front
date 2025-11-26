import type { IMeals } from '~/models/meals'

export function mealsService() {
  const config = useRuntimeConfig()

  const getAllWithDetails = (): Promise<IMeals[]> => {
    return $fetch<IMeals[]>('/meals',
      { baseURL: config.public.baseURL },
    )
  }

  return {
    getAllWithDetails,
  }
}
