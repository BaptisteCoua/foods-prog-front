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
          <template v-if="isMine">
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
          </template>
          <v-chip
            v-else-if="recipe.alreadySaved"
            color="primary"
            variant="tonal"
            size="small"
            prepend-icon="mdi-bookmark-check"
          >
            Déjà enregistrée
          </v-chip>
          <v-btn
            v-else
            color="primary"
            variant="tonal"
            size="small"
            prepend-icon="mdi-bookmark-plus-outline"
            :loading="isCloning"
            @click="onClone"
          >
            Enregistrer
          </v-btn>
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

      <!-- Publish toggle (owner only) -->
      <div
        v-if="isMine"
        class="recipe-detail__share"
      >
        <div class="recipe-detail__share-text">
          <span class="recipe-detail__share-title">Partager publiquement</span>
          <span class="recipe-detail__share-sub">
            {{ isPublic ? 'Visible par toute la communauté.' : 'Visible par toi seul·e.' }}
          </span>
        </div>
        <v-switch
          v-model="isPublic"
          color="primary"
          density="comfortable"
          hide-details
          :loading="isPublishing"
          aria-label="Partager publiquement"
        />
      </div>

      <!-- Portion simulator (client-side, not persisted) -->
      <div class="recipe-detail__portions">
        <div class="recipe-detail__portions-label">
          <span class="recipe-detail__portions-title">Portions</span>
          <button
            v-if="isScaled"
            type="button"
            class="recipe-detail__portions-reset"
            @click="reset"
          >
            Réinitialiser (1)
          </button>
        </div>
        <div class="recipe-detail__stepper">
          <v-btn
            icon="mdi-minus"
            variant="tonal"
            size="small"
            density="comfortable"
            aria-label="Moins de portions"
            :disabled="portions <= 1"
            @click="decrement"
          />
          <span class="recipe-detail__stepper-value">{{ portions }}</span>
          <v-btn
            icon="mdi-plus"
            variant="tonal"
            size="small"
            density="comfortable"
            aria-label="Plus de portions"
            @click="increment"
          />
        </div>
      </div>

      <!-- Per-serving nutrition -->
      <AppReveal>
        <v-card
          class="recipe-detail__nutrition"
          elevation="0"
        >
          <div class="recipe-detail__nutrition-head">
            <span class="recipe-detail__kcal">{{ formatKcal(shownNutrition.calories) }}</span>
            <span class="recipe-detail__per">{{ nutritionLabel }} · {{ formatCost(shownNutrition.costCents) }}</span>
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
              <b>{{ formatMacro(shownNutrition.proteinG) }}</b>
              <small>Protéines</small>
            </div>
            <div class="recipe-detail__macro">
              <span class="recipe-detail__dot recipe-detail__dot--carb" />
              <b>{{ formatMacro(shownNutrition.carbG) }}</b>
              <small>Glucides</small>
            </div>
            <div class="recipe-detail__macro">
              <span class="recipe-detail__dot recipe-detail__dot--fat" />
              <b>{{ formatMacro(shownNutrition.fatG) }}</b>
              <small>Lipides</small>
            </div>
          </div>

          <p
            v-if="recipe.servings > 1 || isScaled"
            class="recipe-detail__total"
          >
            Recette entière ({{ recipe.servings }} portion{{ recipe.servings > 1 ? 's' : '' }}) :
            {{ formatKcal(recipe.total.calories) }} · {{ formatCost(recipe.total.costCents) }}
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
            v-for="line in scaledIngredients"
            :key="line.id"
            class="recipe-detail__line"
          >
            <span>{{ line.name }}</span>
            <span class="recipe-detail__qty">
              {{ formatQuantity(line.quantity) }} {{ quantityUnit(line.unitType) }}
              <small
                v-if="formatCookedWeight(line.quantity, line.cookedFactor, line.unitType)"
                class="recipe-detail__qty-cooked"
              >
                {{ formatCookedWeight(line.quantity, line.cookedFactor, line.unitType) }}
              </small>
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

    <AppSheet
      v-model="confirmOpen"
      :max-width="400"
    >
      <div class="recipe-detail__confirm">
        <header class="recipe-detail__confirm-title">
          Supprimer ?
        </header>
        <p class="recipe-detail__confirm-text">
          Supprimer « {{ recipe?.name }} » ? Cette action est définitive.
        </p>
        <div class="recipe-detail__confirm-actions">
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
        </div>
      </div>
    </AppSheet>
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue3-toastify'
import type { Recipe } from '../../types/recipe'

