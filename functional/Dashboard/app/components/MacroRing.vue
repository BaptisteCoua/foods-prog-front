<template>
  <div class="macro-ring">
    <v-progress-circular
      :model-value="percent"
      :color="macro.color"
      :size="74"
      :width="7"
      class="macro-ring__gauge"
    >
      <span class="macro-ring__value">{{ macro.consumed }}</span>
    </v-progress-circular>
    <span class="macro-ring__label">{{ macro.label }}</span>
    <span class="macro-ring__target">/ {{ macro.target }} {{ macro.unit }}</span>
  </div>
</template>

<script setup lang="ts">
import type { MacroSummary } from '../composables/useDailySummary'

const props = defineProps<{ macro: MacroSummary }>()

const percent = computed(() =>
  props.macro.target > 0 ? Math.min(100, (props.macro.consumed / props.macro.target) * 100) : 0,
)
</script>

<style scoped lang="scss">
.macro-ring {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;

  &__gauge {
    transition: transform 0.3s ease;
  }

  &__gauge:hover {
    transform: scale(1.05);
  }

  &__value {
    font-weight: 800;
    font-size: 1rem;
  }

  &__label {
    font-weight: 600;
    font-size: 0.85rem;
  }

  &__target {
    font-size: 0.72rem;
    color: rgb(var(--v-theme-on-surface-variant));
  }
}
</style>
