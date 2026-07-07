<template>
  <AppSheet
    :model-value="modelValue"
    :max-width="560"
    title="Copier la journée"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="dup">
      <header class="dup__head">
        <div>
          <h2 class="dup__title">
            Copier la journée
          </h2>
          <p class="dup__subtitle">
            {{ formatLongDate(sourceDate) }} → vers&nbsp;:
          </p>
        </div>
      </header>

      <div class="dup__targets">
        <v-checkbox
          v-for="date in targets"
          :key="date"
          v-model="selected"
          :value="date"
          :label="formatLongDate(date)"
          hide-details
          density="comfortable"
          color="primary"
        />
      </div>

      <div class="dup__actions">
        <v-btn
          variant="text"
          size="small"
          @click="toggleAll"
        >
          {{ allSelected ? 'Tout désélectionner' : 'Tout sélectionner' }}
        </v-btn>
        <v-btn
          color="primary"
          flat
          :loading="busy"
          :disabled="!selected.length"
          @click="emit('confirm', selected)"
        >
          Copier{{ selected.length ? ` (${selected.length})` : '' }}
        </v-btn>
      </div>
    </div>
  </AppSheet>
</template>

<script setup lang="ts">
import { formatLongDate } from '../utils/planningDate'

const props = defineProps<{
  modelValue: boolean
  sourceDate: string
  dates: string[]
  busy: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
  'confirm': [string[]]
}>()

const selected = ref<string[]>([])

// Every day of the visible week except the one being copied.
const targets = computed(() => props.dates.filter(date => date !== props.sourceDate))

const allSelected = computed(() =>
  targets.value.length > 0 && selected.value.length === targets.value.length,
)

const toggleAll = () => {
  selected.value = allSelected.value ? [] : [...targets.value]
}

// Start from a clean selection each time the sheet opens.
watch(() => props.modelValue, (open) => {
  if (open) selected.value = []
})
</script>

<style scoped lang="scss">
.dup {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.25rem 1.1rem 1.4rem;

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
  }

  &__title {
    font-size: 1.15rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  &__subtitle {
    font-size: 0.82rem;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-top: 0.1rem;
    text-transform: capitalize;
  }

  &__targets {
    display: flex;
    flex-direction: column;
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-top: 0.4rem;
  }
}
</style>
