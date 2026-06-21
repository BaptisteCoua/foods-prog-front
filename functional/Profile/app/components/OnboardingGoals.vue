<template>
  <div class="step">
    <div class="choices">
      <OnboardingOption
        v-for="opt in OBJECTIVE_OPTIONS"
        :key="opt.value"
        :label="opt.label"
        :icon="opt.icon"
        :selected="form.objective === opt.value"
        @click="form.objective = opt.value"
      />
    </div>

    <v-expand-transition>
      <v-text-field
        v-if="form.objective && form.objective !== 'MAINTENANCE'"
        v-model.number="form.targetWeightKg"
        label="Poids cible (optionnel)"
        type="number"
        suffix="kg"
        prepend-inner-icon="mdi-flag-checkered"
        hide-details
      />
    </v-expand-transition>
  </div>
</template>

<script setup lang="ts">
import { OBJECTIVE_OPTIONS } from '../types/profile'

const { form } = useOnboardingStore()
</script>

<style scoped lang="scss">
.step {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.choices {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
</style>
