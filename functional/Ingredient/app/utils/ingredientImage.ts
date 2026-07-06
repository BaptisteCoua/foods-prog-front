import type { FoodType, Ingredient } from '../types/ingredient'

// Fallback visual for ingredients without a matched photo (`imageUrl` null):
// one emoji per food-type category (keyed by the backend `types` label).

const DEFAULT_EMOJI = '🍽️'

export const FOOD_TYPE_EMOJI: Record<string, string> = {
  'Légumes': '🥬',
  'Fruits': '🍎',
  'Viandes': '🥩',
  'Poissons & fruits de mer': '🐟',
  'Produits laitiers': '🧀',
  'Œufs': '🥚',
  'Céréales & féculents': '🌾',
  'Légumineuses': '🫘',
  'Noix & graines': '🥜',
  'Matières grasses': '🫒',
  'Épices & herbes': '🌿',
  'Sauces & condiments': '🥫',
  'Boissons': '🥤',
  'Sucres & confiseries': '🍬',
  'Produits transformés': '🍱',
}

// Emoji for the ingredient's first recognised category, or a neutral default.
export const ingredientEmoji = (foodTypes: FoodType[]): string => {
  const known = foodTypes.find(type => type.types in FOOD_TYPE_EMOJI)
  return known ? FOOD_TYPE_EMOJI[known.types]! : DEFAULT_EMOJI
}

// True when the ingredient carries a usable photo URL.
export const hasIngredientImage = (ingredient: Ingredient): boolean =>
  typeof ingredient.imageUrl === 'string' && ingredient.imageUrl.length > 0
