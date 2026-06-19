<template>
  <v-btn
    :icon="isDark ? 'mdi-weather-night' : 'mdi-weather-sunny'"
    variant="text"
    :aria-label="isDark ? 'Activer le thème clair' : 'Activer le thème sombre'"
    @click="toggle"
  />
</template>

<script setup lang="ts">
const { isDark, toggle } = useAppTheme()
</script>
