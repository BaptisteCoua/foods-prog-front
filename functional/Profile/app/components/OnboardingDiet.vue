<template>
  <div class="step">
    <div class="step__group">
      <span class="step__legend">Régime</span>
      <div class="choices">
        <OnboardingOption
          v-for="opt in DIET_OPTIONS"
          :key="opt.value"
          :label="opt.label"
          :description="opt.description"
          :selected="form.dietType === opt.value"
          @click="form.dietType = opt.value"
        />
      </div>
    </div>

    <div class="step__group">
      <span class="step__legend">Allergies & intolérances</span>
      <div class="step__grid">
        <OnboardingOption
          v-for="opt in ALLERGEN_OPTIONS"
          :key="opt.value"
          :label="opt.label"
          :selected="form.allergies.includes(opt.value)"
          @click="toggleAllergen(opt.value)"
        />
      </div>
    </div>

    <v-textarea
      v-model="form.excludedFoods"
      label="Aliments à exclure (optionnel)"
      rows="2"
      auto-grow
      hide-details
    />
  </div>
</template>

<script setup lang="ts">
import { ALLERGEN_OPTIONS, DIET_OPTIONS, type Allergen } from '../types/profile'

const { form } = useOnboardingStore()

const toggleAllergen = (value: Allergen) => {
  const index = form.allergies.indexOf(value)
  if (index === -1) form.allergies.push(value)
  else form.allergies.splice(index, 1)
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

  &__legend {
    font-size: 0.8rem;
    font-weight: 600;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
  }
}

.choices {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
</style>
