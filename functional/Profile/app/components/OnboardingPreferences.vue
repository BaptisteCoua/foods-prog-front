<template>
  <div class="step">
    <v-combobox
      v-model="form.likedFoods"
      label="Aliments que tu aimes"
      prepend-inner-icon="mdi-heart-outline"
      multiple
      chips
      closable-chips
      hide-details
      hint="Entrée pour ajouter"
    />

    <v-combobox
      v-model="form.dislikedFoods"
      label="Aliments que tu n'aimes pas"
      prepend-inner-icon="mdi-thumb-down-outline"
      multiple
      chips
      closable-chips
      hide-details
    />

    <div class="step__group">
      <span class="step__legend">Tolérance au piquant</span>
      <div class="step__row">
        <OnboardingOption
          v-for="opt in SPICE_OPTIONS"
          :key="opt.value"
          :label="opt.label"
          :selected="form.spiceLevel === opt.value"
          @click="form.spiceLevel = opt.value"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SPICE_OPTIONS } from '../types/profile'

const { form } = useOnboardingStore()
</script>

<style scoped lang="scss">
.step {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__group {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  &__legend {
    font-size: 0.8rem;
    font-weight: 600;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;

    > * {
      flex: 1 1 40%;
      min-width: 0;
    }
  }
}
</style>
