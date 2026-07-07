<template>
  <AppSheet
    v-model="open"
    :max-width="480"
    :title="title"
  >
    <div class="pantry-sheet">
      <header class="pantry-sheet__title">
        {{ title }}
      </header>

      <div class="pantry-sheet__content">
        <v-form
          ref="formRef"
          class="pantry-sheet__form"
          @submit.prevent="onSubmit"
        >
          <RecipeIngredientSelect
            v-if="!editing"
            :model-value="ingredientId"
            :selected="selectedIngredient"
            @update:model-value="ingredientId = $event"
            @select="onIngredientSelect"
          />
          <p
            v-else
            class="pantry-sheet__ingredient"
          >
            {{ editing.name }}
          </p>

          <v-text-field
            v-model.number="quantity"
            label="Quantité en stock"
            type="number"
            min="0"
            :suffix="suffix"
            :rules="[rules.required, positive]"
          />
        </v-form>
      </div>

      <div class="pantry-sheet__actions">
        <v-btn
          variant="text"
          @click="close"
        >
          Annuler
        </v-btn>
        <v-btn
          color="primary"
          flat
          :loading="isSaving"
          @click="onSubmit"
        >
          Enregistrer
        </v-btn>
      </div>
    </div>
  </AppSheet>
</template>

<script setup lang="ts">
import type { VForm } from 'vuetify/components'
import type { Ingredient } from '../../../Ingredient/app/types/ingredient'
import type { PantryLine } from '../types/pantry'
import { quantitySuffix } from '../utils/pantryFormat'

// Add / edit sheet for a pantry line. In add mode an ingredient is picked; in
// edit mode the ingredient is fixed and only its available quantity is changed.
// Emits `save(ingredientId, quantity)` — the board sets the absolute quantity.
const props = defineProps<{
  editing: PantryLine | null
  isSaving: boolean
}>()

const open = defineModel<boolean>({ required: true })

const emit = defineEmits<{ save: [ingredientId: number, quantity: number] }>()

const { required } = useValidationRules()
const rules = { required }
const positive = (value: unknown) =>
  (value !== null && value !== '' && Number(value) >= 0) || 'Valeur positive requise.'

const formRef = ref<VForm | null>(null)
const ingredientId = ref<number | null>(null)
const selectedIngredient = ref<Ingredient | null>(null)
const quantity = ref<number | null>(null)

const title = computed(() =>
  props.editing ? 'Modifier la quantité' : 'Ajouter au garde-manger',
)
const suffix = computed(() => {
  if (props.editing) return quantitySuffix(props.editing.unitType)
  return selectedIngredient.value
    ? quantitySuffix(selectedIngredient.value.unitType)
    : ''
})

// Reset / prefill on each open (the sheet stays mounted between uses).
watch(open, (isOpen) => {
  if (!isOpen) return
  if (props.editing) {
    ingredientId.value = props.editing.ingredientId
    selectedIngredient.value = null
    quantity.value = Math.max(0, props.editing.availableQuantity)
  }
  else {
    ingredientId.value = null
    selectedIngredient.value = null
    quantity.value = null
  }
  formRef.value?.resetValidation()
})

const onIngredientSelect = (ingredient: Ingredient | null) => {
  selectedIngredient.value = ingredient
}

const close = () => {
  open.value = false
}

const onSubmit = async () => {
  const validation = await formRef.value?.validate()
  if (!validation?.valid || ingredientId.value === null) return
  emit('save', ingredientId.value, Number(quantity.value))
}
</script>

<style scoped lang="scss">
.pantry-sheet {
  &__title {
    padding: 0.25rem 1.25rem 0.75rem;
    font-size: 1.2rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  &__content {
    padding: 0 1.25rem;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-top: 0.5rem;
  }

  &__ingredient {
    font-size: 1.05rem;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 1rem 1.25rem 1.4rem;
  }
}
</style>
