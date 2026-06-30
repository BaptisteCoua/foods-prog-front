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
          <!-- Pastille enregistrement : compteur + toggle (lecture seule si ma recette). -->
          <RecipeSaveButton
            v-if="!isMine || recipe.savesCount > 0"
            :count="recipe.savesCount"
            :saved="recipe.alreadySaved"
            :readonly="isMine"
            :loading="isCloning || isUncloning"
            @toggle="onToggleSave"
          />
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

          <div class="recipe-detail__chart">
            <div class="recipe-detail__donut">
              <svg
                :viewBox="`0 0 ${RING_SIZE} ${RING_SIZE}`"
                class="recipe-detail__donut-svg"
                aria-hidden="true"
              >
                <circle
                  class="recipe-detail__donut-track"
                  :cx="RING_CENTER"
                  :cy="RING_CENTER"
                  :r="RING_RADIUS"
                  :stroke-width="RING_WIDTH"
                />
                <circle
                  v-for="seg in donutSegments"
                  :key="seg.key"
                  class="recipe-detail__donut-seg"
                  :class="`recipe-detail__donut-seg--${seg.key}`"
                  :cx="RING_CENTER"
                  :cy="RING_CENTER"
                  :r="RING_RADIUS"
                  :stroke-width="RING_WIDTH"
                  :stroke-dasharray="`${seg.len} ${RING_CIRCUMFERENCE}`"
                  :transform="`rotate(${seg.rotate} ${RING_CENTER} ${RING_CENTER})`"
                />
                <text
                  v-for="seg in donutSegments"
                  v-show="seg.showLabel"
                  :key="`label-${seg.key}`"
                  class="recipe-detail__donut-label"
                  :x="seg.labelX"
                  :y="seg.labelY"
                  text-anchor="middle"
                  dominant-baseline="central"
                >{{ seg.percent }}%</text>
              </svg>
              <div class="recipe-detail__donut-center">
                <template v-if="dominantMacro">
                  <span
                    class="recipe-detail__donut-pct"
                    :class="`recipe-detail__donut-pct--${dominantMacro.key}`"
                  >{{ Math.round(dominantMacro.percent) }}%</span>
                  <span class="recipe-detail__donut-cap">{{ dominantMacro.label }}</span>
                </template>
                <span
                  v-else
                  class="recipe-detail__donut-cap"
                >—</span>
              </div>
            </div>

            <ul class="recipe-detail__legend">
              <li
                v-for="macro in macroStats"
                :key="macro.key"
                class="recipe-detail__legend-item"
                :class="{ 'recipe-detail__legend-item--dominant': macro.dominant }"
              >
                <span
                  class="recipe-detail__dot"
                  :class="`recipe-detail__dot--${macro.key}`"
                />
                <span class="recipe-detail__legend-label">{{ macro.label }}</span>
                <b class="recipe-detail__legend-pct">{{ Math.round(macro.percent) }}%</b>
                <small class="recipe-detail__legend-grams">{{ formatMacro(macro.grams) }}</small>
              </li>
            </ul>
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
const { remove, setVisibility, clone, unclone } = useRecipes()
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

// Save = bookmark this shared recipe into my collection, staying on the page so
// the feedback (filled pill + count +1) is visible. Optimistic, revert on error.
const isCloning = ref(false)
const onClone = async () => {
  const current = recipe.value
  if (!current || isCloning.value) return
  isCloning.value = true
  current.alreadySaved = true
  current.savesCount += 1
  try {
    await clone(current.id)
    toast.success('Recette ajoutée à tes recettes.')
  }
  catch {
    current.alreadySaved = false
    current.savesCount = Math.max(0, current.savesCount - 1)
    toast.error('Impossible d\'enregistrer cette recette.')
  }
  finally {
    isCloning.value = false
  }
}

// Remove the saved copy of this shared recipe (inverse of onClone). Optimistic
// count −1, revert on error.
const isUncloning = ref(false)
const onUnclone = async () => {
  const current = recipe.value
  if (!current || isUncloning.value) return
  isUncloning.value = true
  current.alreadySaved = false
  current.savesCount = Math.max(0, current.savesCount - 1)
  try {
    await unclone(current.id)
    toast.success('Recette retirée de tes recettes.')
  }
  catch {
    current.alreadySaved = true
    current.savesCount += 1
    toast.error('Impossible de retirer cette recette.')
  }
  finally {
    isUncloning.value = false
  }
}

const onToggleSave = () => {
  if (recipe.value?.alreadySaved) onUnclone()
  else onClone()
}

useHead(() => ({ title: recipe.value?.name ?? 'Recette' }))

const EMPTY_NUTRITION = { calories: 0, proteinG: 0, carbG: 0, fatG: 0, costCents: 0 }

// Nutrition shown in the headline card, scaled to the selected portions.
// `scaledTotal` is perServing × portions (the nutrition for `portions` servings);
// at 1 portion it equals the canonical per-serving values.
const shownNutrition = computed(() => scaledTotal.value ?? recipe.value?.perServing ?? EMPTY_NUTRITION)

