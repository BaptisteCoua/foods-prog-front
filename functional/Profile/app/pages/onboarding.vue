<template>
  <div class="onboarding">
    <header class="onboarding__head">
      <v-btn
        :disabled="isFirstStep"
        icon="mdi-arrow-left"
        variant="text"
        size="small"
        aria-label="Étape précédente"
        @click="previous"
      />
      <div class="onboarding__progress">
        <div class="onboarding__bar">
          <span
            class="onboarding__bar-fill"
            :style="{ width: `${progress * 100}%` }"
          />
        </div>
      </div>
      <span class="onboarding__counter">{{ currentIndex + 1 }}/{{ totalSteps }}</span>
    </header>

    <div class="onboarding__body">
      <Transition
        name="step"
        mode="out-in"
      >
        <div
          :key="currentStep.key"
          class="onboarding__step"
        >
          <div class="onboarding__intro">
            <h1 class="onboarding__title">
              {{ currentStep.title }}
            </h1>
            <p class="onboarding__subtitle">
              {{ currentStep.subtitle }}
            </p>
          </div>
          <component :is="STEP_COMPONENTS[currentStep.component]" />
        </div>
      </Transition>
    </div>

    <footer class="onboarding__footer">
      <v-btn
        v-if="currentStep.optional"
        variant="text"
        class="onboarding__skip"
        @click="skip"
      >
        Passer
      </v-btn>
      <v-btn
        color="primary"
        size="large"
        flat
        block
        :loading="isSubmitting"
        :disabled="!isCurrentValid"
        @click="next"
      >
        {{ isLastStep ? 'Terminer' : 'Continuer' }}
      </v-btn>
    </footer>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
// Step components are selected dynamically by name. Nuxt only auto-imports
// components referenced as tags, so the wizard steps are imported explicitly
// and mapped here — otherwise <component :is="name"> resolves to nothing.
import OnboardingPseudo from '../components/OnboardingPseudo.vue'
import OnboardingPhysical from '../components/OnboardingPhysical.vue'
import OnboardingActivity from '../components/OnboardingActivity.vue'
import OnboardingTraining from '../components/OnboardingTraining.vue'
import OnboardingGoals from '../components/OnboardingGoals.vue'
import OnboardingDiet from '../components/OnboardingDiet.vue'
import OnboardingHabits from '../components/OnboardingHabits.vue'
import OnboardingPreferences from '../components/OnboardingPreferences.vue'
import OnboardingHydration from '../components/OnboardingHydration.vue'

const STEP_COMPONENTS: Record<string, Component> = {
  OnboardingPseudo,
  OnboardingPhysical,
  OnboardingActivity,
  OnboardingTraining,
  OnboardingGoals,
  OnboardingDiet,
  OnboardingHabits,
  OnboardingPreferences,
  OnboardingHydration,
}

definePageMeta({ layout: 'onboarding' })
useHead({ title: 'Bienvenue' })

const onboarding = useOnboardingStore()
const {
  currentStep,
  currentIndex,
  totalSteps,
  isFirstStep,
  isLastStep,
  isCurrentValid,
  isSubmitting,
  progress,
} = storeToRefs(onboarding)
const { next, previous, skip, prefillFromGoogle } = onboarding

// La page n'est atteignable que sans profil existant (cf. middleware) : si le
// compte vient d'être créé via Google, on pré-remplit sexe + date de naissance.
onMounted(() => {
  void prefillFromGoogle()
})
</script>

<style scoped lang="scss">
.onboarding {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  max-width: 480px;
  margin: 0 auto;
  padding: 0.5rem 1.25rem calc(1.25rem + env(safe-area-inset-bottom));

  &__head {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0 1.25rem;
  }

  &__progress {
    flex: 1;
  }

  &__bar {
    height: 6px;
    border-radius: 999px;
    background: rgba(var(--v-border-color), 0.12);
    overflow: hidden;
  }

  &__bar-fill {
    display: block;
    height: 100%;
    border-radius: 999px;
    background: rgb(var(--v-theme-primary));
    transition: width 0.45s var(--app-ease);
  }

  &__counter {
    font-size: 0.8rem;
    font-weight: 600;
    color: rgb(var(--v-theme-on-surface-variant));
    font-variant-numeric: tabular-nums;
    min-width: 2.5ch;
    text-align: right;
  }

  &__body {
    flex: 1;
  }

  &__intro {
    margin-bottom: 1.5rem;
  }

  &__title {
    font-size: 1.6rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.15;
  }

  &__subtitle {
    color: rgb(var(--v-theme-on-surface-variant));
    margin-top: 0.4rem;
    font-size: 0.95rem;
  }

  &__footer {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding-top: 1.25rem;
  }

  &__skip {
    align-self: center;
  }
}

.step-enter-active,
.step-leave-active {
  transition: opacity 0.25s var(--app-ease), transform 0.25s var(--app-ease);
}

.step-enter-from {
  opacity: 0;
  transform: translateX(24px);
}

.step-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}

@media (prefers-reduced-motion: reduce) {
  .onboarding__bar-fill,
  .step-enter-active,
  .step-leave-active {
    transition: none;
  }
}
</style>
