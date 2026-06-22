<template>
  <v-card
    class="recipe-card"
    elevation="0"
    @click="emit('open', recipe)"
  >
    <div class="recipe-card__media">
      <v-img
        v-if="recipe.img"
        :src="recipe.img"
        :alt="recipe.name"
        class="recipe-card__img"
        cover
        height="100%"
        :lazy-src="placeholderSrc"
        loading="lazy"
      >
        <template #placeholder>
          <div class="recipe-card__img-loading">
            <v-progress-circular
              indeterminate
              size="22"
              width="2"
              color="primary"
            />
          </div>
        </template>
      </v-img>
      <div
        v-else
        class="recipe-card__img recipe-card__img--empty"
      >
        <v-icon
          icon="mdi-silverware-fork-knife"
          size="30"
        />
      </div>

      <div class="recipe-card__scrim" />

      <v-btn
        icon
        variant="flat"
        size="small"
        density="comfortable"
        aria-label="Actions"
        class="recipe-card__actions"
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

      <div class="recipe-card__overlay">
        <span class="recipe-card__name">{{ recipe.name }}</span>
        <span class="recipe-card__meta">
          {{ recipe.servings }} portion{{ recipe.servings > 1 ? 's' : '' }} · {{ totalTime }} · {{ ingredientCount }}
        </span>
      </div>
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
      v-if="recipe.mealTypes.length || recipe.dietaryRegimes.length"
      class="recipe-card__tags"
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
  </v-card>
</template>

<script setup lang="ts">
import type { Recipe } from '../types/recipe'

const props = defineProps<{ recipe: Recipe }>()
const emit = defineEmits<{ open: [Recipe], edit: [Recipe], delete: [Recipe] }>()

// Tiny inline blur placeholder shown while the real image lazy-loads.
const placeholderSrc = 'data:image/svg+xml;utf8,'
  + '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="9"><rect width="16" height="9" fill="%2310B981" opacity="0.12"/></svg>'

const totalTime = computed(() => formatTotalTime(props.recipe.prepTimeMin, props.recipe.cookTimeMin))
const ingredientCount = computed(() => {
  const count = props.recipe.recipeIngredients.length
  return `${count} ingrédient${count > 1 ? 's' : ''}`
})
</script>

<style scoped lang="scss">
.recipe-card {
  overflow: hidden;
  // Bottom padding lives on the card (not a `:last-child` child) so it survives
  // Vuetify appending its overlay node last — otherwise the bottom row's chips
  // fall flush against the rounded corner and get clipped.
  padding-bottom: 1.15rem;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  cursor: pointer;
  transition: border-color 0.18s var(--app-ease), transform 0.18s var(--app-ease);

  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.4);
    transform: translateY(-2px);
  }

  &:hover .recipe-card__img {
    transform: scale(1.04);
  }

  &__media {
    position: relative;
    isolation: isolate;
    height: clamp(150px, 30vw, 190px);
  }

  &__img {
    width: 100%;
    height: 100%;
    transition: transform 0.5s var(--app-ease);
  }

  &__img--empty {
    height: 100%;
    display: grid;
    place-items: center;
    color: rgba(var(--v-theme-primary), 0.55);
    background: linear-gradient(
      135deg,
      rgba(var(--v-theme-primary), 0.16),
      rgba(var(--v-theme-primary), 0.04)
    );
  }

  &__img-loading {
    height: 100%;
    display: grid;
    place-items: center;
  }

  &__scrim {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.62) 0%,
      rgba(0, 0, 0, 0.18) 38%,
      rgba(0, 0, 0, 0) 62%
    );
    pointer-events: none;
  }

  &__actions {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    color: #fff;
    background: rgba(0, 0, 0, 0.32);
    backdrop-filter: blur(6px);
  }

  &__overlay {
    position: absolute;
    left: 1.1rem;
    right: 1.1rem;
    bottom: 0.7rem;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__name {
    font-weight: 700;
    font-size: 1.05rem;
    letter-spacing: -0.01em;
    color: #fff;
    text-shadow: 0 1px 8px rgba(0, 0, 0, 0.4);
  }

  &__meta {
    font-size: 0.78rem;
    margin-top: 0.1rem;
    color: rgba(255, 255, 255, 0.82);
    text-shadow: 0 1px 6px rgba(0, 0, 0, 0.4);
  }

  &__stats {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    padding: 0.85rem 1.1rem 0;
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
    padding: 0.75rem 1.1rem 0;
  }

  &__media + &__stats {
    padding-top: 0.85rem;
  }
}
</style>
