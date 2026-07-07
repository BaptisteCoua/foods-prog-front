<template>
  <AppSheet
    v-model="open"
    :max-width="640"
    title="Modifier mon profil"
  >
    <div class="editor">
      <header class="editor__bar">
        <span class="editor__bar-title">Modifier mon profil</span>
        <v-btn
          variant="flat"
          color="primary"
          class="editor__save"
          :loading="saving"
          :disabled="!isValid"
          @click="onSave"
        >
          Enregistrer
        </v-btn>
      </header>

      <div class="editor__body">
        <!-- Physique -->
        <section class="editor__section">
          <div class="editor__section-head">
            <v-icon
              icon="mdi-human"
              size="18"
            />
            <h3>Physique</h3>
          </div>
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
            <AppDateField
              v-model="form.birthDate"
              label="Date de naissance"
              :max="todayIso"
              hide-details
            />
            <div class="step__row">
              <v-text-field
                v-model.number="form.heightCm"
                label="Taille"
                type="number"
                suffix="cm"
                prepend-inner-icon="mdi-human-male-height"
                hide-details
              />
              <v-text-field
                v-model.number="form.weightKg"
                label="Poids"
                type="number"
                suffix="kg"
                prepend-inner-icon="mdi-scale-bathroom"
                hide-details
              />
            </div>
          </div>
        </section>

        <!-- Activité -->
        <section class="editor__section">
          <div class="editor__section-head">
            <v-icon
              icon="mdi-walk"
              size="18"
            />
            <h3>Activité quotidienne</h3>
          </div>
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
        </section>

        <!-- Entraînement -->
        <section class="editor__section">
          <div class="editor__section-head">
            <v-icon
              icon="mdi-dumbbell"
              size="18"
            />
            <h3>Entraînement</h3>
          </div>
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
                    @click="toggleTrainingType(opt.value)"
                  />
                </div>
              </div>
            </v-expand-transition>
          </div>
        </section>

        <!-- Objectif -->
        <section class="editor__section">
          <div class="editor__section-head">
            <v-icon
              icon="mdi-target"
              size="18"
            />
            <h3>Objectif</h3>
          </div>
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
        </section>

        <!-- Alimentation -->
        <section class="editor__section">
          <div class="editor__section-head">
            <v-icon
              icon="mdi-food-apple-outline"
              size="18"
            />
            <h3>Alimentation</h3>
          </div>
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
        </section>

        <!-- Habitudes -->
        <section class="editor__section">
          <div class="editor__section-head">
            <v-icon
              icon="mdi-silverware-fork-knife"
              size="18"
            />
            <h3>Habitudes</h3>
          </div>
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
        </section>

        <!-- Préférences -->
        <section class="editor__section">
          <div class="editor__section-head">
            <v-icon
              icon="mdi-heart-outline"
              size="18"
            />
            <h3>Préférences</h3>
          </div>
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
              <div class="step__row step__row--wrap">
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
        </section>

        <!-- Hydratation -->
        <section class="editor__section">
          <div class="editor__section-head">
            <v-icon
              icon="mdi-cup-water"
              size="18"
            />
            <h3>Hydratation</h3>
          </div>
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
        </section>
      </div>
    </div>
  </AppSheet>
</template>

<script setup lang="ts">
import {
  ACTIVITY_OPTIONS,
  ALLERGEN_OPTIONS,
  COOKING_TIME_OPTIONS,
  DIET_OPTIONS,
  DRINK_OPTIONS,
  EATING_OUT_OPTIONS,
  OBJECTIVE_OPTIONS,
  SEX_OPTIONS,
  SNACKING_OPTIONS,
  SPICE_OPTIONS,
  TRAINING_TYPE_OPTIONS,
} from '../types/profile'

const emit = defineEmits<{ saved: [] }>()

const profileStore = useProfileStore()
const {
  form,
  saving,
  isValid,
  loadFrom,
  save,
  toggleTrainingType,
  toggleAllergen,
  toggleDrink,
} = useProfileEditor()

const open = ref(false)

// No future birth dates.
const todayIso = new Date().toISOString().slice(0, 10)

const litersLabel = computed(() =>
  form.waterTargetMl ? `${(form.waterTargetMl / 1000).toLocaleString('fr-FR')} L` : '—',
)

const openDialog = () => {
  loadFrom(profileStore.profile)
  open.value = true
}

const close = () => {
  open.value = false
}

const onSave = async () => {
  const ok = await save()
  if (ok) {
    close()
    emit('saved')
  }
}

defineExpose({ open: openDialog, close })
</script>

<style scoped lang="scss">
.editor {
  display: flex;
  flex-direction: column;

  &__bar {
    position: sticky;
    top: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.4rem 0.9rem 0.6rem;
    background: rgb(var(--v-theme-surface));
    border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  }

  &__bar-title {
    flex: 1;
    font-weight: 800;
    font-size: 1.05rem;
    letter-spacing: -0.02em;
  }

  &__save {
    border-radius: 12px;
  }

  &__body {
    width: 100%;
    max-width: 520px;
    margin: 0 auto;
    padding: 1.25rem 1rem 2.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
  }

  &__section-head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.9rem;

    h3 {
      font-size: 1.05rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .v-icon {
      color: rgb(var(--v-theme-primary));
    }
  }
}

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

  &__slider-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__value {
    font-weight: 800;
    font-size: 1.1rem;
    color: rgb(var(--v-theme-primary));
  }

  &__row {
    display: flex;
    gap: 0.6rem;

    > * {
      flex: 1 1 0;
      min-width: 0;
    }

    &--wrap {
      flex-wrap: wrap;

      > * {
        flex: 1 1 40%;
      }
    }
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