const nutritionLabel = computed(() =>
  isScaled.value ? `pour ${portions.value} portions` : 'par portion')

// Calorie contribution split (protein/carb 4 kcal/g, fat 9), driving both the
// bar widths and the per-macro % shown in the stats. `dominant` flags the macro
// with the biggest share so the UI can highlight it at a glance.
const macroStats = computed(() => {
  const n = shownNutrition.value
  const kcal = { protein: n.proteinG * 4, carb: n.carbG * 4, fat: n.fatG * 9 }
  const sum = kcal.protein + kcal.carb + kcal.fat
  const items = [
    { key: 'protein', label: 'Protéines', grams: n.proteinG, percent: sum ? (kcal.protein / sum) * 100 : 0 },
    { key: 'carb', label: 'Glucides', grams: n.carbG, percent: sum ? (kcal.carb / sum) * 100 : 0 },
    { key: 'fat', label: 'Lipides', grams: n.fatG, percent: sum ? (kcal.fat / sum) * 100 : 0 },
  ]
  const max = Math.max(...items.map(item => item.percent))
  return items.map(item => ({ ...item, dominant: sum > 0 && item.percent === max }))
})

const dominantMacro = computed(() => macroStats.value.find(macro => macro.dominant) ?? null)

// Segmented donut geometry (one coloured arc per macro). Each arc is a circle
// whose visible dash length encodes its calorie share, rotated to start where the
// previous one ended; a small angular gap keeps the segments visually separated.
const RING_SIZE = 108
const RING_WIDTH = 12
const RING_CENTER = RING_SIZE / 2
const RING_RADIUS = RING_CENTER - RING_WIDTH / 2 - 2
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS
const RING_GAP_DEG = 4

const donutSegments = computed(() => {
  const visible = macroStats.value.filter(macro => macro.percent > 0)
  const gapLen = (RING_GAP_DEG / 360) * RING_CIRCUMFERENCE
  let start = 0
  return visible.map((macro) => {
    const fraction = macro.percent / 100
    // Mid-arc angle (-90° = 12 o'clock), used to drop the % label on the segment.
    const midAngle = (((start + fraction / 2) * 360) - 90) * (Math.PI / 180)
    const segment = {
      key: macro.key,
      percent: Math.round(macro.percent),
      rotate: start * 360 - 90 + RING_GAP_DEG / 2,
      len: Math.max(0, fraction * RING_CIRCUMFERENCE - gapLen),
      labelX: RING_CENTER + RING_RADIUS * Math.cos(midAngle),
      labelY: RING_CENTER + RING_RADIUS * Math.sin(midAngle),
      // Hide the label on slivers too thin to hold the text legibly.
      showLabel: macro.percent >= 10,
    }
    start += fraction
    return segment
  })
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
    align-items: center;
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

  &__chart {
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }

  &__donut {
    position: relative;
    flex: 0 0 auto;
    width: 108px;
    height: 108px;
  }

  &__donut-svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  &__donut-track {
    fill: none;
    stroke: rgba(var(--v-border-color), 0.14);
  }

  &__donut-seg {
    fill: none;
    stroke-linecap: butt;
    transition:
      stroke-dasharray 0.9s var(--app-ease),
      transform 0.9s var(--app-ease);

    &--protein { stroke: rgb(var(--v-theme-protein)); }
    &--carb { stroke: rgb(var(--v-theme-carb)); }
    &--fat { stroke: rgb(var(--v-theme-fat)); }
  }

  &__donut-center {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  &__donut-pct {
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1;
    font-variant-numeric: tabular-nums;

    &--protein { color: rgb(var(--v-theme-protein)); }
    &--carb { color: rgb(var(--v-theme-carb)); }
    &--fat { color: rgb(var(--v-theme-fat)); }
  }

  &__donut-cap {
    font-size: 0.7rem;
    font-weight: 600;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-top: 0.15rem;
  }

  &__legend {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__legend-item {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    align-items: baseline;
    gap: 0.5rem;
    padding: 0.35rem 0.6rem;
    border-radius: 10px;
    border: 1px solid transparent;
    font-variant-numeric: tabular-nums;
    transition: background 0.25s var(--app-ease);

    // The dominant macro gets a faint surface so the eye lands on it first.
    &--dominant {
      background: rgb(var(--v-theme-surface-variant));
      border-color: rgba(var(--v-border-color), var(--v-border-opacity));
    }
  }

  &__legend-label {
    font-size: 0.85rem;
    font-weight: 600;
  }

  &__legend-pct {
    font-size: 0.95rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  &__legend-grams {
    font-size: 0.78rem;
    color: rgb(var(--v-theme-on-surface-variant));
    min-width: 3.5ch;
    text-align: right;
  }

  &__dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    flex-shrink: 0;
    align-self: center;

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

@media (prefers-reduced-motion: reduce) {
  .recipe-detail__donut-seg {
    transition: none;
  }
}
</style>
