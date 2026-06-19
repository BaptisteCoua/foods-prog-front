<template>
  <v-bottom-navigation
    :model-value="active"
    grow
    color="primary"
    class="app-bottom-nav"
  >
    <v-btn
      v-for="item in items"
      :key="item.value"
      :value="item.value"
      :to="item.to"
      stacked
    >
      <v-icon :icon="item.icon" />
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
  backdrop-filter: blur(8px);

  &__label {
    font-size: 0.68rem;
    margin-top: 2px;
  }
}
</style>
