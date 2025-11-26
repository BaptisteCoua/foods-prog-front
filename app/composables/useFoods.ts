import type { IFoods } from '~/models/foods'
import { foodsService } from '~/services/foods'

export function useFoods() {
  const { createOneFoodWithDetails, getFoodsList, deleteFoodsWithDetails, updateFoodsWithDetails } = foodsService()

  const { data: foods, refresh: refreshFoods, pending: pendingFoods } = useAsyncData<IFoods[]>('foods', () => getFoodsList())
  const { execute: createFoodInfos, pending: pendingCreateFood } = useAsyncData<IFoods[]>('posts-food', () => createOneFoodWithDetails(foodForm.value), { immediate: false })
  const deleteFoodInfos = async (food: IFoods) => {
    await deleteFoodsWithDetails(food)
    refreshFoods()
  }
  const updateFoodInfos = async (food: IFoods) => {
    await updateFoodsWithDetails(food)
    refreshFoods()
  }

  const createEmptyFoodForm = () => ({
    name: '',
    asGrams: true,
    foodDetail: {
      kcal: 0,
      glucide: 0,
      protein: 0,
      lipid: 0,
      price: 0,
    },
    foodTypes: [],
  })

  const foodForm = useState<IFoods>('foodForm', () => createEmptyFoodForm())

  const asGramType = computed<string>((toto) => {
    return toto ? 'Poids' : 'Unité'
  })

  const asGramType2 = (toto: boolean) => {
    return toto ? 'Poids' : 'Unité'
  }

  const asGramTypeValue = computed<string>(() => {
    return foodForm.value.asGrams ? ' /Kg' : ` l'unité`
  })

  const resetValueFoodForm = () => {
    foodForm.value = createEmptyFoodForm()
  }

  return {
    createEmptyFoodForm,
    createFoodInfos,
    resetValueFoodForm,
    refreshFoods,
    deleteFoodInfos,
    updateFoodInfos,
    pendingFoods,
    asGramType,
    asGramTypeValue,
    foods,
    foodForm,
    pendingCreateFood,
    asGramType2,
  }
}
