<template>
  <div class="dashboard">
    <AppReveal :delay="0">
      <header class="dashboard__greeting">
        <p class="dashboard__date">
          {{ dateLabel }}
        </p>
        <h1 class="dashboard__title">
          Bonjour 👋
        </h1>
      </header>
    </AppReveal>

    <!-- Loading -->
    <template v-if="status === 'loading'">
      <v-skeleton-loader
        type="image"
        class="dashboard__skeleton"
      />
      <v-skeleton-loader
        type="paragraph"
        class="dashboard__skeleton"
      />
    </template>

    <!-- No profile / target yet -->
    <AppReveal
      v-else-if="status === 'onboarding'"
      :delay="90"
    >
      <v-card
        class="dashboard__card dashboard__state"
        elevation="0"
      >
        <span class="dashboard__state-icon">
          <v-icon
            icon="mdi-target"
            size="26"
          />
        </span>
        <h2 class="dashboard__state-title">
          Définis ta cible
        </h2>
        <p class="dashboard__state-text">
          Renseigne ton profil pour obtenir ta cible calorique et tes macros du jour.
        </p>
        <v-btn
          color="primary"
          flat
          prepend-icon="mdi-arrow-right"
          to="/onboarding"
        >
          Compléter mon profil
        </v-btn>
      </v-card>
    </AppReveal>

    <!-- Error -->
    <AppReveal
      v-else-if="status === 'error'"
      :delay="90"
    >
      <v-card
        class="dashboard__card dashboard__state"
        elevation="0"
      >
        <span class="dashboard__state-icon dashboard__state-icon--error">
          <v-icon
            icon="mdi-wifi-off"
            size="26"
          />
        </span>
        <h2 class="dashboard__state-title">
          Données indisponibles
        </h2>
        <p class="dashboard__state-text">
          Impossible de récupérer tes données pour le moment.
        </p>
        <v-btn
          variant="tonal"
          prepend-icon="mdi-refresh"
          @click="refresh"
        >
          Réessayer
        </v-btn>
      </v-card>
    </AppReveal>

    <!-- Ready -->
    <template v-else>
      <AppReveal :delay="90">
        <DashboardHero
          :remaining="calorieRemaining"
          :consumed="calorieConsumed"
          :calorie-planned="caloriePlanned"
          :target="calorieTarget"
          :progress="calorieProgress"
          :planned-progress="plannedProgress"
          :hors-plan="horsPlanConsumed"
        />
      </AppReveal>

      <AppReveal :delay="180">
        <v-card
          class="dashboard__card"
          elevation="0"
        >
          <span class="dashboard__card-title">Macros du jour</span>
          <div class="dashboard__macros">
            <MacroRow
              v-for="macro in macros"
              :key="macro.key"
              :macro
            />
          </div>
        </v-card>
      </AppReveal>

      <AppReveal :delay="270">
        <section>
          <div class="dashboard__section-head">
            <h2 class="dashboard__section-title">
              Plats du jour
            </h2>
            <div class="dashboard__head-actions">
              <span
                v-if="hasPlannedMeals"
                class="dashboard__count"
              >{{ eatenCount }}/{{ dishes.length }} mangés</span>
              <button
                type="button"
                class="dashboard__add-inline"
                @click="openLog()"
              >
                <v-icon
                  icon="mdi-plus"
                  size="16"
                />
                J'ai mangé
              </button>
            </div>
          </div>

          <v-card
            class="dashboard__card dashboard__card--tight"
            elevation="0"
          >
            <template v-if="hasPlannedMeals">
              <DashboardDishItem
                v-for="dish in dishes"
                :key="dish.id"
                :dish
                @toggle="toggleDish"
                @remove="removeDish"
              />
              <button
                v-if="showLunchNudge"
                type="button"
                class="dashboard__nudge"
                @click="openLog('LUNCH')"
              >
                <span>Rien noté ce midi&nbsp;?</span>
                <span class="dashboard__nudge-add">+ Ajouter</span>
              </button>
            </template>
            <div
              v-else
              class="dashboard__empty"
            >
              <span class="dashboard__empty-icon">
                <v-icon
                  icon="mdi-silverware-clean"
                  size="26"
                />
              </span>
              <p class="dashboard__empty-text">
                Rien aujourd'hui. Mange quelque chose, ou planifie ta journée.
              </p>
              <div class="dashboard__empty-actions">
                <v-btn
                  color="primary"
                  flat
                  prepend-icon="mdi-plus"
                  @click="openLog()"
                >
                  J'ai mangé qqch
                </v-btn>
                <v-btn
                  variant="tonal"
                  prepend-icon="mdi-calendar-edit"
                  to="/planning"
                >
                  Planifier
                </v-btn>
              </div>
            </div>
          </v-card>
        </section>
      </AppReveal>
    </template>

    <QuickLogSheet
      v-model="logOpen"
      :default-slot="logSlot"
      @logged="refresh"
    />
  </div>
