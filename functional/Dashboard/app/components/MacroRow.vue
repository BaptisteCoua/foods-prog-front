<template>
  <div class="macro-row">
    <span class="macro-row__label">
      <span
        class="macro-row__dot"
        :style="{ background: dotColor }"
      />
      {{ macro.label }}
    </span>
    <span class="macro-row__val">
      <b>{{ consumedLabel }}</b> / {{ macro.target }} {{ macro.unit }}
    </span>
    <span class="macro-row__bar">
      <span
        class="macro-row__fill"
        :style="{ width: `${shown * 100}%`, background: dotColor }"
      />
    </span>
  </div>
</template>

<script setup lang="ts">
import type { MacroSummary } from '../composables/useDailySummary'

const props = defineProps<{ macro: MacroSummary }>()

const percent = computed(() =>
  props.macro.target > 0 ? Math.min(1, props.macro.consumed / props.macro.target) : 0,
)

const { shown } = useAnimatedProgress(percent)
const { formatted: consumedLabel } = useCountUp(() => props.macro.consumed, { duration: 1200 })

const dotColor = computed(() => `rgb(var(--v-theme-${props.macro.color}))`)
</script>

<style scoped lang="scss">
.macro-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.4rem 0.75rem;
  align-items: baseline;
  margin-bottom: 1.1rem;

  &:last-child {
    margin-bottom: 0;
  }

  &__label {
    font-size: 0.95rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.55rem;
  }

  &__dot {
    width: 9px;
    height: 9px;
    border-radius: 999px;
  }

  &__val {
    font-size: 0.85rem;
    color: rgb(var(--v-theme-on-surface-variant));
    font-variant-numeric: tabular-nums;

    b {
      color: rgb(var(--v-theme-on-surface));
      font-weight: 700;
    }
  }

  &__bar {
    grid-column: 1 / -1;
    height: 7px;
    border-radius: 999px;
    background: rgba(var(--v-border-color), 0.1);
    overflow: hidden;
  }

  &__fill {
    display: block;
    height: 100%;
    border-radius: 999px;
    transition: width 1.3s var(--app-ease);
  }
}

@media (prefers-reduced-motion: reduce) {
  .macro-row__fill {
    transition: none;
  }
}
</style>
