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

    <OnboardingExplainer>
      <p>
        Ton métabolisme de base est multiplié par un <strong>facteur
          d'activité</strong> qui reflète ta dépense au quotidien (déplacements,
        travail, vie de tous les jours), <strong>hors séances de sport</strong>.
      </p>
      <span class="explainer__formula">
        Dépense quotidienne = métabolisme de base × facteur d'activité
      </span>
      <p>
        Plus tu bouges dans ta journée, plus le facteur est élevé — donc plus ta
        cible de calories augmente.
      </p>
    </OnboardingExplainer>
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
