<template>
  <div class="meal-item">
    <span
      class="meal-item__thumb"
      :style="{ background: `linear-gradient(135deg, ${meal.from}, ${meal.to})` }"
    />
    <span class="meal-item__main">
      <span class="meal-item__title">{{ meal.title }}</span>
      <span class="meal-item__sub">{{ meal.slotLabel }} · {{ meal.portions }} portion{{ meal.portions > 1 ? 's' : '' }}</span>
    </span>
    <span class="meal-item__kcal">{{ meal.kcal }} kcal</span>
  </div>
</template>

<script setup lang="ts">
import type { PlannedMeal } from '../composables/useDailySummary'

defineProps<{ meal: PlannedMeal }>()
</script>

<style scoped lang="scss">
.meal-item {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.7rem;
  border-radius: 16px;
  background: rgb(var(--v-theme-surface-variant));
  transition: transform 0.18s var(--app-ease);

  & + & {
    margin-top: 0.6rem;
  }

  &:active {
    transform: scale(0.98);
  }

  &__thumb {
    width: 46px;
    height: 46px;
    border-radius: 12px;
    flex: none;
  }

  &__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__title {
    font-weight: 700;
    font-size: 0.92rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__sub {
    font-size: 0.78rem;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-top: 0.1rem;
  }

  &__kcal {
    font-size: 0.82rem;
    font-weight: 700;
    color: rgb(var(--v-theme-on-surface-variant));
    font-variant-numeric: tabular-nums;
    flex: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .meal-item {
    transition: none;
  }
}
</style>
