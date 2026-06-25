<template>
  <li
    class="meal-item"
    :class="{ 'meal-item--removing': removing }"
    @transitionend="onRemoveEnd"
  >
    <div class="meal-item__clip">
      <!-- Red trash zone revealed as the row slides left. -->
      <div
        class="meal-item__delete"
        aria-hidden="true"
        :style="{ opacity: 0.35 + progress * 0.65 }"
      >
        <v-icon
          icon="mdi-trash-can"
          size="22"
          :style="{ transform: `scale(${0.7 + progress * 0.5})` }"
        />
      </div>

      <button
        type="button"
        class="meal-item__btn"
        :class="{ 'meal-item__btn--dragging': dragging }"
        :style="removing ? undefined : { transform: `translateX(${offset}px)` }"
        data-swipe-nav-ignore
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerCancel"
        @click="onClick"
      >
        <v-avatar
          class="meal-item__thumb"
          size="36"
          rounded="lg"
        >
          <v-img
            v-if="item.recipe && item.recipe.img"
            :src="item.recipe.img"
            cover
            :alt="item.recipe.name ?? ''"
          />
          <v-icon
            v-else
            :icon="item.kind === 'INGREDIENT' ? 'mdi-food-apple-outline' : icon"
            size="18"
            color="on-surface-variant"
          />
        </v-avatar>

        <div class="meal-item__main">
          <span class="meal-item__name">{{ mealItemName(item) }}</span>
          <span
            v-if="courseName || detail || !isRecipeItem(item)"
            class="meal-item__meta"
          >
            <span
              v-if="courseName"
              class="meal-item__course"
            >{{ courseName }}</span>
            <span
              v-else-if="!isRecipeItem(item)"
              class="meal-item__course"
            >Hors plan</span>
            <span
              v-if="detail"
              class="meal-item__kcal"
            >{{ detail }}</span>
          </span>
        </div>

        <v-icon
          icon="mdi-chevron-right"
          size="18"
          class="meal-item__chevron"
        />
      </button>
    </div>
  </li>
</template>

<script setup lang="ts">
import type { MealItem } from '../types/planning'
import { useSwipeToDelete } from '../composables/useSwipeToDelete'
import { isRecipeItem, mealItemDetail, mealItemName } from '../utils/mealItemMeta'

const props = defineProps<{
  item: MealItem
  icon: string
  courseName: string
}>()
const emit = defineEmits<{
  open: []
  remove: []
}>()

const detail = computed(() => mealItemDetail(props.item))

const {
  offset,
  dragging,
  removing,
  moved,
  progress,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onRemoveEnd,
} = useSwipeToDelete({ onDelete: () => emit('remove') })

// Suppress the click that trails a swipe so it doesn't open the row sheet.
const onClick = () => {
  if (moved.value) return
  emit('open')
}
</script>

<style scoped lang="scss">
.meal-item {
  display: grid;
  grid-template-rows: 1fr;
  opacity: 1;
  transition:
    grid-template-rows 0.26s var(--app-ease, ease),
    opacity 0.26s var(--app-ease, ease);

  &--removing {
    grid-template-rows: 0fr;
    opacity: 0;
  }

  &__clip {
    position: relative;
    min-height: 0;
    overflow: hidden;
    border-radius: 12px;
  }

  &__delete {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 1.4rem;
    background: rgb(var(--v-theme-error));
    color: rgb(var(--v-theme-on-error, 255, 255, 255));
  }

  &__btn {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    width: 100%;
    padding: 0.5rem 0.55rem;
    text-align: left;
    cursor: pointer;
    border-radius: 12px;
    background: rgb(var(--v-theme-surface-variant));
    border: 1px solid rgba(var(--v-border-color), calc(var(--v-border-opacity) * 0.6));
    touch-action: pan-y;
    transition: transform 0.28s var(--app-ease, ease), border-color 0.15s var(--app-ease, ease);

    &--dragging {
      transition: border-color 0.15s var(--app-ease, ease);
    }

    &:hover {
      border-color: rgba(var(--v-border-color), var(--v-border-opacity));
    }
  }

  &__chevron {
    flex: 0 0 auto;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__thumb {
    flex: 0 0 auto;
    border: 1px solid rgba(var(--v-border-color), calc(var(--v-border-opacity) * 0.8));
  }

  &__main {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-width: 0;
    gap: 0.1rem;
  }

  &__name {
    font-size: 0.9rem;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.74rem;
    color: rgb(var(--v-theme-on-surface-variant));
    font-variant-numeric: tabular-nums;
  }

  &__course {
    text-transform: uppercase;
    letter-spacing: 0.03em;
    font-weight: 600;
    color: rgb(var(--v-theme-primary));
  }
}

@media (prefers-reduced-motion: reduce) {
  .meal-item,
  .meal-item__btn {
    transition: none;
  }
}
</style>
