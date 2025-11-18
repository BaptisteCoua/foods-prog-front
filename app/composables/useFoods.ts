import type { IFoods } from '~/models/foods'
import { foodsService } from '~/services/foods'

export function useFoods() {
  const { getFoods } = foodsService()

  const foods = useState<IFoods[]>('foods')

  const getListFoods = async () => {
    foods.value = await getFoods()
  }

  return { getListFoods, foods }
}
