<template>
  <v-main class="onboarding-layout">
    <slot />
  </v-main>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.onboarding-layout {
  min-height: 100dvh;
  background:
    radial-gradient(120% 60% at 50% -10%, rgba(var(--v-theme-primary), 0.08), transparent 55%),
    rgb(var(--v-theme-background));
}
</style>
