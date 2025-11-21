export interface IFoods {
  id?: number
  name: string
  picture?: string
  asGrams: boolean
  foodTypes?: IFoodsTypes[]
  foodDetail?: IFoodsDetails
}

export interface IFoodsTypes {
  id?: number
  types: string
}

export interface IFoodsDetails {
  id?: number
  kcal: number
  glucide: number
  protein: number
  lipid: number
  price: number
}
