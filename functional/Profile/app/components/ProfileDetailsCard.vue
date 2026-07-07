<template>
  <v-card
    class="details"
    elevation="0"
  >
    <header class="details__head">
      <div>
        <h2 class="details__title">
          Mes informations
        </h2>
        <p class="details__subtitle">
          Renseignées à l'inscription
        </p>
      </div>
      <v-btn
        variant="tonal"
        color="primary"
        size="small"
        prepend-icon="mdi-pencil"
        class="details__edit"
        @click="emit('edit')"
      >
        Modifier
      </v-btn>
    </header>

    <section
      v-for="section in sections"
      :key="section.key"
      class="details__section"
    >
      <div class="details__section-head">
        <v-icon
          :icon="section.icon"
          size="18"
          class="details__section-icon"
        />
        <h3 class="details__section-title">
          {{ section.title }}
        </h3>
      </div>

      <dl class="details__rows">
        <div
          v-for="row in section.rows"
          :key="row.label"
          class="details__row"
        >
          <dt class="details__label">
            {{ row.label }}
          </dt>
          <dd class="details__value-cell">
            <div
              v-if="row.chips"
              class="details__chips"
            >
              <v-chip
                v-for="chip in row.chips"
                :key="chip"
                size="x-small"
                variant="tonal"
                color="primary"
              >
                {{ chip }}
              </v-chip>
              <span
                v-if="row.chips.length === 0"
                class="details__muted"
              >
                Non renseigné
              </span>
            </div>
            <span
              v-else
              class="details__value"
              :class="{ details__muted: !row.value }"
            >
              {{ row.value ?? 'Non renseigné' }}
            </span>
          </dd>
        </div>
      </dl>
    </section>
  </v-card>
</template>

<script setup lang="ts">
const emit = defineEmits<{ edit: [] }>()

const { sections } = useProfileDetails()
</script>

<style scoped lang="scss">
.details {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 18px;
  padding: 1.25rem;

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }

  &__title {
    font-size: 1.1rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  &__subtitle {
    font-size: 0.82rem;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-top: 0.1rem;
  }

  &__edit {
    flex: none;
    border-radius: 12px;
  }

  &__section {
    padding-top: 1rem;
    margin-top: 1rem;
    border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  }

  &__section-head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.6rem;
  }

  &__section-icon {
    color: rgb(var(--v-theme-primary-text));
  }

  &__section-title {
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  &__rows {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }

  &__row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
  }

  &__label {
    font-size: 0.85rem;
    color: rgb(var(--v-theme-on-surface-variant));
    flex: none;
  }

  &__value-cell {
    min-width: 0;
    text-align: right;
  }

  &__value {
    font-size: 0.9rem;
    font-weight: 600;
  }

  &__muted {
    font-weight: 500;
    color: rgb(var(--v-theme-on-surface-variant));
    opacity: 0.7;
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    justify-content: flex-end;
  }
}
</style>
