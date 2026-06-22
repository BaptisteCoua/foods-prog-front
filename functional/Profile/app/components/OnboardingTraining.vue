<template>
  <div class="step">
    <div class="step__group">
      <div class="step__slider-head">
        <span class="step__legend">Séances par semaine</span>
        <span class="step__value">{{ form.trainingDaysPerWeek }}</span>
      </div>
      <v-slider
        v-model="form.trainingDaysPerWeek"
        :min="0"
        :max="7"
        :step="1"
        color="primary"
        thumb-label
        hide-details
      />
    </div>

    <v-expand-transition>
      <div
        v-if="form.trainingDaysPerWeek > 0"
        class="step__group"
      >
        <v-text-field
          v-model.number="form.avgSessionMinutes"
          label="Durée moyenne d'une séance"
          type="number"
          suffix="min"
          prepend-inner-icon="mdi-timer-outline"
          hide-details
        />

        <span class="step__legend">Types d'entraînement</span>
        <div class="step__grid">
          <OnboardingOption
            v-for="opt in TRAINING_TYPE_OPTIONS"
            :key="opt.value"
            :label="opt.label"
            :icon="opt.icon"
            :selected="form.trainingTypes.includes(opt.value)"
            @click="toggleType(opt.value)"
          />
        </div>
      </div>
    </v-expand-transition>

    <OnboardingExplainer title="Comment le sport est compté ?">
      <p>
        Tes séances ajoutent une <strong>dépense d'entraînement</strong> à ta
        dépense quotidienne. On l'estime à partir du nombre de séances par
        semaine, de leur durée et du type d'effort, puis on la lisse sur la
        semaine.
      </p>
      <span class="explainer__formula">
        TDEE = dépense quotidienne + dépense d'entraînement
      </span>
      <p>
        Ce <strong>TDEE</strong> (dépense énergétique totale) est le nombre de
        calories pour rester stable. Sans séance renseignée, seul ton niveau
        d'activité compte.
      </p>
    </OnboardingExplainer>
  </div>
</template>

<script setup lang="ts">
import { TRAINING_TYPE_OPTIONS, type TrainingType } from '../types/profile'

const { form } = useOnboardingStore()

const toggleType = (value: TrainingType) => {
  const index = form.trainingTypes.indexOf(value)
  if (index === -1) form.trainingTypes.push(value)
  else form.trainingTypes.splice(index, 1)
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
