import type { IFoods } from '~/models/foods'
import { foodsService } from '~/services/foods'

export function useFoods() {
  const { createOneFoodWithDetails, getFoodsList } = foodsService()

  const { data: foods, refresh: refreshFoods, pending: pendingFoods } = useAsyncData<IFoods[]>('foods', () => getFoodsList())
  const { execute: createFoodInfos, pending: pendingCreateFood } = useAsyncData<IFoods[]>('posts-food', () => createOneFoodWithDetails(foodForm.value), { immediate: false })

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

  const asGramType = computed<string>(() => {
    return foodForm.value.asGrams ? 'Poids' : 'Unité'
  })

  const asGramTypeValue = computed<string>(() => {
    return foodForm.value.asGrams ? ' /Kg' : ` l'unité`
  })

  const resetValueFoodForm = () => {
    foodForm.value = createEmptyFoodForm()
  }

  return {
    createFoodInfos,
    resetValueFoodForm,
    refreshFoods,
    pendingFoods,
    asGramType,
    asGramTypeValue,
    foods,
    foodForm,
    pendingCreateFood,
  }
}
