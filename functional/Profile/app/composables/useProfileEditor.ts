import { toast } from 'vue3-toastify'
import type {
  ActivityLevel,
  Allergen,
  BodyProfile,
  BodyProfilePayload,
  CookingTime,
  DietType,
  DrinkType,
  EatingOutFrequency,
  Objective,
  Sex,
  SnackingFrequency,
  SpiceLevel,
  TrainingType,
} from '../types/profile'

interface EditorForm {
  sex: Sex | null
  birthDate: string
  heightCm: number | null
  weightKg: number | null
  activityLevel: ActivityLevel | null
  trainingDaysPerWeek: number
  avgSessionMinutes: number | null
  trainingTypes: TrainingType[]
  objective: Objective | null
  targetWeightKg: number | null
  dietType: DietType
  allergies: Allergen[]
  excludedFoods: string
  mealsPerDay: number | null
  snacking: SnackingFrequency | null
  cookingTime: CookingTime | null
  eatingOutFrequency: EatingOutFrequency | null
  likedFoods: string[]
  dislikedFoods: string[]
  spiceLevel: SpiceLevel | null
  waterTargetMl: number | null
  usualDrinks: DrinkType[]
}

const createForm = (): EditorForm => ({
  sex: null,
  birthDate: '',
  heightCm: null,
  weightKg: null,
  activityLevel: null,
  trainingDaysPerWeek: 0,
  avgSessionMinutes: null,
  trainingTypes: [],
  objective: null,
  targetWeightKg: null,
  dietType: 'OMNIVORE',
  allergies: [],
  excludedFoods: '',
  mealsPerDay: 3,
  snacking: null,
  cookingTime: null,
  eatingOutFrequency: null,
  likedFoods: [],
  dislikedFoods: [],
  spiceLevel: null,
  waterTargetMl: 2000,
  usualDrinks: [],
})

// Edit form for an existing profile, mirroring the onboarding fields. Hydrates
// from the stored BodyProfile, rebuilds the PUT /me/profile payload and saves.
export const useProfileEditor = () => {
  const profileStore = useProfileStore()

  const form = reactive<EditorForm>(createForm())
  const saving = ref(false)

  // Required fields = onboarding steps 1–4; the rest stay optional.
  const isValid = computed(() => Boolean(
    form.sex
    && form.birthDate
    && form.heightCm
    && form.weightKg
    && form.activityLevel
    && form.objective,
  ))

  const loadFrom = (profile: BodyProfile | null) => {
    if (!profile) return
    form.sex = profile.sex
    form.birthDate = profile.birthDate
    form.heightCm = profile.heightCm
    form.weightKg = profile.weightKg
    form.activityLevel = profile.activityLevel
    form.trainingDaysPerWeek = profile.trainingDaysPerWeek ?? 0
    form.avgSessionMinutes = profile.avgSessionMinutes ?? null
    form.trainingTypes = [...(profile.trainingTypes ?? [])]
    form.objective = profile.objective
    form.targetWeightKg = profile.targetWeightKg ?? null
    form.dietType = profile.dietType ?? 'OMNIVORE'
    form.allergies = [...(profile.allergies ?? [])]
    form.excludedFoods = profile.excludedFoods ?? ''
    form.mealsPerDay = profile.mealsPerDay ?? 3
    form.snacking = profile.snacking ?? null
    form.cookingTime = profile.cookingTime ?? null
    form.eatingOutFrequency = profile.eatingOutFrequency ?? null
    form.likedFoods = [...(profile.likedFoods ?? [])]
    form.dislikedFoods = [...(profile.dislikedFoods ?? [])]
    form.spiceLevel = profile.spiceLevel ?? null
    form.waterTargetMl = profile.waterTargetMl ?? 2000
    form.usualDrinks = [...(profile.usualDrinks ?? [])]
  }

  const buildPayload = (): BodyProfilePayload => {
    const optionalNumber = (value: number | null) =>
      value !== null && value !== undefined ? { value } : null

    return {
      sex: form.sex!,
      birthDate: form.birthDate,
      heightCm: form.heightCm!,
      weightKg: form.weightKg!,
      activityLevel: form.activityLevel!,
      trainingDaysPerWeek: form.trainingDaysPerWeek,
      objective: form.objective!,
      dietType: form.dietType,
      ...(optionalNumber(form.avgSessionMinutes) && { avgSessionMinutes: form.avgSessionMinutes }),
      ...(form.trainingTypes.length > 0 && { trainingTypes: form.trainingTypes }),
      ...(optionalNumber(form.targetWeightKg) && { targetWeightKg: form.targetWeightKg }),
      ...(form.allergies.length > 0 && { allergies: form.allergies }),
      ...(form.excludedFoods.trim() && { excludedFoods: form.excludedFoods.trim() }),
      ...(optionalNumber(form.mealsPerDay) && { mealsPerDay: form.mealsPerDay }),
      ...(form.snacking && { snacking: form.snacking }),
      ...(form.cookingTime && { cookingTime: form.cookingTime }),
      ...(form.eatingOutFrequency && { eatingOutFrequency: form.eatingOutFrequency }),
      ...(form.likedFoods.length > 0 && { likedFoods: form.likedFoods }),
      ...(form.dislikedFoods.length > 0 && { dislikedFoods: form.dislikedFoods }),
      ...(form.spiceLevel && { spiceLevel: form.spiceLevel }),
      ...(optionalNumber(form.waterTargetMl) && { waterTargetMl: form.waterTargetMl }),
      ...(form.usualDrinks.length > 0 && { usualDrinks: form.usualDrinks }),
    }
  }

  const toggle = <T>(list: T[], value: T) => {
    const index = list.indexOf(value)
    if (index === -1) list.push(value)
    else list.splice(index, 1)
  }
  const toggleTrainingType = (value: TrainingType) => toggle(form.trainingTypes, value)
  const toggleAllergen = (value: Allergen) => toggle(form.allergies, value)
  const toggleDrink = (value: DrinkType) => toggle(form.usualDrinks, value)

  const save = async (): Promise<boolean> => {
    if (!isValid.value) return false
    saving.value = true
    try {
      await profileStore.save(buildPayload())
      toast.success('Profil mis à jour.')
      return true
    }
    catch {
      toast.error('Impossible de mettre à jour ton profil. Réessaie.')
      return false
    }
    finally {
      saving.value = false
    }
  }

  return {
    form,
    saving,
    isValid,
    loadFrom,
    save,
    toggleTrainingType,
    toggleAllergen,
    toggleDrink,
  }
}
