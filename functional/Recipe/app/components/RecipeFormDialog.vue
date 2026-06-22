<template>
  <v-dialog
    v-model="dialogOpen"
    :fullscreen="mobile"
    :max-width="mobile ? undefined : 600"
    scrollable
  >
    <v-card class="recipe-dialog">
      <v-card-title class="recipe-dialog__title">
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
          class="recipe-dialog__form"
          @submit.prevent="onSubmit"
        >
          <v-text-field
            v-model="form.name"
            label="Nom de la recette"
            prepend-inner-icon="mdi-silverware-fork-knife"
            :rules="[rules.required]"
          />

          <div class="recipe-dialog__image">
            <v-avatar
              class="recipe-dialog__image-preview"
              size="56"
              rounded="lg"
            >
              <v-img
                v-if="form.img.trim()"
                :src="form.img.trim()"
                cover
                alt="Aperçu du plat"
              />
              <v-icon
                v-else
                icon="mdi-image-outline"
                color="on-surface-variant"
              />
            </v-avatar>
            <v-text-field
              v-model="form.img"
              label="Image du plat (URL, optionnel)"
              prepend-inner-icon="mdi-link-variant"
              placeholder="https://…"
              hide-details
              class="recipe-dialog__image-field"
            />
          </div>

          <div class="recipe-dialog__grid">
            <v-text-field
              v-model.number="form.servings"
              label="Portions"
              type="number"
              min="1"
              prepend-inner-icon="mdi-account-group-outline"
              :rules="[rules.positive]"
            />
            <v-text-field
              v-model.number="form.prepTimeMin"
              label="Prépa."
              type="number"
              min="0"
              suffix="min"
            />
            <v-text-field
              v-model.number="form.cookTimeMin"
              label="Cuisson"
              type="number"
              min="0"
              suffix="min"
            />
          </div>

          <!-- Ingredient lines -->
          <div class="recipe-dialog__section">
            <span class="recipe-dialog__section-title">Ingrédients</span>
            <p
              v-if="!ingredients.length"
              class="recipe-dialog__hint"
            >
              Ta bibliothèque est vide — ajoute d'abord des ingrédients.
            </p>
            <div
              v-for="(line, index) in form.lines"
              :key="index"
              class="recipe-dialog__line"
            >
              <v-select
                v-model="line.ingredientId"
                :items="ingredients"
                item-title="name"
                item-value="id"
                label="Ingrédient"
                density="comfortable"
                hide-details
                class="recipe-dialog__line-select"
              />
              <v-text-field
                v-model.number="line.quantity"
                type="number"
                min="0"
                label="Qté"
                :suffix="lineUnit(line.ingredientId)"
                density="comfortable"
                hide-details
                class="recipe-dialog__line-qty"
              />
              <v-btn
                icon="mdi-close"
                variant="text"
                size="small"
                density="comfortable"
                aria-label="Retirer"
                @click="removeLine(index)"
              />
            </div>
            <v-btn
              variant="text"
              size="small"
              prepend-icon="mdi-plus"
              class="recipe-dialog__add"
              @click="addLine"
            >
              Ajouter un ingrédient
            </v-btn>
          </div>

          <v-select
            v-model="form.mealTypeIds"
            :items="mealTypes"
            item-title="name"
            item-value="id"
            label="Type de repas (optionnel)"
            prepend-inner-icon="mdi-tag-multiple-outline"
            multiple
            chips
            hide-details
          />

          <v-textarea
            v-model="form.description"
            label="Description (optionnel)"
            rows="2"
            auto-grow
            prepend-inner-icon="mdi-text-short"
          />

          <v-textarea
            v-model="form.steps"
            label="Étapes (optionnel)"
            rows="3"
            auto-grow
            prepend-inner-icon="mdi-format-list-numbered"
          />
        </v-form>
      </v-card-text>

      <v-card-actions class="recipe-dialog__actions">
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
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'
import type { Recipe } from '../types/recipe'

const emit = defineEmits<{ saved: [Recipe] }>()

const { mobile } = useDisplay()
const { items: ingredients } = useIngredients()
const { mealTypes } = useMealTypes()
const {
  dialogOpen,
  isSaving,
  formRef,
  form,
  title,
  rules,
  addLine,
  removeLine,
  openCreate,
  openEdit,
  close,
  submit,
} = useRecipeForm()

const lineUnit = (ingredientId: number | null): string => {
  const ingredient = ingredients.value.find(item => item.id === ingredientId)
  if (!ingredient) return ''
  return quantityUnit(ingredient.unitType)
}

const onSubmit = async () => {
  const recipe = await submit()
  if (recipe) emit('saved', recipe)
}

defineExpose({ openCreate, openEdit })
</script>

<style scoped lang="scss">
.recipe-dialog {
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

  &__image {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__image-preview {
    flex: 0 0 auto;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  }

  &__image-field {
    flex: 1 1 auto;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0.6rem;
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.85rem;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    border-radius: 16px;
  }

  &__section-title {
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__hint {
    font-size: 0.8rem;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__line {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__line-select {
    flex: 1 1 auto;
  }

  &__line-qty {
    flex: 0 0 7rem;
  }

  &__add {
    align-self: flex-start;
  }

  &__actions {
    justify-content: flex-end;
    padding: 0.5rem 1rem 1rem;
  }
}
</style>
