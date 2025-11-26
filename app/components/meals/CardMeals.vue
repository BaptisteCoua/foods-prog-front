<template>
  <UPageCard
    v-for="(step, index) in meals"
    :key="index"
    class="group"
    :ui="{ container: 'p-4 sm:p-4', title: 'flex items-center gap-1' }"
  >
    <UColorModeImage
      v-if="step.img"
      :light="step.img"
      :dark="step.img"
      :alt="step.name"
      loading="lazy"
      class="w-full h-50 object-contain"
    />
    <div class="flex flex-col gap-2">
      <div class="text-lg font-semibold flex flex-wrap">
        <span>
          {{ step.name }}
        </span>
        <span class="mx-2 font-light">{{ step.totalFoodsDetails?.price }} €</span>
        <BadgeTypes
          :meal-types="step.mealTypes"
        />
      </div>
      <span
        v-if="step.totalFoodsDetails"
        class="text-sm text-muted"
      >
        <BadgeDetails
          :food-details="step.totalFoodsDetails"
          size="small"
        />
      </span>
    </div>
  </UPageCard>
</template>

<script lang="ts" setup>
const { meals } = useMeals()
</script>

<style>

</style>
