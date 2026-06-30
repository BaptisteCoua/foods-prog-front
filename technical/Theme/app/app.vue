<template>
  <v-app>
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
