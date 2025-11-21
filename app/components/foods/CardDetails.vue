<template>
  <FormAddFood />
  <UPageList
    divide
  >
    <UPageCard
      v-for="(item, index) in foods"
      :key="index"
      variant="ghost"
    >
      <template #body>
        <UUser
          :avatar="{
            src: item.picture,
            alt: item.name,
          }"
          size="xl"
        >
          <template #name>
            <div class="flex">
              <span class="mr-2">
                {{ item.name }}
              </span>
              <CardTypes
                v-if="item.foodTypes"
                :food-types="item.foodTypes"
              />
            </div>
          </template>
          <template #description>
            <div class="mb-2">
              price : {{ item.foodDetail?.price }} €
            </div>
          </template>
        </UUser>
      </template>
    </UPageCard>
  </UPageList>
</template>

<script lang="ts" setup>
import { useFoods } from '~/composables/useFoods'

const { foods } = useFoods()
</script>

<style>

</style>
