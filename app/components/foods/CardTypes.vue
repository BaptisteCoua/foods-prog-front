<template>
  <div class="flex gap-2">
    <UBadge
      v-for="(value, i) in foodTypes"
      :key="i"
      variant="subtle"
      class="rounded-full"
    >
      {{ value.types }}
    </UBadge>
  </div>
</template>

<script lang="ts" setup>
import type { IFoodsTypes } from '~/models/foods'

defineProps<{
  foodTypes: IFoodsTypes[]
}>()
</script>

<style>

</style>
