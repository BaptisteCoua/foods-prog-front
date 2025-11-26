<template>
  <div class="flex flex-wrap gap-2 mt-1">
    <span
      v-for="(value, i) in foodDetailsInfo"
      :key="i"
    >
      <UBadge
        v-if="value?.value != undefined"
        variant="subtle"
        :color="value?.color"
        :icon="value?.icon"
        size="md"
      >
        {{ value?.value + ' ' + value?.suffix }}
      </UBadge>
    </span>
  </div>
</template>

<script lang="ts" setup>
import type { IFoodsDetails } from '~/models/foods'

const props = defineProps<{
  foodDetails: IFoodsDetails
  price?: boolean
}>()

type MetaItem = {
  title: string
  suffix: string
  icon: string
  color: 'error' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'neutral'
  value: number
}

const metaArray: MetaItem[] = [
  { title: 'kcal', suffix: 'kcal', icon: 'i-lucide:flame', color: 'primary', value: 0 },
  { title: 'glucide', suffix: 'g', icon: 'i-lucide:wheat', color: 'warning', value: 0 },
  { title: 'protein', suffix: 'g', icon: 'i-lucide:ham', color: 'error', value: 0 },
  { title: 'lipid', suffix: 'g', icon: 'i-lucide:sprout', color: 'secondary', value: 0 },
  { title: 'price', suffix: '€', icon: 'i-lucide:euro', color: 'neutral', value: 0 },
]
const foodDetailsInfo = computed(() => {
  if (metaArray && metaArray.length > 0) {
    return metaArray.map((item: MetaItem) => {
      if (props.price || item.title != 'price')
        if (props.foodDetails)
          return {
            ...item,
            value: item.title === 'price' ? Number(props.foodDetails[item.title].toFixed(1)) : Math.round(props.foodDetails[item.title]),
          }
    })
  }
  else {
    return []
  }
})
</script>

<style>

</style>
