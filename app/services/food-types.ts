import type { IFoodsTypes } from '~/models/foods'

export function foodTypesService() {
  const config = useRuntimeConfig()

  const getTypes = (): Promise<IFoodsTypes[]> => {
    return $fetch<IFoodsTypes[]>('/food-types',
      { baseURL: config.public.baseURL },
    )
  }

  return {
    getTypes,
  }
}
