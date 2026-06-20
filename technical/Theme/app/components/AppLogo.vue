<template>
  <NuxtLink
    to="/"
    class="app-logo"
  >
    <span class="app-logo__badge">
      <v-icon
        icon="mdi-leaf"
        size="18"
      />
    </span>
    <span class="app-logo__name">FoodProg</span>
  </NuxtLink>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.app-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  text-decoration: none;
  color: rgb(var(--v-theme-on-surface));

  &__badge {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border-radius: 10px;
    color: rgb(var(--v-theme-on-primary));
    background: linear-gradient(135deg, rgb(var(--v-theme-primary)), color-mix(in srgb, rgb(var(--v-theme-primary)) 55%, #0ea5e9));
  }

  &__name {
    font-weight: 800;
    font-size: 1.15rem;
    letter-spacing: -0.03em;
  }
}
</style>
