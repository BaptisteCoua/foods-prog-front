<template>
  <div class="auth-layout">
    <header class="auth-layout__top">
      <AppLogo />
      <ThemeToggle />
    </header>
    <main
      id="main-content"
      class="auth-layout__content"
    >
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.auth-layout {
  min-height: 100dvh;
  background:
    radial-gradient(120% 70% at 50% -10%, rgba(var(--v-theme-primary), 0.1), transparent 60%),
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
