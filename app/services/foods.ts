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

  const deleteFoodsWithDetails = (food: IFoods) => {
    return $fetch<IFoods>('/foods/' + food.id,
      { baseURL: config.public.baseURL,
        method: 'DELETE',
      },
    )
  }

  const updateFoodsWithDetails = (food: IFoods) => {
    return $fetch<IFoods>('/foods',
      { baseURL: config.public.baseURL,
        method: 'PUT',
        body: food,
      },
    )
  }

  return {
    getFoodsList,
    createOneFoodWithDetails,
    deleteFoodsWithDetails,
    updateFoodsWithDetails,
  }
}
