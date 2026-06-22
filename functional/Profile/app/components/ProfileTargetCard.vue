<template>
  <v-card
    class="target"
    elevation="0"
  >
    <div class="target__head">
      <div class="target__heading">
        <span class="target__label">Cible quotidienne</span>
        <v-chip
          size="x-small"
          variant="tonal"
          :color="isCustom ? 'primary' : 'secondary'"
        >
          {{ isCustom ? 'Personnalisée' : 'Automatique' }}
        </v-chip>
      </div>
      <v-btn
        icon="mdi-pencil-outline"
        size="small"
        variant="text"
        aria-label="Modifier la cible"
        @click="emit('edit')"
      />
    </div>

    <div class="target__calories">
      <span class="target__cal-num">{{ calLabel }}</span>
      <span class="target__cal-unit">kcal / jour</span>
    </div>

    <div class="target__macros">
      <ProfileMacroRing
        v-for="macro in macros"
        :key="macro.key"
        :label="macro.label"
        :grams="macro.grams"
        :kcal="macro.kcal"
        :share="macro.share"
        :color="macro.color"
      />
    </div>

    <div
      v-if="proposalDiffers && proposal"
      class="target__proposal"
    >
      <span class="target__proposal-text">
        Selon ton profil : <b>{{ proposalCal }}</b> kcal · {{ proposalMacros }}
      </span>
      <v-btn
        size="small"
        variant="tonal"
        color="primary"
        :loading="saving"
        @click="emit('apply')"
      >
        Adopter
      </v-btn>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import type { NutritionProposal, NutritionTarget } from '../types/target'

const props = defineProps<{
  target: NutritionTarget
  proposal: NutritionProposal | null
  isCustom: boolean
  proposalDiffers: boolean
  saving: boolean
}>()

const emit = defineEmits<{ edit: [], apply: [] }>()

const KCAL_PER_GRAM = { protein: 4, carb: 4, fat: 9 } as const

const { formatted: calLabel } = useCountUp(() => props.target.calories, { duration: 1400 })

const macros = computed(() => {
  const proteinKcal = props.target.proteinG * KCAL_PER_GRAM.protein
  const carbKcal = props.target.carbG * KCAL_PER_GRAM.carb
  const fatKcal = props.target.fatG * KCAL_PER_GRAM.fat
  const total = proteinKcal + carbKcal + fatKcal
  const share = (kcal: number) => (total > 0 ? kcal / total : 0)

  return [
    { key: 'protein', label: 'Protéines', grams: Math.round(props.target.proteinG), kcal: proteinKcal, share: share(proteinKcal), color: 'macro-protein' },
    { key: 'carb', label: 'Glucides', grams: Math.round(props.target.carbG), kcal: carbKcal, share: share(carbKcal), color: 'macro-carb' },
    { key: 'fat', label: 'Lipides', grams: Math.round(props.target.fatG), kcal: fatKcal, share: share(fatKcal), color: 'macro-fat' },
  ]
})

const proposalCal = computed(() =>
  props.proposal ? Math.round(props.proposal.calories).toLocaleString('fr-FR') : '',
)

const proposalMacros = computed(() => {
  const p = props.proposal
  if (!p) return ''
  return `P ${Math.round(p.proteinG)}g · G ${Math.round(p.carbG)}g · L ${Math.round(p.fatG)}g`
})
</script>

<style scoped lang="scss">
.target {
  display: flex;
  flex-direction: column;
  padding: 1.25rem 1.25rem 1.4rem;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
  }

  &__heading {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  &__label {
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  &__calories {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0.75rem 0 1.25rem;
  }

  &__cal-num {
    font-size: 2.8rem;
    font-weight: 800;
    letter-spacing: -0.045em;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  &__cal-unit {
    font-size: 0.82rem;
    font-weight: 600;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-top: 0.45rem;
  }

  &__macros {
    display: flex;
    justify-content: space-around;
    gap: 0.5rem;
  }

  &__proposal {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-top: 1.3rem;
    padding: 0.7rem 0.9rem;
    border-radius: 14px;
    background: rgb(var(--v-theme-surface-variant));
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  }

  &__proposal-text {
    font-size: 0.8rem;
    color: rgb(var(--v-theme-on-surface-variant));
    font-variant-numeric: tabular-nums;

    b {
      color: rgb(var(--v-theme-on-surface));
      font-weight: 700;
    }
  }
}
</style>