</template>

<script setup lang="ts">
import type { MealSlot } from '../../../Planning/app/types/planning'

useHead({ title: 'Accueil' })

const {
  status,
  refresh,
  dateLabel,
  calorieTarget,
  calorieConsumed,
  caloriePlanned,
  calorieRemaining,
  calorieProgress,
  plannedProgress,
  horsPlanConsumed,
  macros,
  dishes,
  hasPlannedMeals,
  eatenCount,
  showLunchNudge,
  toggleDish,
  removeDish,
} = useDailySummary()

// Quick-log sheet — opened by the FAB, the inline button and the lunch nudge.
const logOpen = ref(false)
const logSlot = ref<MealSlot | undefined>(undefined)

const openLog = (slot?: MealSlot) => {
  logSlot.value = slot
  logOpen.value = true
}
</script>

<style scoped lang="scss">
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__greeting {
    padding: 0.5rem 0.25rem 0.25rem;
  }

  &__date {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-weight: 600;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__title {
    font-size: 1.7rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    margin-top: 0.35rem;
  }

  &__skeleton {
    border-radius: 24px;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  }

  &__card {
    padding: 1.4rem;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

    &--tight {
      padding: 0.6rem;
    }
  }

  &__card-title {
    display: block;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-bottom: 1.1rem;
  }

  &__state {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.7rem;
    padding: 2rem 1.5rem;
  }

  &__state-icon {
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    border-radius: 16px;
    color: rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), 0.12);

    &--error {
      color: rgb(var(--v-theme-error));
      background: rgba(var(--v-theme-error), 0.12);
    }
  }

  &__state-title {
    font-size: 1.15rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  &__state-text {
    color: rgb(var(--v-theme-on-surface-variant));
    font-size: 0.9rem;
    max-width: 28ch;
  }

  &__section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0.25rem 0.25rem 0.75rem;
  }

  &__section-title {
    font-size: 1.05rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  &__link {
    font-size: 0.85rem;
    color: rgb(var(--v-theme-primary));
    font-weight: 700;
    text-decoration: none;
  }

  &__count {
    font-size: 0.8rem;
    font-weight: 700;
    color: rgb(var(--v-theme-primary));
    font-variant-numeric: tabular-nums;
  }

  &__head-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__add-inline {
    display: inline-flex;
    align-items: center;
    gap: 0.1rem;
    font-size: 0.8rem;
    font-weight: 700;
    color: rgb(var(--v-theme-primary));
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  &__nudge {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    width: 100%;
    margin-top: 0.35rem;
    padding: 0.6rem 0.65rem;
    border-radius: 12px;
    border: 1px dashed rgba(var(--v-border-color), calc(var(--v-border-opacity) * 2));
    background: transparent;
    font-size: 0.82rem;
    color: rgb(var(--v-theme-on-surface-variant));
    cursor: pointer;
    transition: border-color 0.2s var(--app-ease);

    &:hover {
      border-color: rgb(var(--v-theme-primary));
    }
  }

  &__nudge-add {
    font-weight: 700;
    color: rgb(var(--v-theme-primary));
  }

  &__empty-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.7rem;
    padding: 1.5rem 0.5rem 1rem;
    text-align: center;
  }

  &__empty-icon {
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    border-radius: 16px;
    color: rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), 0.12);
  }

  &__empty-text {
    color: rgb(var(--v-theme-on-surface-variant));
  }
}
</style>
