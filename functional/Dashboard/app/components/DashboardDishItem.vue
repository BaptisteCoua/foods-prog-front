<template>
  <button
    type="button"
    class="dish"
    :class="{ 'dish--eaten': dish.eaten }"
    :aria-pressed="dish.eaten"
    :aria-label="`${dish.name} — marquer comme mangé`"
    @click="emit('toggle', dish.id, !dish.eaten)"
  >
    <CheckToggle
      :model-value="dish.eaten"
      :interactive="false"
      class="dish__check"
    />
    <span class="dish__main">
      <span class="dish__name">{{ dish.name }}</span>
      <span class="dish__sub">{{ dish.slotLabel }}</span>
    </span>
    <span class="dish__kcal">{{ dish.kcal }} kcal</span>
  </button>
</template>

<script setup lang="ts">
import type { DayDish } from '../composables/useDailySummary'

defineProps<{ dish: DayDish }>()
const emit = defineEmits<{ toggle: [number, boolean] }>()
</script>

<style scoped lang="scss">
.dish {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  width: 100%;
  padding: 0.55rem 0.6rem;
  border-radius: 14px;
  border: 1px solid transparent;
  background: transparent;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background 0.3s var(--app-ease, ease),
    border-color 0.3s var(--app-ease, ease),
    transform 0.12s var(--app-ease, ease);

  & + & {
    margin-top: 0.2rem;
  }

  &:hover:not(.dish--eaten) {
    background: rgba(var(--v-theme-on-surface), 0.04);
  }

  &:active {
    transform: scale(0.99);
  }

  &:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
  }

  &--eaten {
    background: rgba(var(--v-theme-primary), 0.07);
    border-color: rgba(var(--v-theme-primary), 0.18);
  }

  &--eaten:hover {
    background: rgba(var(--v-theme-primary), 0.1);
  }

  &__check {
    flex: 0 0 auto;
  }

  &__main {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__name {
    font-weight: 600;
    font-size: 0.92rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__sub {
    font-size: 0.76rem;
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

  &--eaten &__name {
    color: rgb(var(--v-theme-on-surface-variant));
    text-decoration: line-through;
    text-decoration-color: rgba(var(--v-theme-on-surface-variant), 0.45);
  }

  &--eaten &__kcal {
    color: rgb(var(--v-theme-primary));
  }
}

@media (prefers-reduced-motion: reduce) {
  .dish {
    transition: none;
  }
}
</style>
