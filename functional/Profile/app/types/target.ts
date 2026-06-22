// Cible nutritionnelle journalière (GET /me/target, PUT /me/target).
export interface NutritionTarget {
  calories: number
  proteinG: number
  carbG: number
  fatG: number
  // false = suit la proposition calculée depuis le profil ; true = éditée à la main.
  isCustom: boolean
}

// Proposition recalculée à la volée depuis le profil (GET /me/target/proposal).
export interface NutritionProposal {
  calories: number
  proteinG: number
  carbG: number
  fatG: number
}

export interface NutritionTargetPayload {
  calories: number
  proteinG: number
  carbG: number
  fatG: number
}
