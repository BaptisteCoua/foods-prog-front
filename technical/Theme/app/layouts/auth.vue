<template>
  <v-main class="auth-layout">
    <div class="auth-layout__top">
      <AppLogo />
      <ThemeToggle />
    </div>
    <div class="auth-layout__content">
      <slot />
    </div>
  </v-main>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.auth-layout {
  min-height: 100dvh;
  background:
    radial-gradient(120% 80% at 50% -10%, rgba(var(--v-theme-tertiary), 0.18), transparent 60%),
    rgb(var(--v-theme-background));

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
  }

  &__content {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem 1.25rem 2.5rem;
  }
}
</style>
