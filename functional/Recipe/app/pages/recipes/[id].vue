<template>
  <div class="recipe-detail">
    <button
      type="button"
      class="recipe-detail__back"
      @click="goBack"
    >
      <v-icon
        icon="mdi-chevron-left"
        size="20"
      />
      Recettes
    </button>

    <!-- Loading -->
    <div
      v-if="pending"
      class="recipe-detail__loading"
    >
      <v-skeleton-loader type="article, list-item-three-line, paragraph" />
    </div>

    <!-- Error / not found -->
    <v-card
      v-else-if="error || !recipe"
      class="recipe-detail__state"
      elevation="0"
    >
      <v-icon
        icon="mdi-alert-circle-outline"
        size="26"
        color="error"
      />
      <p>Cette recette est introuvable.</p>
      <v-btn
        variant="tonal"
        prepend-icon="mdi-arrow-left"
        @click="goBack"
      >
        Retour aux recettes
      </v-btn>
    </v-card>

    <template v-else>
      <v-img
        v-if="recipe.img"
        :src="recipe.img"
        :alt="recipe.name"
        class="recipe-detail__image"
        cover
        rounded="xl"
        :aspect-ratio="16 / 9"
      />

      <header class="recipe-detail__head">
        <div>
          <h1 class="recipe-detail__title">
            {{ recipe.name }}
          </h1>
          <p class="recipe-detail__meta">
            {{ recipe.servings }} portion{{ recipe.servings > 1 ? 's' : '' }} ·
            {{ formatTotalTime(recipe.prepTimeMin, recipe.cookTimeMin) }}
          </p>
        </div>
        <div class="recipe-detail__head-actions">
          <v-btn
            icon="mdi-pencil"
            variant="tonal"
            size="small"
            aria-label="Modifier"
            @click="openEdit(recipe)"
          />
          <v-btn
            icon="mdi-delete-outline"
            variant="tonal"
            size="small"
            color="error"
            aria-label="Supprimer"
            @click="confirmOpen = true"
          />
        </div>
      </header>

      <div
        v-if="recipe.mealTypes.length || recipe.dietaryRegimes.length"
        class="recipe-detail__tags"
      >
        <v-chip
          v-for="type in recipe.mealTypes"
          :key="`meal-${type.id}`"
          size="small"
          variant="tonal"
        >
          {{ type.name }}
        </v-chip>
        <v-chip
          v-for="regime in recipe.dietaryRegimes"
          :key="`regime-${regime.id}`"
          size="small"
          variant="tonal"
          color="primary"
          prepend-icon="mdi-leaf"
        >
          {{ regime.name }}
        </v-chip>
      </div>

      <!-- Per-serving nutrition -->
      <AppReveal>
        <v-card
          class="recipe-detail__nutrition"
          elevation="0"
        >
          <div class="recipe-detail__nutrition-head">
            <span class="recipe-detail__kcal">{{ formatKcal(recipe.perServing.calories) }}</span>
            <span class="recipe-detail__per">par portion · {{ formatCost(recipe.perServing.costCents) }}</span>
          </div>

          <div class="recipe-detail__bar">
            <span
              class="recipe-detail__bar-seg recipe-detail__bar-seg--protein"
              :style="{ width: `${macroSplit.protein}%` }"
            />
            <span
              class="recipe-detail__bar-seg recipe-detail__bar-seg--carb"
              :style="{ width: `${macroSplit.carb}%` }"
            />
            <span
              class="recipe-detail__bar-seg recipe-detail__bar-seg--fat"
              :style="{ width: `${macroSplit.fat}%` }"
            />
          </div>

          <div class="recipe-detail__macros">
            <div class="recipe-detail__macro">
              <span class="recipe-detail__dot recipe-detail__dot--protein" />
              <b>{{ formatMacro(recipe.perServing.proteinG) }}</b>
              <small>Protéines</small>
            </div>
            <div class="recipe-detail__macro">
              <span class="recipe-detail__dot recipe-detail__dot--carb" />
              <b>{{ formatMacro(recipe.perServing.carbG) }}</b>
              <small>Glucides</small>
            </div>
            <div class="recipe-detail__macro">
              <span class="recipe-detail__dot recipe-detail__dot--fat" />
              <b>{{ formatMacro(recipe.perServing.fatG) }}</b>
              <small>Lipides</small>
            </div>
          </div>

          <p class="recipe-detail__total">
            Recette entière : {{ formatKcal(recipe.total.calories) }} · {{ formatCost(recipe.total.costCents) }}
          </p>
        </v-card>
      </AppReveal>

      <!-- Ingredients -->
      <section class="recipe-detail__section">
        <h2 class="recipe-detail__section-title">
          Ingrédients
        </h2>
        <div
          v-if="!recipe.recipeIngredients.length"
          class="recipe-detail__empty"
        >
          Aucun ingrédient dans cette recette.
        </div>
        <ul
          v-else
          class="recipe-detail__lines"
        >
          <li
            v-for="line in recipe.recipeIngredients"
            :key="line.id"
            class="recipe-detail__line"
          >
            <span>{{ line.ingredient.name }}</span>
            <span class="recipe-detail__qty">
              {{ line.quantity }} {{ quantityUnit(line.ingredient.unitType) }}
            </span>
          </li>
        </ul>
      </section>

      <!-- Description -->
      <section
        v-if="recipe.description"
        class="recipe-detail__section"
      >
        <h2 class="recipe-detail__section-title">
          Description
        </h2>
        <p class="recipe-detail__text">
          {{ recipe.description }}
        </p>
      </section>

      <!-- Steps -->
      <section
        v-if="recipe.steps"
        class="recipe-detail__section"
      >
        <h2 class="recipe-detail__section-title">
          Préparation
        </h2>
        <p class="recipe-detail__text recipe-detail__text--pre">
          {{ recipe.steps }}
        </p>
      </section>
    </template>

    <RecipeFormDialog
      ref="formDialog"
      @saved="() => refresh()"
    />

    <v-dialog
      v-model="confirmOpen"
      max-width="400"
    >
      <v-card class="recipe-detail__confirm">
        <v-card-title>Supprimer ?</v-card-title>
        <v-card-text>
          Supprimer « {{ recipe?.name }} » ? Cette action est définitive.
        </v-card-text>
        <v-card-actions class="recipe-detail__confirm-actions">
          <v-btn
            variant="text"
            @click="confirmOpen = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="error"
            flat
            :loading="isDeleting"
            @click="onDelete"
          >
            Supprimer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue3-toastify'
