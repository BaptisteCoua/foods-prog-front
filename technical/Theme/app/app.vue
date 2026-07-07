<template>
  <v-app>
    <!-- Lien d'évitement : premier élément focusable, caché jusqu'au focus clavier.
         Pointe vers le <main> de la mise en page active (#main-content). -->
    <a
      href="#main-content"
      class="skip-link"
    >
      Aller au contenu
    </a>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </v-app>
</template>

<script setup lang="ts">
// Single Vuetify root for the whole app. Layouts provide the app bar / nav;
// pages render inside the active layout. The page transition (a soft cross-fade
// + zoom, the same everywhere) is configured in nuxt.config.ts + app.scss.
useHead({
  titleTemplate: title => (title ? `${title} · FoodProg` : 'FoodProg'),
})
</script>

<style lang="scss">
// Lien d'évitement — hors écran jusqu'au focus, puis épinglé en haut à gauche.
.skip-link {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 3000;
  margin: 0.5rem;
  padding: 0.6rem 1rem;
  border-radius: 10px;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  font-weight: 700;
  text-decoration: none;
  transform: translateY(-150%);
  transition: transform 0.18s ease;

  &:focus-visible {
    transform: translateY(0);
    outline: 2px solid rgb(var(--v-theme-on-primary));
    outline-offset: 2px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skip-link {
    transition: none;
  }
}
</style>
