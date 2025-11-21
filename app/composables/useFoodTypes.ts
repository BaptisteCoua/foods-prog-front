import type { IFoodsTypes } from '~/models/foods'
import { foodTypesService } from '~/services/food-types'

export function useFoodTypes() {
  const { getTypes } = foodTypesService()

  const { data: foodTypes } = useAsyncData<IFoodsTypes[]>('foodTypes', () => getTypes())

  return {
    foodTypes,
  }
}
