<template>
  <UHeader>
    <template #title>
      FoodProg
    </template>
    <UNavigationMenu :items="items" />
    <template #right>
      <UColorModeButton />
    </template>
  </UHeader>

  <UContainer>
    <slot />
  </UContainer>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Aliments',
    to: '/foods',
    active: route.path.startsWith('/foods'),
  },
  {
    label: 'Repas',
    to: '/meals',
    active: route.path.startsWith('/meals'),
  },
])
</script>

<style>

</style>
