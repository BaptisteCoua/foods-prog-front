<template>
  <div class="planning">
    <header class="planning__head">
      <h1 class="planning__title">
        Planning
      </h1>
      <div class="planning__week-nav">
        <v-btn
          icon="mdi-chevron-left"
          variant="text"
          size="small"
          aria-label="Semaine précédente"
          @click="board.prevWeek()"
        />
        <span class="planning__week-label">{{ weekLabel }}</span>
        <v-btn
          icon="mdi-chevron-right"
          variant="text"
          size="small"
          aria-label="Semaine suivante"
          @click="board.nextWeek()"
        />
      </div>
    </header>

    <PlanningWeekStrip
      :days="board.daySummaries.value"
      @select="board.selectDate"
    />

    <div class="planning__day-bar">
      <p class="planning__day-label">
        {{ formatLongDate(board.selectedDate.value) }}
      </p>
      <div class="planning__day-actions">
        <v-btn
          v-if="board.selectedDay.value.meals.length"
          variant="text"
          size="x-small"
          prepend-icon="mdi-content-copy"
          @click="board.openDuplicate()"
        >
          Dupliquer
        </v-btn>
        <v-btn
          v-if="!isToday"
          variant="text"
          size="x-small"
          prepend-icon="mdi-calendar-today"
          @click="board.goToToday()"
        >
          Aujourd'hui
        </v-btn>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="board.pending.value && !board.selectedDay.value.meals.length"
      class="planning__slots"
    >
      <v-skeleton-loader
        v-for="n in 4"
        :key="n"
        type="list-item-two-line"
        class="planning__skeleton"
      />
    </div>

    <!-- Error -->
    <v-card
      v-else-if="board.error.value"
      class="planning__state"
      elevation="0"
    >
      <v-icon
        icon="mdi-wifi-off"
        size="26"
        color="error"
      />
      <p>Impossible de charger ton planning.</p>
      <v-btn
        variant="tonal"
        prepend-icon="mdi-refresh"
        @click="board.refresh()"
      >
        Réessayer
      </v-btn>
    </v-card>

    <template v-else>
      <!-- Day summary vs target -->
      <v-card
        class="planning__summary"
        elevation="0"
      >
        <div class="planning__summary-main">
          <div class="planning__kcal">
            <span class="planning__kcal-value">{{ formatKcal(summary.calories) }}</span>
            <span
              v-if="summary.target"
              class="planning__kcal-target"
            >/ {{ formatKcal(summary.target) }}</span>
          </div>
          <span
            v-if="summary.remaining !== null"
            class="planning__remaining"
            :class="{ 'planning__remaining--over': summary.remaining < 0 }"
          >
            {{ summary.remaining >= 0
              ? `reste ${formatKcal(summary.remaining)}`
              : `dépassé de ${formatKcal(-summary.remaining)}` }}
          </span>
        </div>
        <div
          v-if="summary.target"
          class="planning__bar"
        >
          <span
            class="planning__bar-fill"
            :style="{ width: `${barWidth}%` }"
          />
        </div>
        <div class="planning__macros">
          <span class="planning__macro planning__macro--protein"><b>{{ formatMacro(summary.proteinG) }}</b> P</span>
          <span class="planning__macro planning__macro--carb"><b>{{ formatMacro(summary.carbG) }}</b> G</span>
          <span class="planning__macro planning__macro--fat"><b>{{ formatMacro(summary.fatG) }}</b> L</span>
        </div>
      </v-card>

      <!-- Slots -->
      <div class="planning__slots">
        <AppReveal
          v-for="(row, index) in board.slotRows.value"
          :key="row.meta.value"
          :delay="Math.min(index * 50, 200)"
        >
          <PlanningMealCard
            :row="row"
            @add="board.openPicker(row.meta.value)"
            @remove="(id) => row.meal && board.removeItem(row.meal, id)"
            @set-portions="(id, val) => row.meal && board.changePortions(row.meal, id, val)"
          />
        </AppReveal>
      </div>
    </template>

    <!-- Outils liés (courses, catalogue d'ingrédients, garde-manger). Placés
         APRÈS le planning pour que la page mène avec son contenu, pas avec des
         portes de sortie. [EXPERIMENT nav] — déplacés ici depuis le menu du bas. -->
    <section
      class="planning__tools"
      aria-label="Outils liés au planning"
    >
      <button
        type="button"
        class="planning__quick-tile"
        @click="shoppingOpen = true"
      >
        <span class="planning__quick-badge">
          <v-icon
            icon="mdi-cart-outline"
            size="24"
          />
        </span>
        <span class="planning__quick-text">
          <span class="planning__quick-label">Liste de courses</span>
          <span class="planning__quick-sub">Cette semaine</span>
        </span>
      </button>

      <button
        type="button"
        class="planning__quick-tile"
        @click="pantryOpen = true"
      >
        <span class="planning__quick-badge">
          <v-icon
            icon="mdi-fridge-outline"
            size="24"
          />
        </span>
        <span class="planning__quick-text">
          <span class="planning__quick-label">Garde-manger</span>
          <span class="planning__quick-sub">Mon stock</span>
        </span>
      </button>
    </section>

    <RecipePickerSheet
      v-model="board.pickerOpen.value"
      :slot-label="pickerLabel"
      :recents="board.recentRecipes.value"
      :busy="board.busy.value"
      @pick="board.pickRecipe"
    />

    <DayDuplicateSheet
      v-model="board.duplicateOpen.value"
      :source-date="board.selectedDate.value"
      :dates="board.dates.value"
      :busy="board.busy.value"
      @confirm="board.confirmDuplicate"
    />

    <!-- Courses + Garde-manger en popup depuis le Planning (cluster meal-prep). -->
    <AppSheet
      v-model="shoppingOpen"
      :max-width="640"
      full-height
      title="Liste de courses"
    >
      <ShoppingListPanel
        :key="shoppingSeed.from"
        :seed="shoppingSeed"
        padded
      />
    </AppSheet>

    <AppSheet
      v-model="pantryOpen"
      :max-width="640"
      full-height
      title="Garde-manger"
    >
      <PantryPanel padded />
    </AppSheet>
  </div>
</template>

<script setup lang="ts">
import { addDays, formatLongDate, parseISODate } from '../../utils/planningDate'
import { MEAL_SLOTS } from '../../utils/planningMeta'

useHead({ title: 'Planning' })

const board = usePlanningBoard()

// Courses + Garde-manger ouverts en popup depuis le Planning (cluster meal-prep).
// Ingrédients vit désormais dans l'espace Recettes (bibliothèque).
const shoppingOpen = ref(false)
const pantryOpen = ref(false)

// Pré-remplit la liste de courses sur la semaine actuellement affichée.
const shoppingSeed = computed(() => ({
  preset: 'week' as const,
  from: board.weekStart.value,
  to: addDays(board.weekStart.value, 6),
}))

const isToday = computed(() => board.selectedDate.value === board.today)

const weekLabel = computed(() =>
  new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })
    .format(parseISODate(board.weekStart.value)),
)

