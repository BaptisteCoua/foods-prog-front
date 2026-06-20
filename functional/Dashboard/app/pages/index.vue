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
          to="/profile"
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
          :target="calorieTarget"
          :progress="calorieProgress"
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
              Repas du jour
            </h2>
            <NuxtLink
              to="/planning"
              class="dashboard__link"
            >Planifier →</NuxtLink>
          </div>

          <v-card
            class="dashboard__card dashboard__card--tight"
            elevation="0"
          >
            <template v-if="hasPlannedMeals">
              <MealItem
                v-for="meal in meals"
                :key="meal.id"
                :meal
              />
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
                Aucun repas prévu aujourd'hui.
              </p>
              <v-btn
                color="primary"
                variant="tonal"
                prepend-icon="mdi-plus"
                to="/planning"
              >
                Planifier un repas
              </v-btn>
            </div>
          </v-card>
        </section>
      </AppReveal>
    </template>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Accueil' })

const {
  status,
  refresh,
  dateLabel,
  calorieTarget,
  calorieConsumed,
  calorieRemaining,
  calorieProgress,
  macros,
  meals,
  hasPlannedMeals,
} = useDailySummary()
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
