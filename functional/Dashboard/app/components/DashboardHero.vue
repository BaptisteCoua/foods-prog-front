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
      <b>{{ consumedLabel }}</b> / {{ targetLabel }} kcal consommées
    </div>
  </v-card>
</template>

<script setup lang="ts">
const props = defineProps<{
  remaining: number
  consumed: number
  target: number
  progress: number
}>()

const { formatted: remainingLabel } = useCountUp(() => props.remaining, { duration: 1400 })
const { formatted: consumedLabel } = useCountUp(() => props.consumed, { duration: 1400 })
const targetLabel = computed(() => props.target.toLocaleString('fr-FR'))
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
}
</style>
