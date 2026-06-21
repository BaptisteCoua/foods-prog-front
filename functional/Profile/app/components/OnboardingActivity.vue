<template>
  <div class="choices">
    <OnboardingOption
      v-for="opt in ACTIVITY_OPTIONS"
      :key="opt.value"
      :label="opt.label"
      :description="opt.description"
      :selected="form.activityLevel === opt.value"
      @click="form.activityLevel = opt.value"
    />
  </div>
</template>

<script setup lang="ts">
import { ACTIVITY_OPTIONS } from '../types/profile'

const { form } = useOnboardingStore()
</script>

<style scoped lang="scss">
.choices {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
</style>
