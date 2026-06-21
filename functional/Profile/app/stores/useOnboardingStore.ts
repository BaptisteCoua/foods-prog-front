import { toast } from 'vue3-toastify'
import type {
  ActivityLevel,
  Allergen,
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

interface OnboardingForm {
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

interface OnboardingStep {
  key: string
  title: string
  subtitle: string
  component: string
  optional: boolean
  isValid: () => boolean
}

const createForm = (): OnboardingForm => ({
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

// Drives the post-signup wizard. Holds the whole form (shared by the page shell
// and every step component → Pinia), the step definitions with per-step
// validation, navigation, and the final PUT /me/profile submit.
export const useOnboardingStore = defineStore('onboarding', () => {
  const profileStore = useProfileStore()

  const form = reactive<OnboardingForm>(createForm())
  const currentIndex = ref(0)
  const isSubmitting = ref(false)

  const steps: OnboardingStep[] = [
    {
      key: 'physical',
      title: 'Informations physiques',
      subtitle: 'Pour calculer ton métabolisme de base.',
      component: 'OnboardingPhysical',
      optional: false,
      isValid: () => Boolean(form.sex && form.birthDate && form.heightCm && form.weightKg),
    },
    {
      key: 'activity',
      title: 'Activité quotidienne',
      subtitle: 'Ton niveau d\'activité hors sport.',
      component: 'OnboardingActivity',
      optional: false,
      isValid: () => Boolean(form.activityLevel),
    },
    {
      key: 'training',
      title: 'Entraînement sportif',
      subtitle: 'Tes séances comptent dans ta dépense.',
      component: 'OnboardingTraining',
      optional: false,
      isValid: () => form.trainingDaysPerWeek >= 0,
    },
    {
      key: 'goals',
      title: 'Objectifs nutritionnels',
      subtitle: 'Ce que tu veux atteindre.',
      component: 'OnboardingGoals',
      optional: false,
      isValid: () => Boolean(form.objective),
    },
    {
      key: 'diet',
      title: 'Contraintes alimentaires',
      subtitle: 'Régime, allergies, aliments exclus.',
      component: 'OnboardingDiet',
      optional: true,
      isValid: () => true,
    },
    {
      key: 'habits',
      title: 'Habitudes alimentaires',
      subtitle: 'Comment tu manges au quotidien.',
      component: 'OnboardingHabits',
      optional: true,
      isValid: () => true,
    },
    {
      key: 'preferences',
      title: 'Préférences alimentaires',
      subtitle: 'Ce que tu aimes (ou pas).',
      component: 'OnboardingPreferences',
      optional: true,
      isValid: () => true,
    },
    {
      key: 'hydration',
      title: 'Hydratation',
      subtitle: 'Ton objectif et tes boissons.',
      component: 'OnboardingHydration',
      optional: true,
      isValid: () => true,
    },
  ]

  const totalSteps = computed(() => steps.length)
  const currentStep = computed(() => steps[currentIndex.value]!)
  const isFirstStep = computed(() => currentIndex.value === 0)
  const isLastStep = computed(() => currentIndex.value === steps.length - 1)
  const isCurrentValid = computed(() => currentStep.value.isValid())
  const progress = computed(() => (currentIndex.value + 1) / steps.length)

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

  const submit = async () => {
    isSubmitting.value = true
    try {
      await profileStore.save(buildPayload())
      toast.success('Profil enregistré, ta cible est prête !')
      await navigateTo('/')
    }
    catch {
      toast.error('Impossible d\'enregistrer ton profil. Réessaie.')
    }
    finally {
      isSubmitting.value = false
    }
  }

  const next = () => {
    if (!isCurrentValid.value) return
    if (isLastStep.value) {
      void submit()
      return
    }
    currentIndex.value += 1
  }

  const previous = () => {
    if (!isFirstStep.value) currentIndex.value -= 1
  }

  const skip = () => {
    if (!currentStep.value.optional) return
    if (isLastStep.value) {
      void submit()
      return
    }
    currentIndex.value += 1
  }

  return {
    form,
    steps,
    currentIndex,
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    isCurrentValid,
    isSubmitting,
    progress,
    next,
    previous,
    skip,
  }
})
