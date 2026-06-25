<template>
  <div class="hero-mock">
    <v-card
      class="hero-mock__card"
      elevation="0"
    >
      <div class="hero-mock__head">
        <Transition
          name="hero-mock-fade"
          mode="out-in"
        >
          <span
            :key="current.day"
            class="hero-mock__date"
          >{{ current.day }}</span>
        </Transition>
        <span class="hero-mock__badge">
          <span class="hero-mock__badge-dot" />
          Cible atteinte à {{ progressLabel }}%
        </span>
      </div>

      <AnimatedRing
        :progress="progress"
        :size="200"
        :width="13"
      >
        <span class="hero-mock__num">{{ remainingLabel }}</span>
        <span class="hero-mock__unit">kcal restantes</span>
      </AnimatedRing>

      <div class="hero-mock__caption">
        <b>{{ consumedLabel }}</b> / {{ current.target.toLocaleString('fr-FR') }} kcal mangées
      </div>

      <div class="hero-mock__macros">
        <div
          v-for="macro in macroRows"
          :key="macro.key"
          class="hero-mock__macro"
        >
          <span class="hero-mock__macro-label">
            <span
              class="hero-mock__macro-dot"
              :style="{ background: `rgb(var(--v-theme-${macro.color}))` }"
            />
            {{ macro.label }}
          </span>
          <span class="hero-mock__macro-val">{{ macro.consumed }} / {{ macro.goal }} g</span>
          <span class="hero-mock__macro-bar">
            <span
              class="hero-mock__macro-fill"
              :style="{
                width: `${macro.width}%`,
                background: `rgb(var(--v-theme-${macro.color}))`,
              }"
            />
          </span>
        </div>
      </div>
    </v-card>

    <!-- Halo décoratif derrière la carte, ajoute de la profondeur premium. -->
    <span class="hero-mock__glow" />
  </div>
</template>

<script setup lang="ts">
// Maquette « vivante » du tableau de bord pour la landing : pas de données
// réelles, mais les vrais composants d'animation (anneau + count-up + barres).
// Les chiffres défilent en boucle sur plusieurs « journées » pour donner à voir,
// sans interaction, ce que produit l'app — la boucle se coupe sous reduced-motion.
interface DayScenario {
  day: string
  target: number
  consumed: number
  macros: {
    protein: [consumed: number, goal: number]
    carb: [consumed: number, goal: number]
    fat: [consumed: number, goal: number]
  }
}

const scenarios: DayScenario[] = [
  { day: 'Lundi', target: 2100, consumed: 1847, macros: { protein: [124, 150], carb: [210, 240], fat: [58, 70] } },
  { day: 'Mardi', target: 2300, consumed: 2210, macros: { protein: [152, 165], carb: [248, 260], fat: [66, 75] } },
  { day: 'Mercredi', target: 1950, consumed: 1540, macros: { protein: [98, 140], carb: [172, 225], fat: [45, 64] } },
  { day: 'Jeudi', target: 2200, consumed: 2080, macros: { protein: [138, 158], carb: [228, 250], fat: [61, 72] } },
]

const index = ref(0)
const current = computed(() => scenarios[index.value]!)

const progress = computed(() => current.value.consumed / current.value.target)
const remaining = computed(() => Math.max(0, current.value.target - current.value.consumed))

const { formatted: remainingLabel } = useCountUp(remaining, { duration: 1500 })
const { formatted: consumedLabel } = useCountUp(() => current.value.consumed, { duration: 1500 })
const { shown: shownProgress } = useAnimatedProgress(progress)
const progressLabel = computed(() => Math.round(shownProgress.value * 100))

const macroMeta = [
  { key: 'protein', label: 'Protéines', color: 'macro-protein' },
  { key: 'carb', label: 'Glucides', color: 'macro-carb' },
  { key: 'fat', label: 'Lipides', color: 'macro-fat' },
] as const

