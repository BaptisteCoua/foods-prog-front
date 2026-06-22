<template>
  <v-card
    class="hero"
    elevation="0"
  >
    <AnimatedRing
      :progress="progress"
      :size="216"
      :width="13"
    >
      <span class="hero__num">{{ remainingLabel }}</span>
      <span class="hero__unit">kcal restantes</span>
    </AnimatedRing>

    <div class="hero__caption">
      <b>{{ consumedLabel }}</b> / {{ targetLabel }} kcal mangées
    </div>

    <!-- Théorique (planifié) vs mangé, ramenés à l'échelle de la cible. -->
    <div class="hero__compare">
      <div
        class="hero__track"
        role="img"
        :aria-label="`Prévu ${caloriePlanned} kcal, mangé ${consumed} kcal sur une cible de ${target}`"
      >
        <span
          class="hero__track-fill hero__track-fill--planned"
          :style="{ width: `${plannedWidth}%` }"
        />
        <span
          class="hero__track-fill hero__track-fill--eaten"
          :style="{ width: `${eatenWidth}%` }"
        />
      </div>
      <div class="hero__legend">
        <span class="hero__legend-item hero__legend-item--planned">
          <i />Prévu <b>{{ caloriePlanned.toLocaleString('fr-FR') }}</b>
        </span>
        <span class="hero__legend-item hero__legend-item--eaten">
          <i />Mangé <b>{{ consumed.toLocaleString('fr-FR') }}</b>
        </span>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
const props = defineProps<{
  remaining: number
  consumed: number
  caloriePlanned: number
  target: number
  progress: number
  plannedProgress: number
}>()

const { formatted: remainingLabel } = useCountUp(() => props.remaining, { duration: 1400 })
const { formatted: consumedLabel } = useCountUp(() => props.consumed, { duration: 1400 })
const targetLabel = computed(() => props.target.toLocaleString('fr-FR'))

const eatenWidth = computed(() => Math.min(props.progress, 1) * 100)
const plannedWidth = computed(() => Math.min(props.plannedProgress, 1) * 100)
</script>

<style scoped lang="scss">
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1.25rem 1.5rem;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

  &__num {
    font-size: 3rem;
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  &__unit {
    font-size: 0.82rem;
    font-weight: 600;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-top: 0.5rem;
  }

  &__caption {
    margin-top: 1.15rem;
    font-size: 0.82rem;
    color: rgb(var(--v-theme-on-surface-variant));
    font-variant-numeric: tabular-nums;
    background: rgb(var(--v-theme-surface-variant));
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    padding: 0.45rem 0.9rem;
    border-radius: 999px;

    b {
      color: rgb(var(--v-theme-on-surface));
      font-weight: 700;
    }
  }

  &__compare {
    width: 100%;
    margin-top: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__track {
    position: relative;
    height: 8px;
    border-radius: 4px;
    background: rgba(var(--v-border-color), var(--v-border-opacity));
    overflow: hidden;
  }

  &__track-fill {
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    border-radius: 4px;
    transition: width 0.7s var(--app-ease);

    &--planned {
      background: rgba(var(--v-theme-primary), 0.28);
    }

    &--eaten {
      background: rgb(var(--v-theme-primary));
    }
  }

  &__legend {
    display: flex;
    justify-content: center;
    gap: 1.1rem;
    font-size: 0.78rem;
    color: rgb(var(--v-theme-on-surface-variant));
    font-variant-numeric: tabular-nums;
  }

  &__legend-item {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;

    i {
      width: 9px;
      height: 9px;
      border-radius: 3px;
    }

    b {
      color: rgb(var(--v-theme-on-surface));
      font-weight: 700;
    }

    &--planned i {
      background: rgba(var(--v-theme-primary), 0.28);
    }

    &--eaten i {
      background: rgb(var(--v-theme-primary));
    }
  }
}
</style>
