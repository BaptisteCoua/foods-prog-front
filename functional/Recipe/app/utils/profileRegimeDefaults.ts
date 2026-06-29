import type { BodyProfile } from '../../../Profile/app/types/profile'
import type { DietaryRegime } from '../types/recipe'

// Maps the user's profile preferences to the names of the global dietary
// regimes (GET /dietary-regimes) so the recipe filters can default to what the
// user can actually eat. Matching is by name (normalised), since regime ids are
// DB-generated — the catalog ships "Végan", "Végétarien", "Pescétarien",
// "Sans gluten", "Sans lactose"… (Halal/Casher/Cétogène have no profile field).

const DIET_TYPE_REGIME: Partial<Record<NonNullable<BodyProfile['dietType']>, string>> = {
  VEGAN: 'Végan',
  VEGETARIAN: 'Végétarien',
  PESCATARIAN: 'Pescétarien',
}

const ALLERGEN_REGIME: Partial<Record<string, string>> = {
  GLUTEN: 'Sans gluten',
  LACTOSE: 'Sans lactose',
}

// Accent- and case-insensitive so "Végan" matches "vegan", "VÉGAN", etc.
const normalize = (value: string) =>
  value.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLowerCase()

// Ids of the regimes to preselect for this profile, resolved against the
// available regimes. Returns [] when the profile is missing or nothing matches.
export const profileRegimeDefaultIds = (
  profile: BodyProfile | null,
  regimes: DietaryRegime[],
): number[] => {
  if (!profile) return []

  const wanted = new Set<string>()
  const dietRegime = profile.dietType ? DIET_TYPE_REGIME[profile.dietType] : undefined
  if (dietRegime) wanted.add(normalize(dietRegime))
  for (const allergen of profile.allergies ?? []) {
    const regime = ALLERGEN_REGIME[allergen]
    if (regime) wanted.add(normalize(regime))
  }
  if (!wanted.size) return []

  return regimes
    .filter(regime => wanted.has(normalize(regime.name)))
    .map(regime => regime.id)
}