const macros = macroMeta.map((meta) => {
  const consumed = computed(() => current.value.macros[meta.key][0])
  const goal = computed(() => current.value.macros[meta.key][1])
  const { shown } = useAnimatedProgress(() => (goal.value > 0 ? consumed.value / goal.value : 0))
  return { meta, consumed, goal, shown }
})

// Vue ne déballe pas les refs imbriqués dans un tableau : on expose une vue
// « plate » recalculée à chaque tween pour garder le template propre.
const macroRows = computed(() =>
  macros.map(({ meta, consumed, goal, shown }) => ({
    key: meta.key,
    label: meta.label,
    color: meta.color,
    consumed: consumed.value,
    goal: goal.value,
    width: Math.min(1, shown.value) * 100,
  })),
)

// Avance d'une journée à l'autre, plus lentement que la plus longue animation
// (~1.5 s) pour laisser chaque valeur se poser avant la suivante.
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  if (prefersReducedMotion()) return
  timer = setInterval(() => {
    index.value = (index.value + 1) % scenarios.length
  }, 3400)
})

onBeforeUnmount(() => clearInterval(timer))
</script>

<style scoped lang="scss">
.hero-mock {
  position: relative;
  width: 100%;
  max-width: 340px;
  margin-inline: auto;

  &__card {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem 1.4rem 1.6rem;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    border-radius: 28px;
    background: rgb(var(--v-theme-surface));
    box-shadow: 0 24px 60px -28px rgba(var(--v-theme-primary), 0.45);
  }

  &__glow {
    position: absolute;
    inset: 12% -8% -14% -8%;
    z-index: 0;
    border-radius: 40px;
    background: radial-gradient(60% 60% at 50% 40%, rgba(var(--v-theme-primary), 0.35), transparent 70%);
    filter: blur(36px);
  }

  &__head {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    margin-bottom: 1.2rem;
  }

  &__date {
    display: inline-block;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.72rem;
    font-weight: 700;
    color: rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), 0.12);
    padding: 0.3rem 0.6rem;
    border-radius: 999px;
    font-variant-numeric: tabular-nums;
  }

  &__badge-dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: rgb(var(--v-theme-primary));
  }

  &__num {
    font-size: 2.7rem;
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  &__unit {
    font-size: 0.78rem;
    font-weight: 600;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-top: 0.4rem;
  }

  &__caption {
    margin-top: 1rem;
    font-size: 0.8rem;
    color: rgb(var(--v-theme-on-surface-variant));
    font-variant-numeric: tabular-nums;
    background: rgb(var(--v-theme-surface-variant));
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    padding: 0.4rem 0.85rem;
    border-radius: 999px;

    b {
      color: rgb(var(--v-theme-on-surface));
      font-weight: 700;
    }
  }

  &__macros {
    width: 100%;
    margin-top: 1.4rem;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  &__macro {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.35rem 0.75rem;
    align-items: baseline;
  }

  &__macro-label {
    font-size: 0.85rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__macro-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
  }

  &__macro-val {
    font-size: 0.78rem;
    color: rgb(var(--v-theme-on-surface-variant));
    font-variant-numeric: tabular-nums;
  }

  &__macro-bar {
    grid-column: 1 / -1;
    height: 6px;
    border-radius: 999px;
    background: rgba(var(--v-border-color), 0.1);
    overflow: hidden;
  }

  &__macro-fill {
    display: block;
    height: 100%;
    border-radius: 999px;
    transition: width 1.3s var(--app-ease);
  }
}

.hero-mock-fade-enter-active,
.hero-mock-fade-leave-active {
  transition: opacity 0.3s var(--app-ease), transform 0.3s var(--app-ease);
}

.hero-mock-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.hero-mock-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .hero-mock__macro-fill {
    transition: none;
  }

  .hero-mock-fade-enter-active,
  .hero-mock-fade-leave-active {
    transition: none;
  }
}
</style>
