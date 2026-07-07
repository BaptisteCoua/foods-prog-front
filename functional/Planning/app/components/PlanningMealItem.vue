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

      <div
        class="meal-item__row"
        :class="{ 'meal-item__row--dragging': dragging }"
        :style="removing ? undefined : { transform: `translateX(${offset}px)` }"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerCancel"
      >
        <component
          :is="openable ? 'button' : 'div'"
          :type="openable ? 'button' : undefined"
          class="meal-item__btn"
          :class="{ 'meal-item__btn--static': !openable }"
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
            v-if="openable"
            icon="mdi-chevron-right"
            size="18"
            class="meal-item__chevron"
          />
        </component>

        <button
          type="button"
          class="meal-item__remove"
          :aria-label="`Retirer ${mealItemName(item)}`"
          @click="emit('remove')"
        >
          <v-icon
            icon="mdi-close"
            size="16"
          />
        </button>
      </div>
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
// Only recipe lines have a detail sheet to open; ingredient / free lines are
// static (their sole action is the always-visible Remove button), so they render
// as a plain div rather than a button that does nothing.
const openable = computed(() => isRecipeItem(props.item))

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

// Open the detail sheet on a genuine tap of an openable row. A swipe sets `moved`,
// whose trailing click we ignore so the gesture doesn't also open the sheet.
const onClick = () => {
  if (moved.value || !openable.value) return
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

  &__row {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
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

  &__btn {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex: 1 1 auto;
    min-width: 0;
    padding: 0.5rem 0.55rem;
    text-align: left;
    background: transparent;
    border: none;
    color: inherit;
    font: inherit;
    cursor: pointer;

    &--static {
      cursor: default;
    }

    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: -2px;
      border-radius: 12px;
    }
  }

  &__remove {
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    margin-right: 0.15rem;
    border: none;
    background: transparent;
    color: rgb(var(--v-theme-on-surface-variant));
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.2s var(--app-ease, ease), color 0.2s var(--app-ease, ease);

    &:hover {
      background: rgba(var(--v-theme-error), 0.12);
      color: rgb(var(--v-theme-error));
    }

    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-error));
      outline-offset: 2px;
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
  .meal-item__row {
    transition: none;
  }
}
</style>
