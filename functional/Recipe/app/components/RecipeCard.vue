<template>
  <v-card
    class="recipe-card"
    elevation="0"
    @click="emit('open', recipe)"
  >
    <div class="recipe-card__head">
      <div class="recipe-card__title">
        <span class="recipe-card__name">{{ recipe.name }}</span>
        <span class="recipe-card__meta">
          {{ recipe.servings }} portion{{ recipe.servings > 1 ? 's' : '' }} · {{ totalTime }} · {{ ingredientCount }}
        </span>
      </div>
      <v-btn
        icon
        variant="text"
        size="small"
        density="comfortable"
        aria-label="Actions"
        @click.stop
      >
        <v-icon icon="mdi-dots-vertical" />
        <v-menu
          activator="parent"
          location="bottom end"
        >
          <v-list density="compact">
            <v-list-item
              prepend-icon="mdi-pencil"
              title="Modifier"
              @click="emit('edit', recipe)"
            />
            <v-list-item
              prepend-icon="mdi-delete"
              title="Supprimer"
              base-color="error"
              @click="emit('delete', recipe)"
            />
          </v-list>
        </v-menu>
      </v-btn>
    </div>

    <div class="recipe-card__stats">
      <div class="recipe-card__kcal">
        <span class="recipe-card__kcal-value">{{ formatKcal(recipe.perServing.calories) }}</span>
        <span class="recipe-card__kcal-label">par portion</span>
      </div>
      <div class="recipe-card__macros">
        <span class="recipe-card__macro recipe-card__macro--protein">
          <b>{{ formatMacro(recipe.perServing.proteinG) }}</b> P
        </span>
        <span class="recipe-card__macro recipe-card__macro--carb">
          <b>{{ formatMacro(recipe.perServing.carbG) }}</b> G
        </span>
        <span class="recipe-card__macro recipe-card__macro--fat">
          <b>{{ formatMacro(recipe.perServing.fatG) }}</b> L
        </span>
      </div>
      <span class="recipe-card__cost">{{ formatCost(recipe.perServing.costCents) }}<small>/portion</small></span>
    </div>

    <div
      v-if="recipe.mealTypes.length"
      class="recipe-card__tags"
    >
      <v-chip
        v-for="type in recipe.mealTypes"
        :key="type.id"
        size="x-small"
        variant="tonal"
      >
        {{ type.name }}
      </v-chip>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import type { Recipe } from '../types/recipe'

const props = defineProps<{ recipe: Recipe }>()
const emit = defineEmits<{ open: [Recipe], edit: [Recipe], delete: [Recipe] }>()

const totalTime = computed(() => formatTotalTime(props.recipe.prepTimeMin, props.recipe.cookTimeMin))
const ingredientCount = computed(() => {
  const count = props.recipe.recipeIngredients.length
  return `${count} ingrédient${count > 1 ? 's' : ''}`
})
</script>

<style scoped lang="scss">
.recipe-card {
  padding: 1rem 1.1rem;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  cursor: pointer;
  transition: border-color 0.18s var(--app-ease);

  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.4);
  }

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
  }

  &__title {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__name {
    font-weight: 700;
    font-size: 1rem;
    letter-spacing: -0.01em;
  }

  &__meta {
    font-size: 0.8rem;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-top: 0.1rem;
  }

  &__stats {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    margin-top: 0.85rem;
    flex-wrap: wrap;
  }

  &__kcal {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }

  &__kcal-value {
    font-weight: 800;
    font-size: 1.15rem;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }

  &__kcal-label {
    font-size: 0.7rem;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__macros {
    display: flex;
    align-items: baseline;
    gap: 0.7rem;
    font-size: 0.8rem;
    color: rgb(var(--v-theme-on-surface-variant));
    font-variant-numeric: tabular-nums;

    b {
      color: rgb(var(--v-theme-on-surface));
      font-weight: 700;
    }
  }

  &__macro--protein b { color: rgb(var(--v-theme-protein)); }
  &__macro--carb b { color: rgb(var(--v-theme-carb)); }
  &__macro--fat b { color: rgb(var(--v-theme-fat)); }

  &__cost {
    margin-left: auto;
    font-weight: 700;
    font-size: 0.9rem;
    font-variant-numeric: tabular-nums;

    small {
      font-weight: 400;
      color: rgb(var(--v-theme-on-surface-variant));
      font-size: 0.7rem;
    }
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: 0.75rem;
  }
}
</style>
