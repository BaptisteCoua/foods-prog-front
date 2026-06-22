// Presentation metadata for the planning: the fixed order + labels + icons of
// the four meal slots, and a lenient ordering for "courses" (entrée/plat/dessert).
//
// Courses are NOT a backend concept: the API only knows slots. A "course" is just
// a user-defined MealTypes tag on a recipe. So we never force a 3-course structure
// — we only *sort* the items of a meal when their tags happen to match common
// course names, so a starter shows above a main shows above a dessert. Anything
// untagged keeps its natural order at the end.
import type { MealSlot } from '../types/planning'

export interface SlotMeta {
  value: MealSlot
  label: string
  icon: string
}

// Render order of the slots within a day.
export const MEAL_SLOTS: readonly SlotMeta[] = [
  { value: 'BREAKFAST', label: 'Petit-déjeuner', icon: 'mdi-weather-sunset-up' },
  { value: 'LUNCH', label: 'Déjeuner', icon: 'mdi-white-balance-sunny' },
  { value: 'DINNER', label: 'Dîner', icon: 'mdi-weather-night' },
  { value: 'SNACK', label: 'Collation', icon: 'mdi-food-apple-outline' },
] as const

// Lenient course ranking: a recipe's tag name is matched (accent/case-insensitive)
// against these keywords; the lowest matching rank wins. Untagged → after everything.
const COURSE_KEYWORDS: { rank: number, keywords: string[] }[] = [
  { rank: 0, keywords: ['entrée', 'entree', 'apéritif', 'aperitif', 'starter'] },
  { rank: 1, keywords: ['plat', 'main'] },
  { rank: 2, keywords: ['dessert'] },
]

const normalize = (value: string): string =>
  value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

// Course rank for a set of tag names (lower = served earlier). 99 = no course tag.
export const courseRank = (tagNames: string[]): number => {
  const normalized = tagNames.map(normalize)
  for (const { rank, keywords } of COURSE_KEYWORDS) {
    if (normalized.some(name => keywords.some(keyword => name.includes(keyword)))) {
      return rank
    }
  }
  return 99
}
