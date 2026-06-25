<template>
  <div
    class="animated-ring"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <svg
      :width="size"
      :height="size"
      :viewBox="`0 0 ${size} ${size}`"
      class="animated-ring__svg"
    >
      <circle
        class="animated-ring__track"
        :cx="center"
        :cy="center"
        :r="radius"
        :stroke-width="width"
      />
      <circle
        class="animated-ring__fill"
        :cx="center"
        :cy="center"
        :r="radius"
        :stroke="strokeColor"
        :stroke-width="width"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
      />
      <!-- Overshoot: drawn on top of the full ring when progress goes past 1. -->
      <circle
        v-if="overShown > 0"
        class="animated-ring__over"
        :cx="center"
        :cy="center"
        :r="radius"
        :stroke="overStrokeColor"
        :stroke-width="width"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="overOffset"
      />
    </svg>
    <div class="animated-ring__center">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  progress: number
  size?: number
  width?: number
  color?: string
  // Colour of the overshoot arc shown when progress exceeds 1.
  overColor?: string
}>(), {
  size: 216,
  width: 13,
  color: 'primary',
  overColor: 'warning',
})

const { shown } = useAnimatedProgress(() => Math.max(0, Math.min(1, props.progress)))
// Fraction eaten beyond the target (0..1 = one extra full loop), drawn as a
// distinct arc over the full ring so going past the objective is visible.
const { shown: overShown } = useAnimatedProgress(() => Math.max(0, Math.min(1, props.progress - 1)))

const center = computed(() => props.size / 2)
const radius = computed(() => props.size / 2 - props.width / 2 - 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const offset = computed(() => circumference.value * (1 - shown.value))
const overOffset = computed(() => circumference.value * (1 - overShown.value))
const strokeColor = computed(() => `rgb(var(--v-theme-${props.color}))`)
const overStrokeColor = computed(() => `rgb(var(--v-theme-${props.overColor}))`)
</script>

<style scoped lang="scss">
.animated-ring {
  position: relative;

  &__svg {
    transform: rotate(-90deg);
    display: block;
  }

  &__track {
    fill: none;
    stroke: rgba(var(--v-border-color), 0.12);
  }

  &__fill,
  &__over {
    fill: none;
    stroke-linecap: round;
    transition: stroke-dashoffset 1.4s var(--app-ease);
  }

  &__fill {
    filter: drop-shadow(0 4px 12px rgba(var(--v-theme-primary), 0.4));
  }

  &__over {
    filter: drop-shadow(0 4px 12px rgba(var(--v-theme-warning), 0.45));
  }

  &__center {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .animated-ring__fill,
  .animated-ring__over {
    transition: none;
  }
}
</style>
