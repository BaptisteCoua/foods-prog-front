import {
  ACTIVITY_OPTIONS,
  ALLERGEN_OPTIONS,
  COOKING_TIME_OPTIONS,
  DIET_OPTIONS,
  DRINK_OPTIONS,
  EATING_OUT_OPTIONS,
  OBJECTIVE_OPTIONS,
  SEX_OPTIONS,
  SNACKING_OPTIONS,
  SPICE_OPTIONS,
  TRAINING_TYPE_OPTIONS,
  type Choice,
} from '../types/profile'

export interface DetailRow {
  label: string
  value: string | null
  chips?: string[]
}

export interface DetailSection {
  key: string
  title: string
  icon: string
  rows: DetailRow[]
}

// Turns the stored BodyProfile into a human-readable, sectioned recap that
// mirrors the onboarding steps. Pure presentation logic, kept out of the card.
export const useProfileDetails = () => {
  const profileStore = useProfileStore()
  const { profile, hasProfile } = storeToRefs(profileStore)

  const labelOf = <T extends string>(options: Choice<T>[], value: T | null | undefined): string | null =>
    options.find(option => option.value === value)?.label ?? null

  const labelsOf = <T extends string>(options: Choice<T>[], values: T[] | null | undefined): string[] =>
    (values ?? []).map(value => labelOf(options, value) ?? value)

  const ageFrom = (birthDate: string): number | null => {
    const birth = new Date(birthDate)
    if (Number.isNaN(birth.getTime())) return null
    const now = new Date()
    let age = now.getFullYear() - birth.getFullYear()
    const monthDiff = now.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age -= 1
    return age
  }

  const birthLabel = (birthDate: string): string => {
    const birth = new Date(birthDate)
    if (Number.isNaN(birth.getTime())) return birthDate
    const formatted = new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(birth)
    const age = ageFrom(birthDate)
    return age !== null ? `${formatted} · ${age} ans` : formatted
  }

  const sections = computed<DetailSection[]>(() => {
    const data = profile.value
    if (!data) return []

    return [
      {
        key: 'physical',
        title: 'Physique',
        icon: 'mdi-human',
        rows: [
          { label: 'Sexe', value: labelOf(SEX_OPTIONS, data.sex) },
          { label: 'Naissance', value: data.birthDate ? birthLabel(data.birthDate) : null },
          { label: 'Taille', value: data.heightCm ? `${data.heightCm} cm` : null },
          { label: 'Poids', value: data.weightKg ? `${data.weightKg} kg` : null },
        ],
      },
      {
        key: 'activity',
        title: 'Activité',
        icon: 'mdi-walk',
        rows: [
          { label: 'Niveau', value: labelOf(ACTIVITY_OPTIONS, data.activityLevel) },
        ],
      },
      {
        key: 'training',
        title: 'Entraînement',
        icon: 'mdi-dumbbell',
        rows: [
          { label: 'Séances / semaine', value: String(data.trainingDaysPerWeek ?? 0) },
          { label: 'Durée moyenne', value: data.avgSessionMinutes ? `${data.avgSessionMinutes} min` : null },
          { label: 'Types', value: null, chips: labelsOf(TRAINING_TYPE_OPTIONS, data.trainingTypes) },
        ],
      },
      {
        key: 'goals',
        title: 'Objectif',
        icon: 'mdi-target',
        rows: [
          { label: 'Objectif', value: labelOf(OBJECTIVE_OPTIONS, data.objective) },
          { label: 'Poids cible', value: data.targetWeightKg ? `${data.targetWeightKg} kg` : null },
        ],
      },
      {
        key: 'diet',
        title: 'Alimentation',
        icon: 'mdi-food-apple-outline',
        rows: [
          { label: 'Régime', value: labelOf(DIET_OPTIONS, data.dietType) },
          { label: 'Allergies', value: null, chips: labelsOf(ALLERGEN_OPTIONS, data.allergies) },
          { label: 'Aliments exclus', value: data.excludedFoods?.trim() || null },
        ],
      },
      {
        key: 'habits',
        title: 'Habitudes',
        icon: 'mdi-silverware-fork-knife',
        rows: [
          { label: 'Repas / jour', value: data.mealsPerDay ? String(data.mealsPerDay) : null },
          { label: 'Grignotage', value: labelOf(SNACKING_OPTIONS, data.snacking) },
          { label: 'Temps de cuisine', value: labelOf(COOKING_TIME_OPTIONS, data.cookingTime) },
          { label: 'Repas à l\'extérieur', value: labelOf(EATING_OUT_OPTIONS, data.eatingOutFrequency) },
        ],
      },
      {
        key: 'preferences',
        title: 'Préférences',
        icon: 'mdi-heart-outline',
        rows: [
          { label: 'Aimés', value: null, chips: data.likedFoods ?? [] },
          { label: 'Pas aimés', value: null, chips: data.dislikedFoods ?? [] },
          { label: 'Piquant', value: labelOf(SPICE_OPTIONS, data.spiceLevel) },
        ],
      },
      {
        key: 'hydration',
        title: 'Hydratation',
        icon: 'mdi-cup-water',
        rows: [
          {
            label: 'Objectif d\'eau',
            value: data.waterTargetMl
              ? `${(data.waterTargetMl / 1000).toLocaleString('fr-FR')} L`
              : null,
          },
          { label: 'Boissons', value: null, chips: labelsOf(DRINK_OPTIONS, data.usualDrinks) },
        ],
      },
    ]
  })

  return { sections, hasProfile }
}