const route = useRoute()
const id = computed(() => Number(route.params.id))

const { recipe, pending, error, refresh } = useRecipeDetail(id)
const { remove, setVisibility, clone } = useRecipes()
const profileStore = useProfileStore()

const { portions, isScaled, scaledTotal, scaledIngredients, increment, decrement, reset }
  = useRecipePortions(recipe)

const formDialog = useTemplateRef('formDialog')
const confirmOpen = ref(false)
const isDeleting = ref(false)

// Only the owner edits/deletes/publishes. A recipe that isn't mine (global
// catalog or another user's public recipe) can be cloned into my collection.
const isMine = computed(() =>
  recipe.value?.userId != null && recipe.value.userId === profileStore.profile?.userId)

// Publish toggle (PUBLIC ↔ PRIVATE), bound to the switch.
const isPublishing = ref(false)
const isPublic = computed({
  get: () => recipe.value?.visibility === 'PUBLIC',
  set: (value) => {
    void togglePublish(value)
  },
})

const togglePublish = async (value: boolean) => {
  if (!recipe.value || isPublishing.value) return
  isPublishing.value = true
  try {
    await setVisibility(recipe.value.id, value ? 'PUBLIC' : 'PRIVATE')
    await refresh()
    toast.success(value ? 'Recette partagée avec la communauté.' : 'Recette repassée en privé.')
  }
  catch {
    toast.error('Impossible de mettre à jour le partage.')
  }
  finally {
    isPublishing.value = false
  }
}

const isCloning = ref(false)
const onClone = async () => {
  if (!recipe.value || isCloning.value) return
  isCloning.value = true
  try {
    const created = await clone(recipe.value.id)
    toast.success('Recette ajoutée à tes recettes.')
    navigateTo(`/recipes/${created.id}`)
  }
  catch {
    toast.error('Impossible d\'enregistrer cette recette.')
  }
  finally {
    isCloning.value = false
  }
}

useHead(() => ({ title: recipe.value?.name ?? 'Recette' }))

const EMPTY_NUTRITION = { calories: 0, proteinG: 0, carbG: 0, fatG: 0, costCents: 0 }

// Nutrition shown in the headline card, scaled to the selected portions.
// `scaledTotal` is perServing × portions (the nutrition for `portions` servings);
// at 1 portion it equals the canonical per-serving values.
const shownNutrition = computed(() => scaledTotal.value ?? recipe.value?.perServing ?? EMPTY_NUTRITION)

const nutritionLabel = computed(() =>
  isScaled.value ? `pour ${portions.value} portions` : 'par portion')

// Calorie contribution split for the macro bar (protein/carb 4 kcal/g, fat 9).
const macroSplit = computed(() => {
  const n = shownNutrition.value
  const p = n.proteinG * 4
  const c = n.carbG * 4
  const f = n.fatG * 9
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

  &__share {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.5rem 1rem;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    border-radius: 14px;
  }

  &__share-text {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  &__share-title {
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  &__share-sub {
    font-size: 0.78rem;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__portions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.85rem 1rem;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    border-radius: 14px;
  }

  &__portions-label {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  &__portions-title {
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__portions-reset {
    align-self: flex-start;
    font-size: 0.78rem;
    font-weight: 600;
    color: rgb(var(--v-theme-primary));
    transition: opacity 0.18s var(--app-ease);

    &:hover {
      opacity: 0.75;
    }
  }

  &__stepper {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }

  &__stepper-value {
    min-width: 1.5ch;
    text-align: center;
    font-size: 1.25rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
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
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    color: rgb(var(--v-theme-on-surface-variant));
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  &__qty-cooked {
    font-size: 0.74rem;
    color: rgb(var(--v-theme-primary));
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

  &__confirm-title {
    padding: 0.25rem 1.25rem 0.5rem;
    font-size: 1.2rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  &__confirm-text {
    padding: 0 1.25rem;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__confirm-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 1rem 1.25rem 1.4rem;
  }
}
</style>
