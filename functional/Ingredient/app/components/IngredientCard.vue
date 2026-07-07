<template>
  <v-card
    class="ingredient-card"
    :class="{ 'ingredient-card--compact': !detailed }"
    elevation="0"
    role="button"
    tabindex="0"
    :aria-label="`Modifier ${ingredient.name}`"
    @click="emit('edit', ingredient)"
    @keydown.enter.self="emit('edit', ingredient)"
    @keydown.space.self.prevent="emit('edit', ingredient)"
  >
    <div class="ingredient-card__head">
      <div class="ingredient-card__thumb">
        <v-img
          v-if="photoUrl"
          :src="photoUrl"
          :alt="ingredient.name"
          :width="24"
          :height="24"
          contain
          class="ingredient-card__img"
        />
        <span
          v-else
          class="ingredient-card__emoji"
          aria-hidden="true"
        >{{ emoji }}</span>
      </div>
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

    <template v-if="detailed">
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
    </template>
  </v-card>
</template>

<script setup lang="ts">
import type { Ingredient } from '../types/ingredient'

const props = withDefaults(
  defineProps<{ ingredient: Ingredient, detailed?: boolean }>(),
  { detailed: true },
)
const emit = defineEmits<{ edit: [Ingredient], delete: [Ingredient] }>()

const caloriesLabel = computed(() => `${props.ingredient.calories} kcal`)
const priceLabel = computed(() => formatPrice(props.ingredient.pricePerKgCents, props.ingredient.unitType))
const photoUrl = computed(() => props.ingredient.imageUrl ?? '')
const emoji = computed(() => ingredientEmoji(props.ingredient.foodTypes))
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

  &:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
  }

  &--compact {
    padding: 0.6rem 1.1rem;
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 0.7rem;
  }

  &__thumb {
    flex: 0 0 auto;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(var(--v-theme-on-surface), 0.05);
  }

  // Fixed icon box (smaller than the thumb) → guaranteed margin, centered,
  // and every icon reads at the same size regardless of its own SVG padding.
  &__img {
    flex: 0 0 auto;
    width: 24px;
    height: 24px;
  }

  &__emoji {
    font-size: 1.35rem;
    line-height: 1;
  }

  &__title {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1 1 auto;
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
