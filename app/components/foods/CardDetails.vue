<template>
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
          :name="item.name"
          :avatar="{
            src: item.picture,
            alt: item.name,
          }"
          size="xl"
        >
          <template #description>
            <div class="mb-2">
              price : {{ item.foodDetail?.price }} €
            </div>
            <CardTypes
              v-if="item.foodTypes"
              :food-types="item.foodTypes"
            />
          </template>
        </UUser>
      </template>
    </UPageCard>
  </UPageList>
</template>

<script lang="ts" setup>
import { useFoods } from '~/composables/useFoods'

const { getListFoods, foods } = useFoods()

getListFoods()
</script>

<style>

</style>
