// Mirrors the backend BodyProfile contract (GET/PUT /me/profile). String unions
// keep the values aligned with the API enums without pulling a runtime enum in.

export type Sex = 'MALE' | 'FEMALE'
export type ActivityLevel = 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE'
export type Objective = 'WEIGHT_LOSS' | 'MAINTENANCE' | 'MUSCLE_GAIN'
export type TrainingType = 'STRENGTH' | 'CARDIO' | 'HIIT' | 'ENDURANCE' | 'TEAM_SPORT' | 'MOBILITY' | 'OTHER'
export type DietType = 'OMNIVORE' | 'FLEXITARIAN' | 'PESCATARIAN' | 'VEGETARIAN' | 'VEGAN'
export type Allergen = 'GLUTEN' | 'LACTOSE' | 'PEANUTS' | 'TREE_NUTS' | 'EGG' | 'SOY' | 'SHELLFISH' | 'FISH' | 'SESAME'
export type SnackingFrequency = 'NEVER' | 'SOMETIMES' | 'OFTEN'
export type CookingTime = 'LOW' | 'MEDIUM' | 'HIGH'
export type EatingOutFrequency = 'RARELY' | 'WEEKLY' | 'OFTEN'
export type SpiceLevel = 'NONE' | 'MILD' | 'MEDIUM' | 'HOT'
export type DrinkType = 'WATER' | 'COFFEE' | 'TEA' | 'SODA' | 'JUICE' | 'ALCOHOL'

export interface BodyProfilePayload {
  sex: Sex
  birthDate: string
  heightCm: number
  weightKg: number
  activityLevel: ActivityLevel
  trainingDaysPerWeek: number
  avgSessionMinutes?: number | null
  trainingTypes?: TrainingType[]
  objective: Objective
  targetWeightKg?: number | null
  dietType?: DietType
  allergies?: Allergen[]
  excludedFoods?: string | null
  mealsPerDay?: number | null
  snacking?: SnackingFrequency | null
  cookingTime?: CookingTime | null
  eatingOutFrequency?: EatingOutFrequency | null
  likedFoods?: string[]
  dislikedFoods?: string[]
  spiceLevel?: SpiceLevel | null
  waterTargetMl?: number | null
  usualDrinks?: DrinkType[]
}

export interface BodyProfile extends BodyProfilePayload {
  id: number
  userId: number
}

export interface Choice<T extends string> {
  value: T
  label: string
  description?: string
  icon?: string
}

export const SEX_OPTIONS: Choice<Sex>[] = [
  { value: 'FEMALE', label: 'Femme', icon: 'mdi-gender-female' },
  { value: 'MALE', label: 'Homme', icon: 'mdi-gender-male' },
]

export const ACTIVITY_OPTIONS: Choice<ActivityLevel>[] = [
  { value: 'SEDENTARY', label: 'Sédentaire', description: 'Bureau, peu de marche' },
  { value: 'LIGHT', label: 'Légère', description: 'Un peu de marche au quotidien' },
  { value: 'MODERATE', label: 'Modérée', description: 'Activité régulière' },
  { value: 'ACTIVE', label: 'Active', description: 'Debout / en mouvement souvent' },
  { value: 'VERY_ACTIVE', label: 'Très active', description: 'Métier physique' },
]

export const OBJECTIVE_OPTIONS: Choice<Objective>[] = [
  { value: 'WEIGHT_LOSS', label: 'Perdre du poids', icon: 'mdi-trending-down' },
  { value: 'MAINTENANCE', label: 'Me maintenir', icon: 'mdi-equal' },
  { value: 'MUSCLE_GAIN', label: 'Prendre du muscle', icon: 'mdi-trending-up' },
]

export const TRAINING_TYPE_OPTIONS: Choice<TrainingType>[] = [
  { value: 'STRENGTH', label: 'Musculation', icon: 'mdi-dumbbell' },
  { value: 'CARDIO', label: 'Cardio', icon: 'mdi-run' },
  { value: 'HIIT', label: 'HIIT', icon: 'mdi-lightning-bolt' },
  { value: 'ENDURANCE', label: 'Endurance', icon: 'mdi-bike' },
  { value: 'TEAM_SPORT', label: 'Sport co', icon: 'mdi-soccer' },
  { value: 'MOBILITY', label: 'Mobilité / yoga', icon: 'mdi-meditation' },
  { value: 'OTHER', label: 'Autre', icon: 'mdi-dots-horizontal' },
]

export const DIET_OPTIONS: Choice<DietType>[] = [
  { value: 'OMNIVORE', label: 'Omnivore', description: 'De tout' },
  { value: 'FLEXITARIAN', label: 'Flexitarien', description: 'Peu de viande' },
  { value: 'PESCATARIAN', label: 'Pescétarien', description: 'Poisson, pas de viande' },
  { value: 'VEGETARIAN', label: 'Végétarien', description: 'Sans viande ni poisson' },
  { value: 'VEGAN', label: 'Végan', description: 'Aucun produit animal' },
]

export const ALLERGEN_OPTIONS: Choice<Allergen>[] = [
  { value: 'GLUTEN', label: 'Gluten' },
  { value: 'LACTOSE', label: 'Lactose' },
  { value: 'PEANUTS', label: 'Arachides' },
  { value: 'TREE_NUTS', label: 'Fruits à coque' },
  { value: 'EGG', label: 'Œuf' },
  { value: 'SOY', label: 'Soja' },
  { value: 'SHELLFISH', label: 'Crustacés' },
  { value: 'FISH', label: 'Poisson' },
  { value: 'SESAME', label: 'Sésame' },
]

export const SNACKING_OPTIONS: Choice<SnackingFrequency>[] = [
  { value: 'NEVER', label: 'Jamais' },
  { value: 'SOMETIMES', label: 'Parfois' },
  { value: 'OFTEN', label: 'Souvent' },
]

export const COOKING_TIME_OPTIONS: Choice<CookingTime>[] = [
  { value: 'LOW', label: 'Peu', description: '< 15 min' },
  { value: 'MEDIUM', label: 'Moyen', description: '15–30 min' },
  { value: 'HIGH', label: 'Beaucoup', description: '> 30 min' },
]

export const EATING_OUT_OPTIONS: Choice<EatingOutFrequency>[] = [
  { value: 'RARELY', label: 'Rarement' },
  { value: 'WEEKLY', label: 'Chaque semaine' },
  { value: 'OFTEN', label: 'Souvent' },
]

export const SPICE_OPTIONS: Choice<SpiceLevel>[] = [
  { value: 'NONE', label: 'Pas épicé' },
  { value: 'MILD', label: 'Doux' },
  { value: 'MEDIUM', label: 'Relevé' },
  { value: 'HOT', label: 'Très épicé' },
]

export const DRINK_OPTIONS: Choice<DrinkType>[] = [
  { value: 'WATER', label: 'Eau', icon: 'mdi-cup-water' },
  { value: 'COFFEE', label: 'Café', icon: 'mdi-coffee' },
  { value: 'TEA', label: 'Thé', icon: 'mdi-tea' },
  { value: 'SODA', label: 'Soda', icon: 'mdi-bottle-soda' },
  { value: 'JUICE', label: 'Jus', icon: 'mdi-glass-mug-variant' },
  { value: 'ALCOHOL', label: 'Alcool', icon: 'mdi-glass-wine' },
]
