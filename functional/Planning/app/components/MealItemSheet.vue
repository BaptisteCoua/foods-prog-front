<template>
  <v-bottom-sheet
    :model-value="modelValue"
    max-width="640"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card
      v-if="item"
      class="meal-sheet"
    >
      <div class="meal-sheet__hero">
        <v-img
          v-if="item.recipe.img"
          :src="item.recipe.img"
          :alt="item.recipe.name"
          :aspect-ratio="16 / 9"
          cover
          class="meal-sheet__img"
        />
        <div
          v-else
          class="meal-sheet__img meal-sheet__img--placeholder"
        >
          <v-icon
            icon="mdi-silverware-fork-knife"
            size="40"
            color="on-surface-variant"
          />
        </div>
        <v-btn
          icon="mdi-close"
          variant="flat"
          size="small"
          class="meal-sheet__close"
          aria-label="Fermer"
          @click="emit('update:modelValue', false)"
        />
      </div>

      <div class="meal-sheet__body">
        <div class="meal-sheet__head">
          <h2 class="meal-sheet__title">
            {{ item.recipe.name }}
          </h2>
          <v-chip
            v-if="courseName"
            size="x-small"
            variant="tonal"
            color="primary"
          >
            {{ courseName }}
          </v-chip>
        </div>

        <p
          v-if="item.recipe.description"
          class="meal-sheet__desc"
        >
          {{ item.recipe.description }}
        </p>

        <div class="meal-sheet__macros">
          <div class="meal-sheet__macro">
            <span class="meal-sheet__macro-value">{{ formatKcal(totals.calories) }}</span>
            <span class="meal-sheet__macro-label">Total</span>
          </div>
          <div class="meal-sheet__macro meal-sheet__macro--protein">
            <span class="meal-sheet__macro-value">{{ formatMacro(totals.proteinG) }}</span>
            <span class="meal-sheet__macro-label">Protéines</span>
          </div>
          <div class="meal-sheet__macro meal-sheet__macro--carb">
            <span class="meal-sheet__macro-value">{{ formatMacro(totals.carbG) }}</span>
            <span class="meal-sheet__macro-label">Glucides</span>
          </div>
          <div class="meal-sheet__macro meal-sheet__macro--fat">
            <span class="meal-sheet__macro-value">{{ formatMacro(totals.fatG) }}</span>
            <span class="meal-sheet__macro-label">Lipides</span>
          </div>
        </div>

        <div class="meal-sheet__cost">
          <span class="meal-sheet__cost-label">
            {{ formatPortionValue(item.portions) }} portion{{ item.portions > 1 ? 's' : '' }}
          </span>
          <span class="meal-sheet__cost-value">{{ formatCost(totals.costCents) }}</span>
        </div>

        <div class="meal-sheet__stepper">
          <span class="meal-sheet__stepper-label">Portions</span>
          <div class="meal-sheet__stepper-controls">
            <v-btn
              icon="mdi-minus"
              variant="tonal"
              size="small"
              :disabled="item.portions <= 0.5"
              aria-label="Moins de portions"
              @click="step(-0.5)"
            />
            <span class="meal-sheet__stepper-value">{{ formatPortionValue(item.portions) }}</span>
            <v-btn
              icon="mdi-plus"
              variant="tonal"
              size="small"
              aria-label="Plus de portions"
              @click="step(0.5)"
            />
          </div>
        </div>

        <div class="meal-sheet__actions">
          <v-btn
            variant="text"
            prepend-icon="mdi-book-open-variant"
            :to="`/recipes/${item.recipe.id}`"
          >
            Voir la recette
          </v-btn>
          <v-btn
            variant="text"
            color="error"
            prepend-icon="mdi-delete-outline"
            @click="emit('remove', item.id)"
          >
            Retirer
          </v-btn>
        </div>
      </div>
    </v-card>
  </v-bottom-sheet>
</template>

<script setup lang="ts">
import type { MealItem } from '../types/planning'

const props = defineProps<{
  modelValue: boolean
  item: MealItem | null
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
  'setPortions': [number, number]
  'remove': [number]
}>()

const courseName = computed(() => props.item?.recipe.mealTypes?.[0]?.name ?? '')

// Nutrition for the served portions — computed API-side, never recomputed here.
const totals = computed(() => props.item?.total ?? {
  calories: 0,
  proteinG: 0,
  carbG: 0,
  fatG: 0,
  costCents: 0,
})

const formatPortionValue = (portions: number) =>
  Number.isInteger(portions) ? String(portions) : portions.toFixed(1)

const step = (delta: number) => {
  if (!props.item) return
  const next = Math.round((props.item.portions + delta) * 2) / 2
  if (next >= 0.5) emit('setPortions', props.item.id, next)
}
</script>

<style scoped lang="scss">
.meal-sheet {
  overflow: hidden;

  &__hero {
    position: relative;
  }

  &__img {
    width: 100%;

    &--placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      aspect-ratio: 16 / 9;
      background: rgba(var(--v-border-color), var(--v-border-opacity));
    }
  }

  &__close {
    position: absolute;
    top: 0.6rem;
    right: 0.6rem;
    background: rgba(var(--v-theme-surface), 0.9);
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.1rem 1.1rem 1.4rem;
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  &__desc {
    font-size: 0.88rem;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-top: -0.5rem;
  }

  &__macros {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }

  &__macro {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
    padding: 0.6rem 0.3rem;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    border-radius: 14px;
  }

  &__macro-value {
    font-weight: 700;
    font-size: 0.95rem;
    font-variant-numeric: tabular-nums;
  }

  &__macro-label {
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__macro--protein .meal-sheet__macro-value { color: rgb(var(--v-theme-protein)); }
  &__macro--carb .meal-sheet__macro-value { color: rgb(var(--v-theme-carb)); }
  &__macro--fat .meal-sheet__macro-value { color: rgb(var(--v-theme-fat)); }

  &__cost {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__cost-value {
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: rgb(var(--v-theme-on-surface));
  }

  &__stepper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.6rem 0.9rem;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    border-radius: 14px;
  }

  &__stepper-label {
    font-weight: 600;
    font-size: 0.92rem;
  }

  &__stepper-controls {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }

  &__stepper-value {
    min-width: 2rem;
    text-align: center;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
}
</style>
