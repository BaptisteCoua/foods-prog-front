<template>
  <div class="macro-ring">
    <AnimatedRing
      :progress="share"
      :size="92"
      :width="8"
      :color="color"
    >
      <span class="macro-ring__grams">{{ gramsLabel }}</span>
      <span class="macro-ring__sub">g</span>
    </AnimatedRing>
    <span class="macro-ring__label">{{ label }}</span>
    <span class="macro-ring__kcal">{{ kcalLabel }} kcal</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  grams: number
  kcal: number
  share: number // part des calories totales (0–1)
  color: string // clé de thème : macro-protein | macro-carb | macro-fat
}>()

const { formatted: gramsLabel } = useCountUp(() => props.grams, { duration: 1200 })
const kcalLabel = computed(() => Math.round(props.kcal).toLocaleString('fr-FR'))
</script>

<style scoped lang="scss">
.macro-ring {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;

  &__grams {
    font-size: 1.05rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  &__sub {
    font-size: 0.62rem;
    font-weight: 600;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-top: 0.1rem;
  }

  &__label {
    font-size: 0.82rem;
    font-weight: 600;
    margin-top: 0.2rem;
  }

  &__kcal {
    font-size: 0.72rem;
    color: rgb(var(--v-theme-on-surface-variant));
    font-variant-numeric: tabular-nums;
  }
}
</style>
