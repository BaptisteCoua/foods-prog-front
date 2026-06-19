<template>
  <NuxtLink
    to="/"
    class="app-logo"
  >
    <span class="app-logo__badge">
      <v-icon
        icon="mdi-silverware-variant"
        size="20"
      />
    </span>
    <span class="app-logo__name">Food<span class="app-logo__accent">Prog</span></span>
  </NuxtLink>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.app-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: inherit;

  &__badge {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 12px;
    color: rgb(var(--v-theme-on-primary));
    background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-tertiary)));
  }

  &__name {
    font-weight: 800;
    font-size: 1.15rem;
    letter-spacing: -0.02em;
  }

  &__accent {
    color: rgb(var(--v-theme-primary));
  }
}
</style>