const pickerLabel = computed(() =>
  MEAL_SLOTS.find(slot => slot.value === board.pickerSlot.value)?.label ?? '',
)

// Day nutrition vs target, flattened for the summary card.
const summary = computed(() => {
  const day = board.selectedDay.value
  const target = day.target?.calories ?? null
  return {
    calories: day.total.calories,
    proteinG: day.total.proteinG,
    carbG: day.total.carbG,
    fatG: day.total.fatG,
    target,
    remaining: day.gap ? day.gap.calories : null,
  }
})

const barWidth = computed(() => {
  if (!summary.value.target) return 0
  return Math.min((summary.value.calories / summary.value.target) * 100, 100)
})
</script>

<style scoped lang="scss">
.planning {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.5rem 0.25rem 0;
  }

  &__title {
    font-size: 1.7rem;
    font-weight: 800;
    letter-spacing: -0.03em;
  }

  &__tools {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
    margin-top: 0.5rem;
  }

  &__quick-tile {
    // Les deux raccourcis partagent le même design (accent émeraude).
    --tile-accent: var(--v-theme-primary);

    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.8rem 0.85rem;
    border-radius: 16px;
    border: 1px solid rgba(var(--tile-accent), 0.3);
    background: rgba(var(--tile-accent), 0.08);
    color: rgb(var(--v-theme-on-surface));
    text-align: left;
    cursor: pointer;
    transition:
      transform 0.25s var(--app-ease),
      box-shadow 0.25s var(--app-ease);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(var(--tile-accent), 0.2);
    }

    &:active {
      transform: translateY(0);
    }
  }

  &__quick-badge {
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    color: rgb(var(--tile-accent));
    background: rgba(var(--tile-accent), 0.16);
  }

  &__quick-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1 1 auto;
  }

  &__quick-label {
    font-size: 0.92rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1.2;
  }

  &__quick-sub {
    font-size: 0.72rem;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  @media (prefers-reduced-motion: reduce) {
    .planning__quick-tile {
      transition: none;

      &:hover {
        transform: none;
      }
    }
  }

  &__week-nav {
    display: flex;
    align-items: center;
    gap: 0.15rem;
  }

  &__week-label {
    min-width: 6.5rem;
    text-align: center;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: capitalize;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__day-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0 0.25rem;
  }

  &__day-label {
    font-size: 1.02rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    text-transform: capitalize;
  }

  &__summary {
    padding: 0.9rem 1.1rem;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  &__summary-main {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem;
  }

  &__kcal {
    display: flex;
    align-items: baseline;
    gap: 0.35rem;
  }

  &__kcal-value {
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }

  &__kcal-target {
    font-size: 0.9rem;
    color: rgb(var(--v-theme-on-surface-variant));
    font-variant-numeric: tabular-nums;
  }

  &__remaining {
    font-size: 0.82rem;
    font-weight: 600;
    color: rgb(var(--v-theme-primary-text));

    &--over {
      color: rgb(var(--v-theme-error));
    }
  }

  &__bar {
    height: 6px;
    border-radius: 3px;
    background: rgba(var(--v-border-color), var(--v-border-opacity));
    overflow: hidden;
  }

  &__bar-fill {
    display: block;
    height: 100%;
    border-radius: 3px;
    background: rgb(var(--v-theme-primary));
    transition: width 0.6s var(--app-ease);
  }

  &__macros {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-size: 0.8rem;
    color: rgb(var(--v-theme-on-surface-variant));
    font-variant-numeric: tabular-nums;

    b {
      color: rgb(var(--v-theme-on-surface));
      font-weight: 700;
    }
  }

  &__macro--protein b { color: rgb(var(--v-theme-protein)); }
  &__macro--carb b { color: rgb(var(--v-theme-carb)); }
  &__macro--fat b { color: rgb(var(--v-theme-fat)); }

  &__day-actions {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  &__slots {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  &__skeleton {
    border-radius: 18px;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  }

  &__state {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.7rem;
    padding: 2.5rem 1.5rem;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    color: rgb(var(--v-theme-on-surface-variant));
  }
}
</style>
