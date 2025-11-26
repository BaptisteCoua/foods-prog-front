import type { IMeals } from '~/models/meals'
import { mealsService } from '~/services/meals'

export function useMeals() {
  const { getAllWithDetails } = mealsService()
  const { createEmptyFoodForm } = useFoods()

  const emptyMealDetailsForm = () => ({
    quantity: 100,
    food: createEmptyFoodForm(),
  })
  const emptyMealForm = () => ({
    name: '',
    img: '',
    totalFoodsDetails: {
      kcal: 0,
      glucide: 0,
      protein: 0,
      lipid: 0,
      price: 0,
    },
    mealDetails: [
      {
        ...emptyMealDetailsForm(),
      },
    ],
    mealTypes: [],
  })

  const mealForm = useState<IMeals>('mealForm', () => emptyMealForm())

  const { data: meals } = useAsyncData<IMeals[]>('meals', () => getAllWithDetails())

  return {
    meals,
    mealForm,
  }
}
