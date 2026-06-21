<template>
  <div class="step">
    <div class="step__group">
      <div class="step__slider-head">
        <span class="step__legend">Objectif d'eau par jour</span>
        <span class="step__value">{{ litersLabel }}</span>
      </div>
      <v-slider
        v-model="form.waterTargetMl"
        :min="500"
        :max="4000"
        :step="250"
        color="primary"
        hide-details
      />
    </div>

    <div class="step__group">
      <span class="step__legend">Boissons habituelles</span>
      <div class="step__grid">
        <OnboardingOption
          v-for="opt in DRINK_OPTIONS"
          :key="opt.value"
          :label="opt.label"
          :icon="opt.icon"
          :selected="form.usualDrinks.includes(opt.value)"
          @click="toggleDrink(opt.value)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DRINK_OPTIONS, type DrinkType } from '../types/profile'

const { form } = useOnboardingStore()

const litersLabel = computed(() =>
  form.waterTargetMl ? `${(form.waterTargetMl / 1000).toLocaleString('fr-FR')} L` : '—',
)

const toggleDrink = (value: DrinkType) => {
  const index = form.usualDrinks.indexOf(value)
  if (index === -1) form.usualDrinks.push(value)
  else form.usualDrinks.splice(index, 1)
}
</script>

<style scoped lang="scss">
.step {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
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
    color: rgb(var(--v-theme-primary));
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
  }
}
</style>
