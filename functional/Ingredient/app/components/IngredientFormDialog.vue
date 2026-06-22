<template>
  <v-dialog
    v-model="dialogOpen"
    :fullscreen="mobile"
    :max-width="mobile ? undefined : 520"
    scrollable
  >
    <v-card class="ingredient-dialog">
      <v-card-title class="ingredient-dialog__title">
        <span>{{ title }}</span>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          aria-label="Fermer"
          @click="close"
        />
      </v-card-title>

      <v-card-text>
        <v-form
          ref="formRef"
          class="ingredient-dialog__form"
          @submit.prevent="submit"
        >
          <v-text-field
            v-model="form.name"
            label="Nom"
            prepend-inner-icon="mdi-tag-outline"
            :rules="[rules.required]"
          />

          <v-btn-toggle
            v-model="form.unitType"
            mandatory
            divided
            color="primary"
            class="ingredient-dialog__units"
          >
            <v-btn
              v-for="unit in UNIT_OPTIONS"
              :key="unit.value"
              :value="unit.value"
              :prepend-icon="unit.icon"
            >
              {{ unit.label }}
            </v-btn>
          </v-btn-toggle>

          <p class="ingredient-dialog__hint">
            Valeurs nutritionnelles pour {{ baseLabel }}
          </p>
          <div class="ingredient-dialog__grid">
            <v-text-field
              v-model.number="form.calories"
              label="Calories"
              type="number"
              suffix="kcal"
              :rules="[rules.positive]"
            />
            <v-text-field
              v-model.number="form.proteinG"
              label="Protéines"
              type="number"
              suffix="g"
              :rules="[rules.positive]"
            />
            <v-text-field
              v-model.number="form.carbG"
              label="Glucides"
              type="number"
              suffix="g"
              :rules="[rules.positive]"
            />
            <v-text-field
              v-model.number="form.fatG"
              label="Lipides"
              type="number"
              suffix="g"
              :rules="[rules.positive]"
            />
          </div>

          <v-text-field
            v-model.number="form.priceEuros"
            label="Prix de référence"
            type="number"
            prefix="€"
            :suffix="priceSuffix"
            prepend-inner-icon="mdi-cash"
            :rules="[rules.positive]"
          />

          <v-select
            v-model="form.foodTypeIds"
            :items="foodTypes"
            item-title="types"
            item-value="id"
            label="Catégories (optionnel)"
            prepend-inner-icon="mdi-shape-outline"
            multiple
            chips
            hide-details
          />
        </v-form>
      </v-card-text>

      <v-card-actions class="ingredient-dialog__actions">
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
          @click="submit"
        >
          Enregistrer
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { UNIT_OPTIONS } from '../types/ingredient'

const { mobile } = useDisplay()
const { foodTypes } = useFoodTypes()
const {
  dialogOpen,
  isSaving,
  formRef,
  form,
  title,
  rules,
  openCreate,
  openEdit,
  close,
  submit,
} = useIngredientForm()

const baseLabel = computed(() => baseQuantityLabel(form.unitType))
const priceSuffix = computed(() => priceUnitLabel(form.unitType))

defineExpose({ openCreate, openEdit })
</script>

<style scoped lang="scss">
.ingredient-dialog {
  &__title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-top: 0.5rem;
  }

  &__units {
    width: 100%;

    .v-btn {
      flex: 1 1 0;
    }
  }

  &__hint {
    font-size: 0.78rem;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-bottom: -0.4rem;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  &__actions {
    justify-content: flex-end;
    padding: 0.5rem 1rem 1rem;
  }
}
</style>
