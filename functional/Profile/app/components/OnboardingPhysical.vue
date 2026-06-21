<template>
  <div class="step">
    <div class="step__group">
      <span class="step__legend">Sexe</span>
      <div class="step__row">
        <OnboardingOption
          v-for="opt in SEX_OPTIONS"
          :key="opt.value"
          :label="opt.label"
          :icon="opt.icon"
          :selected="form.sex === opt.value"
          @click="form.sex = opt.value"
        />
      </div>
    </div>

    <v-text-field
      v-model="form.birthDate"
      label="Date de naissance"
      type="date"
      prepend-inner-icon="mdi-calendar"
    />

    <div class="step__row">
      <v-text-field
        v-model.number="form.heightCm"
        label="Taille"
        type="number"
        suffix="cm"
        prepend-inner-icon="mdi-human-male-height"
      />
      <v-text-field
        v-model.number="form.weightKg"
        label="Poids"
        type="number"
        suffix="kg"
        prepend-inner-icon="mdi-scale-bathroom"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { SEX_OPTIONS } from '../types/profile'

const { form } = useOnboardingStore()
</script>

<style scoped lang="scss">
.step {
  display: flex;
  flex-direction: column;
  gap: 1rem;

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
    gap: 0.75rem;

    > * {
      flex: 1 1 0;
      min-width: 0;
    }
  }
}
</style>
