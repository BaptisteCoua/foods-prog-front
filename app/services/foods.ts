import type { IFoods } from '~/models/foods'

export function foodsService() {
  const config = useRuntimeConfig()

  const getFoods = async (): Promise<IFoods[]> => {
    const { data } = await useFetch<IFoods[]>('/foods/details',
      { baseURL: config.public.baseURL },
    )
    if (data.value) return data.value
    return []
  }

  return {
    getFoods,
  }
}
