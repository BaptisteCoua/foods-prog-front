<template>
  <div class="period">
    <div
      class="segmented"
      role="tablist"
      aria-label="Période de la liste"
    >
      <span
        class="segmented__thumb"
        :style="thumbStyle"
      />
      <button
        v-for="option in PRESETS"
        :key="option.value"
        type="button"
        role="tab"
        :aria-selected="preset === option.value"
        class="segmented__option"
        :class="{ 'segmented__option--active': preset === option.value }"
        @click="preset = option.value"
      >
        {{ option.label }}
      </button>
    </div>

    <div
      v-if="preset !== 'custom'"
      class="period__nav"
    >
      <v-btn
        icon="mdi-chevron-left"
        variant="text"
        size="small"
        aria-label="Période précédente"
        @click="emit('prev')"
      />
      <span class="period__label">{{ label }}</span>
      <v-btn
        icon="mdi-chevron-right"
        variant="text"
        size="small"
        aria-label="Période suivante"
        @click="emit('next')"
      />
    </div>

    <div
      v-else
      class="period__custom"
    >
      <v-text-field
        v-model="customFrom"
        type="date"
        label="Du"
        density="compact"
        variant="outlined"
        hide-details
      />
      <v-text-field
        v-model="customTo"
        type="date"
        label="Au"
        density="compact"
        variant="outlined"
        hide-details
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PresetKey } from '../types/shoppingList'

defineProps<{ label: string }>()

const emit = defineEmits<{ prev: [], next: [] }>()

const preset = defineModel<PresetKey>('preset', { required: true })
const customFrom = defineModel<string>('customFrom', { required: true })
const customTo = defineModel<string>('customTo', { required: true })

const PRESETS: { value: PresetKey, label: string }[] = [
  { value: 'day', label: 'Jour' },
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
  { value: 'custom', label: 'Perso' },
]

// The sliding pill is positioned by translating it by N own-widths, where N is
// the active preset's index (each segment is an equal fraction of the track).
const activeIndex = computed(() =>
  Math.max(0, PRESETS.findIndex(option => option.value === preset.value)),
)
const thumbStyle = computed(() => ({
  transform: `translateX(${activeIndex.value * 100}%)`,
}))
</script>

<style scoped lang="scss">
.period {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.segmented {
  position: relative;
  display: flex;
  align-self: center;
  width: 100%;
  max-width: 340px;
  padding: 4px;
  border-radius: 13px;
  background: rgba(var(--v-theme-on-surface), 0.06);

  &__thumb {
    position: absolute;
    top: 4px;
    bottom: 4px;
    left: 4px;
    width: calc((100% - 8px) / 4);
    border-radius: 9px;
    background: rgb(var(--v-theme-primary));
    box-shadow: 0 1px 4px rgba(var(--v-theme-primary), 0.35);
    transition: transform 0.32s var(--app-ease);
  }

  &__option {
    position: relative;
    z-index: 1;
    flex: 1 1 0;
    padding: 0.42rem 0;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: rgb(var(--v-theme-on-surface-variant));
    cursor: pointer;
    transition: color 0.2s var(--app-ease);

    &--active {
      color: rgb(var(--v-theme-on-primary));
    }
  }
}

.period__nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.period__label {
  min-width: 9rem;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: capitalize;
  color: rgb(var(--v-theme-on-surface-variant));
}

.period__custom {
  display: flex;
  gap: 0.6rem;
}

@media (prefers-reduced-motion: reduce) {
  .segmented__thumb {
    transition: none;
  }
}
</style>
