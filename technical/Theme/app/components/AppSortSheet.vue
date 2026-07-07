<template>
  <AppSheet
    :model-value="modelValue"
    :max-width="440"
    title="Trier"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="sort-sheet">
      <header class="sort-sheet__head">
        <h2 class="sort-sheet__title">
          Trier
        </h2>
        <v-btn
          variant="text"
          size="small"
          :disabled="!sorts.length"
          @click="emit('update:sorts', [])"
        >
          Réinitialiser
        </v-btn>
      </header>

      <p class="sort-sheet__hint">
        Combine plusieurs critères — l'ordre de sélection fixe la priorité.
      </p>

      <ul class="sort-sheet__list">
        <li
          v-for="option in options"
          :key="option.value"
          class="sort-sheet__row"
        >
          <span class="sort-sheet__label">
            <span
              v-if="rankOf(option.value)"
              class="sort-sheet__rank"
            >{{ rankOf(option.value) }}</span>
            {{ option.label }}
          </span>

          <div class="sort-sheet__dirs">
            <v-btn
              v-for="dir in DIRECTIONS"
              :key="dir.value"
              :icon="dir.icon"
              size="small"
              density="comfortable"
              :variant="isActive(option.value, dir.value) ? 'flat' : 'tonal'"
              :color="isActive(option.value, dir.value) ? 'primary' : undefined"
              :aria-label="`${option.label} ${dir.label}`"
              @click="toggle(option.value, dir.value)"
            />
          </div>
        </li>
      </ul>
    </div>
  </AppSheet>
</template>

<script setup lang="ts">
// Presentational multi-criteria sort picker. Owns no state: the open flag and
// the clause list are both v-models driven by the page composable.
const props = defineProps<{
  modelValue: boolean
  sorts: SortClause[]
  options: SortOption[]
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
  'update:sorts': [SortClause[]]
}>()

const DIRECTIONS: { value: SortDirection, icon: string, label: string }[] = [
  { value: 'asc', icon: 'mdi-arrow-up', label: 'croissant' },
  { value: 'desc', icon: 'mdi-arrow-down', label: 'décroissant' },
]

const isActive = (field: string, direction: SortDirection) =>
  props.sorts.some(s => s.field === field && s.direction === direction)

const rankOf = (field: string) => sortRank(props.sorts, field)

const toggle = (field: string, direction: SortDirection) => {
  emit('update:sorts', toggleSort(props.sorts, field, direction))
}
</script>

<style scoped lang="scss">
.sort-sheet {
  display: flex;
  flex-direction: column;
  padding: 0.25rem 1.25rem 1.5rem;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  &__title {
    font-size: 1.2rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  &__hint {
    font-size: 0.82rem;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-bottom: 0.5rem;
  }

  &__list {
    display: flex;
    flex-direction: column;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.6rem 0;
    border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

    &:last-child {
      border-bottom: none;
    }
  }

  &__label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    font-size: 0.95rem;
  }

  &__rank {
    display: grid;
    place-items: center;
    width: 1.4rem;
    height: 1.4rem;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 800;
    color: rgb(var(--v-theme-primary-text));
    background: rgba(var(--v-theme-primary), 0.14);
  }

  &__dirs {
    display: flex;
    gap: 0.4rem;
    flex: 0 0 auto;
  }
}
</style>
