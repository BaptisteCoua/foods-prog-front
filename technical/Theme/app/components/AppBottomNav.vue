<template>
  <v-bottom-navigation
    :model-value="active"
    grow
    height="72"
    color="primary"
    class="app-bottom-nav"
  >
    <v-btn
      v-for="item in items"
      :key="item.value"
      :value="item.value"
      :to="item.to"
      stacked
      class="app-bottom-nav__btn"
    >
      <v-icon
        :icon="item.icon"
        size="23"
      />
      <span class="app-bottom-nav__label">{{ item.label }}</span>
    </v-btn>
  </v-bottom-navigation>
</template>

<script setup lang="ts">
const { items, active } = useMainNav()
</script>

<style scoped lang="scss">
.app-bottom-nav {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgba(var(--v-theme-surface), 0.82) !important;
  backdrop-filter: blur(14px);

  &__btn {
    min-width: 0;

    :deep(.v-btn__content) {
      gap: 3px;
    }

    // Active "pill" behind the icon + label.
    :deep(.v-icon) {
      position: relative;
      transition: transform 0.25s var(--app-ease);
    }

    &.v-btn--active :deep(.v-icon) {
      transform: translateY(-1px) scale(1.08);
    }

    &.v-btn--active::before {
      content: '';
      position: absolute;
      inset: 10px 12px;
      border-radius: 14px;
      background: rgb(var(--v-theme-primary));
      opacity: 0.1;
    }
  }

  &__label {
    font-size: 0.66rem;
    font-weight: 600;
    letter-spacing: 0.01em;
  }
}
</style>
