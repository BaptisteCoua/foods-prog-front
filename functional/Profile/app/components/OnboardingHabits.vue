<template>
  <div class="step">
    <div class="step__group">
      <div class="step__slider-head">
        <span class="step__legend">Repas par jour</span>
        <span class="step__value">{{ form.mealsPerDay }}</span>
      </div>
      <v-slider
        v-model="form.mealsPerDay"
        :min="1"
        :max="6"
        :step="1"
        color="primary"
        thumb-label
        hide-details
        aria-label="Repas par jour"
      />
    </div>

    <div class="step__group">
      <span class="step__legend">Grignotage</span>
      <div class="step__row">
        <OnboardingOption
          v-for="opt in SNACKING_OPTIONS"
          :key="opt.value"
          :label="opt.label"
          :selected="form.snacking === opt.value"
          @click="form.snacking = opt.value"
        />
      </div>
    </div>

    <div class="step__group">
      <span class="step__legend">Temps pour cuisiner</span>
      <div class="step__row">
        <OnboardingOption
          v-for="opt in COOKING_TIME_OPTIONS"
          :key="opt.value"
          :label="opt.label"
          :description="opt.description"
          :selected="form.cookingTime === opt.value"
          @click="form.cookingTime = opt.value"
        />
      </div>
    </div>

    <div class="step__group">
      <span class="step__legend">Repas à l'extérieur</span>
      <div class="step__row">
        <OnboardingOption
          v-for="opt in EATING_OUT_OPTIONS"
          :key="opt.value"
          :label="opt.label"
          :selected="form.eatingOutFrequency === opt.value"
          @click="form.eatingOutFrequency = opt.value"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  COOKING_TIME_OPTIONS,
  EATING_OUT_OPTIONS,
  SNACKING_OPTIONS,
} from '../types/profile'

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

  &__slider-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__legend {
    font-size: 0.8rem;
    font-weight: 600;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__value {
    font-weight: 800;
    font-size: 1.1rem;
    color: rgb(var(--v-theme-primary-text));
  }

  &__row {
    display: flex;
    gap: 0.6rem;

    > * {
      flex: 1 1 0;
      min-width: 0;
    }
  }
}
</style>
