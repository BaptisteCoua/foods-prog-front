import type { IFoods, IFoodsDetails } from './foods'

export interface IMeals {
  id?: number
  name: string
  img: string
  totalFoodsDetails?: IFoodsDetails
  mealDetails: IMealDetails[]
  mealTypes: IMealTypes[]
}

export interface IMealDetails {
  id?: number
  quantity: number
  food: IFoods
}

export interface IMealTypes {
  id: number
  name: string
}
