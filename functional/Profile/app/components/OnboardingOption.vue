<template>
  <button
    type="button"
    class="onboarding-option"
    :class="{ 'onboarding-option--selected': selected }"
  >
    <v-icon
      v-if="icon"
      :icon="icon"
      size="22"
      class="onboarding-option__icon"
    />
    <span class="onboarding-option__body">
      <span class="onboarding-option__label">{{ label }}</span>
      <span
        v-if="description"
        class="onboarding-option__desc"
      >{{ description }}</span>
    </span>
    <v-icon
      v-if="selected"
      icon="mdi-check-circle"
      size="20"
      class="onboarding-option__check"
    />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  description?: string
  icon?: string
  selected: boolean
}>()
</script>

<style scoped lang="scss">
.onboarding-option {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  width: 100%;
  text-align: left;
  padding: 1rem 1.1rem;
  border-radius: 16px;
  border: 1.5px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  cursor: pointer;
  transition: border-color 0.18s var(--app-ease), background-color 0.18s var(--app-ease),
    transform 0.12s var(--app-ease);

  &:active {
    transform: scale(0.98);
  }

  &--selected {
    border-color: rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), 0.08);
  }

  &__icon {
    color: rgb(var(--v-theme-on-surface-variant));
    flex: none;
  }

  &--selected &__icon {
    color: rgb(var(--v-theme-primary));
  }

  &__body {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  &__label {
    font-weight: 600;
    font-size: 0.98rem;
  }

  &__desc {
    font-size: 0.8rem;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-top: 0.1rem;
  }

  &__check {
    color: rgb(var(--v-theme-primary));
    flex: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .onboarding-option {
    transition: none;
  }
}
</style>
