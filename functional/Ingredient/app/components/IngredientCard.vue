<template>
  <v-card
    class="ingredient-card"
    elevation="0"
    @click="emit('edit', ingredient)"
  >
    <div class="ingredient-card__head">
      <div class="ingredient-card__title">
        <span class="ingredient-card__name">{{ ingredient.name }}</span>
        <span class="ingredient-card__meta">{{ caloriesLabel }} · {{ priceLabel }}</span>
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
              @click="emit('edit', ingredient)"
            />
            <v-list-item
              prepend-icon="mdi-delete"
              title="Supprimer"
              base-color="error"
              @click="emit('delete', ingredient)"
            />
          </v-list>
        </v-menu>
      </v-btn>
    </div>

    <div class="ingredient-card__macros">
      <span class="ingredient-card__macro"><b>{{ ingredient.proteinG }}</b> P</span>
      <span class="ingredient-card__macro"><b>{{ ingredient.carbG }}</b> G</span>
      <span class="ingredient-card__macro"><b>{{ ingredient.fatG }}</b> L</span>
      <span class="ingredient-card__base">pour {{ baseQuantityLabel(ingredient.unitType) }}</span>
    </div>

    <div
      v-if="ingredient.foodTypes.length"
      class="ingredient-card__tags"
    >
      <v-chip
        v-for="type in ingredient.foodTypes"
        :key="type.id"
        size="x-small"
        variant="tonal"
      >
        {{ type.types }}
      </v-chip>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import type { Ingredient } from '../types/ingredient'

const props = defineProps<{ ingredient: Ingredient }>()
const emit = defineEmits<{ edit: [Ingredient], delete: [Ingredient] }>()

const caloriesLabel = computed(() => `${props.ingredient.calories} kcal`)
const priceLabel = computed(() => formatPrice(props.ingredient.pricePerKgCents, props.ingredient.unitType))
</script>

<style scoped lang="scss">
.ingredient-card {
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

  &__macros {
    display: flex;
    align-items: baseline;
    gap: 0.9rem;
    margin-top: 0.75rem;
    font-size: 0.82rem;
    color: rgb(var(--v-theme-on-surface-variant));
    font-variant-numeric: tabular-nums;

    b {
      color: rgb(var(--v-theme-on-surface));
      font-weight: 700;
    }
  }

  &__base {
    margin-left: auto;
    font-size: 0.72rem;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: 0.75rem;
  }
}
</style>
