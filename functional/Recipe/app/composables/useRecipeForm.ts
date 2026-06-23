import { toast } from 'vue3-toastify'
import type { VForm } from 'vuetify/components'
import type { Ingredient } from '../../../Ingredient/app/types/ingredient'
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
  img: string
  mealTypeIds: number[]
  dietaryRegimeIds: number[]
  lines: IngredientLine[]
}

const createForm = (): RecipeFormState => ({
  name: '',
  servings: 1,
  prepTimeMin: null,
  cookTimeMin: null,
  description: '',
  steps: '',
  img: '',
  mealTypeIds: [],
  dietaryRegimeIds: [],
  lines: [{ ingredientId: null, quantity: null }],
})

// Owns the create/edit dialog: open state, the form (scalars + ingredient
// lines), validation and the submit that maps to the API payload. Nutrition is
// computed server-side, so we only collect quantities + ingredient ids.
export const useRecipeForm = () => {
  const { create, update } = useRecipes()
  const { items: ingredientLibrary } = useIngredients()
  const { required } = useValidationRules()

  const dialogOpen = ref(false)
  const editingId = ref<number | null>(null)
  const isSaving = ref(false)
  const formRef = ref<VForm | null>(null)
  const form = reactive<RecipeFormState>(createForm())

  // Full ingredient objects for the ids picked across the lines. The picker now
  // searches server-side, so a selected ingredient may not be in the shared 100
  // item library cache — we keep it here so the unit suffix and nutrition
  // preview resolve correctly whatever the catalog size.
  const selectedIngredients = ref<Record<number, Ingredient>>({})

  const registerIngredient = (ingredient: Ingredient | null) => {
    if (ingredient) selectedIngredients.value[ingredient.id] = ingredient
  }

  const resolveIngredient = (ingredientId: number | null): Ingredient | null => {
    if (ingredientId === null) return null
    return selectedIngredients.value[ingredientId]
      ?? ingredientLibrary.value.find(item => item.id === ingredientId)
      ?? null
  }

  const isEditing = computed(() => editingId.value !== null)
  const title = computed(() => (isEditing.value ? 'Modifier la recette' : 'Nouvelle recette'))

  const positive = (value: unknown) =>
    (value !== null && value !== '' && Number(value) >= 1) || 'Au moins 1.'

  // Live estimate while the user types: API computes the canonical nutrition on
  // save, but there is no persisted value yet, so we approximate from the
  // library macros (per 100 g/ml × quantity). Marked as an estimate in the UI.
  const nutritionPreview = computed(() => {
    const total = { calories: 0, proteinG: 0, carbG: 0, fatG: 0 }
    for (const line of form.lines) {
      const quantity = Number(line.quantity)
      if (line.ingredientId === null || !(quantity > 0)) continue
      const ingredient = resolveIngredient(line.ingredientId)
      if (!ingredient) continue
      const factor = quantity / 100
      total.calories += ingredient.calories * factor
      total.proteinG += ingredient.proteinG * factor
      total.carbG += ingredient.carbG * factor
      total.fatG += ingredient.fatG * factor
    }
    const servings = Math.max(1, Number(form.servings) || 1)
    const perServing = {
      calories: total.calories / servings,
      proteinG: total.proteinG / servings,
      carbG: total.carbG / servings,
      fatG: total.fatG / servings,
    }
    return { total, perServing, hasData: total.calories > 0 }
  })

  const reset = () => {
    Object.assign(form, createForm())
    selectedIngredients.value = {}
  }

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
    // Seed the selected ingredients from the recipe so labels render and the
    // preview is correct even if these ingredients aren't in the library cache.
    selectedIngredients.value = {}
    recipe.recipeIngredients.forEach(line => registerIngredient(line.ingredient))
    Object.assign(form, {
      name: recipe.name,
      servings: recipe.servings,
      prepTimeMin: recipe.prepTimeMin,
      cookTimeMin: recipe.cookTimeMin,
      description: recipe.description ?? '',
      steps: recipe.steps ?? '',
      img: recipe.img ?? '',
      mealTypeIds: recipe.mealTypes.map(type => type.id),
      dietaryRegimeIds: recipe.dietaryRegimes.map(regime => regime.id),
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
      dietaryRegimes: form.dietaryRegimeIds.map(id => ({ id })),
    }
    if (form.description.trim()) payload.description = form.description.trim()
    if (form.steps.trim()) payload.steps = form.steps.trim()
    if (form.img.trim()) payload.img = form.img.trim()
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
    nutritionPreview,
    rules: { required, positive },
    resolveIngredient,
    registerIngredient,
    addLine,
    removeLine,
    openCreate,
    openEdit,
    close,
    submit,
  }
}
