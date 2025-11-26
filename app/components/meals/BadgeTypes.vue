<template>
  <div class="flex gap-2">
    <UBadge
      v-for="(value, i) in mealTypes"
      :key="i"
      variant="subtle"
      class="rounded-full"
      color="neutral"
    >
      {{ value.name }}
    </UBadge>
  </div>
</template>

<script lang="ts" setup>
import type { IMealTypes } from '~/models/meals'

defineProps<{
  mealTypes: IMealTypes[]
}>()
</script>

<style>

</style>