import type { Recipe } from '../../types/recipe'

const route = useRoute()
const id = computed(() => Number(route.params.id))

const { recipe, pending, error, refresh } = useRecipeDetail(id)
const { remove } = useRecipes()

const formDialog = useTemplateRef('formDialog')
const confirmOpen = ref(false)
const isDeleting = ref(false)

useHead(() => ({ title: recipe.value?.name ?? 'Recette' }))

// Calorie contribution split for the macro bar (protein/carb 4 kcal/g, fat 9).
const macroSplit = computed(() => {
  const serving = recipe.value?.perServing
  if (!serving) return { protein: 0, carb: 0, fat: 0 }
  const p = serving.proteinG * 4
  const c = serving.carbG * 4
  const f = serving.fatG * 9
  const sum = p + c + f
  if (!sum) return { protein: 0, carb: 0, fat: 0 }
  return {
    protein: (p / sum) * 100,
    carb: (c / sum) * 100,
    fat: (f / sum) * 100,
  }
})

const openEdit = (value: Recipe) => formDialog.value?.openEdit(value)
const goBack = () => navigateTo('/recipes')

const onDelete = async () => {
  if (!recipe.value) return
  isDeleting.value = true
  try {
    await remove(recipe.value.id)
    toast.success('Recette supprimée.')
    confirmOpen.value = false
    navigateTo('/recipes')
  }
  catch {
    toast.error('Suppression impossible.')
  }
  finally {
    isDeleting.value = false
  }
}
</script>

<style scoped lang="scss">
.recipe-detail {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;

  &__back {
    display: inline-flex;
    align-items: center;
    gap: 0.15rem;
    align-self: flex-start;
    font-size: 0.85rem;
    font-weight: 600;
    color: rgb(var(--v-theme-on-surface-variant));
    transition: color 0.18s var(--app-ease);

    &:hover {
      color: rgb(var(--v-theme-primary));
    }
  }

  &__image {
    width: 100%;
    max-height: 280px;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  }

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  &__title {
    font-size: 1.6rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.15;
  }

  &__meta {
    font-size: 0.85rem;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-top: 0.25rem;
  }

  &__head-actions {
    display: flex;
    gap: 0.4rem;
    flex-shrink: 0;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  &__nutrition {
    padding: 1.25rem;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__nutrition-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem;
  }

  &__kcal {
    font-size: 1.9rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    font-variant-numeric: tabular-nums;
  }

  &__per {
    font-size: 0.82rem;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__bar {
    display: flex;
    height: 10px;
    border-radius: 999px;
    overflow: hidden;
    background: rgba(var(--v-border-color), 0.12);
  }

  &__bar-seg {
    height: 100%;
    transition: width 0.9s var(--app-ease);

    &--protein { background: rgb(var(--v-theme-protein)); }
    &--carb { background: rgb(var(--v-theme-carb)); }
    &--fat { background: rgb(var(--v-theme-fat)); }
  }

  &__macros {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
  }

  &__macro {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.15rem;
    font-variant-numeric: tabular-nums;

    b {
      font-size: 1.05rem;
      font-weight: 700;
    }

    small {
      font-size: 0.72rem;
      color: rgb(var(--v-theme-on-surface-variant));
    }
  }

  &__dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;

    &--protein { background: rgb(var(--v-theme-protein)); }
    &--carb { background: rgb(var(--v-theme-carb)); }
    &--fat { background: rgb(var(--v-theme-fat)); }
  }

  &__total {
    font-size: 0.8rem;
    color: rgb(var(--v-theme-on-surface-variant));
    border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    padding-top: 0.75rem;
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  &__section-title {
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__lines {
    display: flex;
    flex-direction: column;
    list-style: none;
    padding: 0;
  }

  &__line {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.7rem 0.25rem;
    border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    font-size: 0.92rem;

    &:last-child {
      border-bottom: none;
    }
  }

  &__qty {
    color: rgb(var(--v-theme-on-surface-variant));
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  &__text {
    font-size: 0.92rem;
    line-height: 1.6;
    color: rgb(var(--v-theme-on-surface));

    &--pre {
      white-space: pre-line;
    }
  }

  &__empty {
    font-size: 0.88rem;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__confirm-actions {
    justify-content: flex-end;
    padding: 0.5rem 1rem 1rem;
  }
}
</style>
