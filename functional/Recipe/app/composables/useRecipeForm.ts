import { toast } from 'vue3-toastify'
import type { VForm } from 'vuetify/components'
import type { Recipe, RecipePayload } from '../types/recipe'

interface IngredientLine {
  ingredientId: number | null
  quantity: number | null
}

interface RecipeFormState {
  name: string
  servings: number | null
  prepTimeMin: number | null
  cookTimeMin: number | null
  description: string
  steps: string
  mealTypeIds: number[]
  lines: IngredientLine[]
}

const createForm = (): RecipeFormState => ({
  name: '',
  servings: 1,
  prepTimeMin: null,
  cookTimeMin: null,
  description: '',
  steps: '',
  mealTypeIds: [],
  lines: [{ ingredientId: null, quantity: null }],
})

// Owns the create/edit dialog: open state, the form (scalars + ingredient
// lines), validation and the submit that maps to the API payload. Nutrition is
// computed server-side, so we only collect quantities + ingredient ids.
export const useRecipeForm = () => {
  const { create, update } = useRecipes()
  const { required } = useValidationRules()

  const dialogOpen = ref(false)
  const editingId = ref<number | null>(null)
  const isSaving = ref(false)
  const formRef = ref<VForm | null>(null)
  const form = reactive<RecipeFormState>(createForm())

  const isEditing = computed(() => editingId.value !== null)
  const title = computed(() => (isEditing.value ? 'Modifier la recette' : 'Nouvelle recette'))

  const positive = (value: unknown) =>
    (value !== null && value !== '' && Number(value) >= 1) || 'Au moins 1.'

  const reset = () => Object.assign(form, createForm())

  const addLine = () => form.lines.push({ ingredientId: null, quantity: null })
  const removeLine = (index: number) => {
    form.lines.splice(index, 1)
    if (!form.lines.length) addLine()
  }

  const openCreate = () => {
    reset()
    editingId.value = null
    dialogOpen.value = true
  }

  const openEdit = (recipe: Recipe) => {
    editingId.value = recipe.id
    Object.assign(form, {
      name: recipe.name,
      servings: recipe.servings,
      prepTimeMin: recipe.prepTimeMin,
      cookTimeMin: recipe.cookTimeMin,
      description: recipe.description ?? '',
      steps: recipe.steps ?? '',
      mealTypeIds: recipe.mealTypes.map(type => type.id),
      lines: recipe.recipeIngredients.length
        ? recipe.recipeIngredients.map(line => ({
            ingredientId: line.ingredient.id,
            quantity: line.quantity,
          }))
        : [{ ingredientId: null, quantity: null }],
    })
    dialogOpen.value = true
  }

  const close = () => {
    dialogOpen.value = false
  }

  const buildPayload = (): RecipePayload => {
    const lines = form.lines
      .filter(line => line.ingredientId !== null && Number(line.quantity) > 0)
      .map(line => ({
        quantity: Number(line.quantity),
        ingredient: { id: line.ingredientId as number },
      }))

    const payload: RecipePayload = {
      name: form.name.trim(),
      servings: Number(form.servings),
      recipeIngredients: lines,
      mealTypes: form.mealTypeIds.map(id => ({ id })),
    }
    if (form.description.trim()) payload.description = form.description.trim()
    if (form.steps.trim()) payload.steps = form.steps.trim()
    if (form.prepTimeMin !== null) payload.prepTimeMin = Number(form.prepTimeMin)
    if (form.cookTimeMin !== null) payload.cookTimeMin = Number(form.cookTimeMin)
    return payload
  }

  const submit = async () => {
    const validation = await formRef.value?.validate()
    if (!validation?.valid) return

    isSaving.value = true
    try {
      const payload = buildPayload()
      const recipe = editingId.value !== null
        ? await update(editingId.value, payload)
        : await create(payload)
      toast.success(isEditing.value ? 'Recette mise à jour.' : 'Recette créée.')
      close()
      return recipe
    }
    catch {
      toast.error('Échec de l\'enregistrement.')
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
    rules: { required, positive },
    addLine,
    removeLine,
    openCreate,
    openEdit,
    close,
    submit,
  }
}
