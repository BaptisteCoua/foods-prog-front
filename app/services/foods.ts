import type { IFoods } from '~/models/foods'

export function foodsService() {
  const config = useRuntimeConfig()

  const getFoodsList = (): Promise<IFoods[]> => {
    return $fetch<IFoods[]>('/foods/details',
      { baseURL: config.public.baseURL },
    )
  }

  const createOneFoodWithDetails = (foods: IFoods) => {
    return $fetch<IFoods[]>('/foods/details',
      { baseURL: config.public.baseURL,
        method: 'POST',
        body: foods,
      },
    )
  }

  return {
    getFoodsList,
    createOneFoodWithDetails,
  }
}
