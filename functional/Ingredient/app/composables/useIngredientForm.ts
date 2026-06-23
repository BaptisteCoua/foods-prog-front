import { toast } from 'vue3-toastify'
import type { VForm } from 'vuetify/components'
import type { Ingredient, IngredientPayload, UnitType } from '../types/ingredient'

interface IngredientFormState {
  name: string
  unitType: UnitType
  calories: number | null
  proteinG: number | null
  carbG: number | null
  fatG: number | null
  cookedFactor: number | null
  priceEuros: number | null
  foodTypeIds: number[]
}

const createForm = (): IngredientFormState => ({
  name: '',
  unitType: 'WEIGHT',
  calories: null,
  proteinG: null,
  carbG: null,
  fatG: null,
  cookedFactor: null,
  priceEuros: null,
  foodTypeIds: [],
})

export const useIngredientForm = () => {
  const { create, update } = useIngredients()
  const { required } = useValidationRules()

  const dialogOpen = ref(false)
  const editingId = ref<number | null>(null)
  const isSaving = ref(false)
  const formRef = ref<VForm | null>(null)
  const form = reactive<IngredientFormState>(createForm())

  const isEditing = computed(() => editingId.value !== null)
  const title = computed(() => (isEditing.value ? 'Modifier l\'ingrédient' : 'Nouvel ingrédient'))

  const positive = (value: unknown) =>
    (value !== null && value !== '' && Number(value) >= 0) || 'Valeur positive requise.'

  // Cooking yield is optional, but when filled it must be strictly > 0.
  const optionalFactor = (value: unknown) =>
    value === null || value === '' || Number(value) > 0 || 'Facteur > 0 requis.'

  const reset = () => Object.assign(form, createForm())

  const openCreate = () => {
    reset()
    editingId.value = null
    dialogOpen.value = true
  }

  const openEdit = (ingredient: Ingredient) => {
    editingId.value = ingredient.id
    Object.assign(form, {
      name: ingredient.name,
      unitType: ingredient.unitType,
      calories: ingredient.calories,
      proteinG: ingredient.proteinG,
      carbG: ingredient.carbG,
      fatG: ingredient.fatG,
      cookedFactor: ingredient.cookedFactor,
      priceEuros: centsToEuros(ingredient.pricePerKgCents),
      foodTypeIds: ingredient.foodTypes.map(type => type.id),
    })
    dialogOpen.value = true
  }

  const close = () => {
    dialogOpen.value = false
  }

  const submit = async () => {
    const validation = await formRef.value?.validate()
    if (!validation?.valid) return

    const payload: IngredientPayload = {
      name: form.name.trim(),
      unitType: form.unitType,
      calories: Number(form.calories),
      proteinG: Number(form.proteinG),
      carbG: Number(form.carbG),
      fatG: Number(form.fatG),
      cookedFactor: form.cookedFactor ? Number(form.cookedFactor) : null,
      pricePerKgCents: eurosToCents(Number(form.priceEuros)),
      foodTypes: form.foodTypeIds.map(id => ({ id })),
    }

    isSaving.value = true
    try {
      if (editingId.value !== null) await update(editingId.value, payload)
      else await create(payload)
      toast.success(isEditing.value ? 'Ingrédient mis à jour.' : 'Ingrédient ajouté.')
      close()
      return true
    }
    catch {
      toast.error('Échec de l\'enregistrement.')
      return false
    }
    finally {
      isSaving.value = false
    }
  }

  return {
    dialogOpen,
    isEditing,
    isSaving,
    formRef,
    form,
    title,
    rules: { required, positive, optionalFactor },
    openCreate,
    openEdit,
    close,
    submit,
  }
}
