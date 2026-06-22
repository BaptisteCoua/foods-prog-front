<template>
  <div class="week-strip">
    <button
      v-for="day in days"
      :key="day.date"
      type="button"
      class="week-strip__day"
      :class="{
        'week-strip__day--selected': day.isSelected,
        'week-strip__day--today': day.isToday,
      }"
      :aria-pressed="day.isSelected"
      :aria-label="ariaLabel(day.date)"
      @click="emit('select', day.date)"
    >
      <span class="week-strip__weekday">{{ weekdayInitial(day.date) }}</span>
      <span
        class="week-strip__ring"
        :style="ringStyle(day.ratio)"
      >
        <span class="week-strip__number">{{ dayNumber(day.date) }}</span>
      </span>
      <span
        class="week-strip__dot"
        :class="{ 'week-strip__dot--on': day.hasMeals }"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import { dayNumber, formatLongDate, weekdayInitial } from '../utils/planningDate'

interface DaySummary {
  date: string
  ratio: number | null
  hasMeals: boolean
  isToday: boolean
  isSelected: boolean
}

defineProps<{ days: DaySummary[] }>()
const emit = defineEmits<{ select: [string] }>()

const ariaLabel = (date: string) => formatLongDate(date)

// Emerald conic fill for the completion ring; neutral track when no target.
const ringStyle = (ratio: number | null) => {
  if (ratio === null) return {}
  const deg = Math.round(ratio * 360)
  return {
    background: `conic-gradient(rgb(var(--v-theme-primary)) ${deg}deg, rgba(var(--v-border-color), var(--v-border-opacity)) ${deg}deg)`,
  }
}
</script>

<style scoped lang="scss">
.week-strip {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;

  &__day {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    padding: 0.5rem 0.1rem;
    border-radius: 16px;
    transition: background 0.18s var(--app-ease);

    &--selected {
      background: rgba(var(--v-theme-primary), 0.1);
    }
  }

  &__weekday {
    font-size: 0.68rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__ring {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(var(--v-border-color), var(--v-border-opacity));
  }

  &__number {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: rgb(var(--v-theme-surface));
    font-size: 0.85rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.01em;

    .week-strip__day--today & {
      color: rgb(var(--v-theme-primary));
    }
  }

  &__dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: transparent;

    &--on {
      background: rgb(var(--v-theme-primary));
    }
  }
}
</style>
