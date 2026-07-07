<template>
  <AppSheet
    :model-value="modelValue"
    :max-width="440"
    title="Filtrer"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="filter-sheet">
      <header class="filter-sheet__head">
        <h2 class="filter-sheet__title">
          Filtrer
        </h2>
        <v-btn
          variant="text"
          size="small"
          :disabled="!activeCount"
          @click="resetAll"
        >
          Réinitialiser
        </v-btn>
      </header>

      <section
        v-for="group in groups"
        :key="group.key"
        class="filter-sheet__group"
      >
        <h3 class="filter-sheet__group-title">
          {{ group.label }}
        </h3>
        <v-chip-group
          :model-value="group.selected"
          multiple
          column
          @update:model-value="emit('update:group', group.key, $event as number[])"
        >
          <v-chip
            v-for="option in group.options"
            :key="option.value"
            :value="option.value"
            size="small"
            filter
            :variant="group.variant ?? 'outlined'"
            :color="group.color"
            :prepend-icon="group.icon"
          >
            {{ option.label }}
          </v-chip>
        </v-chip-group>
      </section>
    </div>
  </AppSheet>
</template>

<script setup lang="ts">
// Presentational multi-group facet picker, mirroring AppSortSheet. Owns no
// state: the open flag is a v-model and each group's selection is pushed back
// via `update:group` so the page composable stays the single source of truth.
const props = defineProps<{
  modelValue: boolean
  groups: FilterGroup[]
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
  'update:group': [key: string, ids: number[]]
}>()

const activeCount = computed(() => countActiveFilters(props.groups))

const resetAll = () => {
  for (const group of props.groups) {
    if (group.selected.length) emit('update:group', group.key, [])
  }
}
</script>

<style scoped lang="scss">
.filter-sheet {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

  &__group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  &__group-title {
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: rgb(var(--v-theme-on-surface-variant));
  }
}
</style>
