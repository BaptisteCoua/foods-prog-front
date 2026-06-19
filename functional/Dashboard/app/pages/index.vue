<template>
  <div class="dashboard">
    <header class="dashboard__hero">
      <p class="dashboard__eyebrow">
        Aujourd'hui
      </p>
      <h1 class="dashboard__title">
        Bien manger, sans prise de tête 🍅
      </h1>
    </header>

    <v-card
      class="dashboard__macros"
      elevation="2"
    >
      <div class="dashboard__macros-head">
        <span class="dashboard__card-title">Cible du jour</span>
        <v-chip
          size="small"
          color="primary"
          variant="tonal"
        >
          Estimation
        </v-chip>
      </div>
      <div class="dashboard__rings">
        <MacroRing
          v-for="macro in macros"
          :key="macro.key"
          :macro
        />
      </div>
    </v-card>

    <v-card
      class="dashboard__meals"
      elevation="2"
    >
      <span class="dashboard__card-title">Repas planifiés</span>
      <div
        v-if="!hasPlannedMeals"
        class="dashboard__empty"
      >
        <v-icon
          icon="mdi-silverware-clean"
          size="40"
          color="primary"
        />
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
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Accueil' })

const { macros, hasPlannedMeals } = useDailySummary()
</script>

<style scoped lang="scss">
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__hero {
    padding: 0.5rem 0.25rem;
  }

  &__eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.72rem;
    font-weight: 700;
    color: rgb(var(--v-theme-primary));
  }

  &__title {
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  &__macros,
  &__meals {
    padding: 1.25rem;
  }

  &__macros-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  &__card-title {
    font-weight: 700;
    font-size: 1.05rem;
  }

  &__rings {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    padding: 1.5rem 0 0.5rem;
    text-align: center;
  }

  &__empty-text {
    color: rgb(var(--v-theme-on-surface-variant));
  }
}

@media (max-width: 420px) {
  .dashboard__rings {
    grid-template-columns: repeat(2, 1fr);
    row-gap: 1.25rem;
  }
}
</style>
