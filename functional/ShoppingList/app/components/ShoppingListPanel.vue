<template>
  <div
    class="shopping"
    :class="{ 'shopping--padded': padded }"
  >
    <header class="shopping__head">
      <h1 class="shopping__title">
        Liste de courses
      </h1>
    </header>

    <ShoppingPeriodSelector
      v-model:preset="board.preset.value"
      v-model:custom-from="board.customFrom.value"
      v-model:custom-to="board.customTo.value"
      :label="board.label.value"
      @prev="board.prev()"
      @next="board.next()"
    />

    <!-- Loading -->
    <div
      v-if="board.pending.value && !board.lines.value.length"
      class="shopping__list"
    >
      <v-skeleton-loader
        v-for="n in 6"
        :key="n"
        type="list-item"
        class="shopping__skeleton"
      />
    </div>

    <!-- Error -->
    <v-card
      v-else-if="board.error.value"
      class="shopping__state"
      elevation="0"
    >
      <v-icon
        icon="mdi-wifi-off"
        size="26"
        color="error"
      />
      <p>Impossible de charger ta liste de courses.</p>
      <v-btn
        variant="tonal"
        prepend-icon="mdi-refresh"
        @click="board.refresh()"
      >
        Réessayer
      </v-btn>
    </v-card>

    <!-- Empty -->
    <v-card
      v-else-if="board.isEmpty.value"
      class="shopping__state"
      elevation="0"
    >
      <v-icon
        icon="mdi-cart-outline"
        size="26"
      />
      <p>Rien de planifié sur cette période.</p>
      <v-btn
        variant="tonal"
        prepend-icon="mdi-calendar-blank-outline"
        to="/planning"
      >
        Aller au planning
      </v-btn>
    </v-card>

    <template v-else>
      <!-- Cost summary -->
      <v-card
        class="shopping__summary"
        elevation="0"
      >
        <div class="shopping__summary-main">
          <div class="shopping__cost">
            <span class="shopping__cost-label">À acheter</span>
            <span class="shopping__cost-value">{{ formatTotalPrice(board.remainingCostCents.value) }}</span>
          </div>
          <span class="shopping__cost-total">
            sur {{ formatTotalPrice(board.totalCostCents.value) }}
          </span>
        </div>
        <p
          v-if="board.coveredCount.value"
          class="shopping__progress"
        >
          {{ board.coveredCount.value }} / {{ board.lines.value.length }} article{{ board.lines.value.length > 1 ? 's' : '' }} déjà en stock
        </p>
      </v-card>

      <!-- Lines: checked items sink to the bottom with a FLIP move animation. -->
      <TransitionGroup
        name="reorder"
        tag="div"
        class="shopping__list"
        appear
      >
        <ShoppingItemRow
          v-for="line in board.lines.value"
          :key="line.ingredientId"
          :line="line"
          :covered="board.isCovered(line)"
          :buying="board.isBuying(line.ingredientId)"
          @buy="board.buy(line)"
        />
      </TransitionGroup>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { PeriodSeed } from '../composables/useShoppingPeriod'
import { formatTotalPrice } from '../utils/shoppingFormat'

// Body of the shopping-list screen, reusable both as the standalone page and as a
// popup (see Planning). `seed` opens it on a given period; `padded` adds the inset
// the page layout normally provides but a bottom-sheet does not.
const props = defineProps<{
  seed?: PeriodSeed
  padded?: boolean
}>()

const board = useShoppingBoard(props.seed)
</script>

<style scoped lang="scss">
.shopping {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &--padded {
    padding: 0.25rem 1rem 1.5rem;
  }

  &__head {
    padding: 0.5rem 0.25rem 0;
  }

  &__title {
    font-size: 1.7rem;
    font-weight: 800;
    letter-spacing: -0.03em;
  }

  &__summary {
    padding: 0.9rem 1.1rem;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  &__summary-main {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem;
  }

  &__cost {
    display: flex;
    align-items: baseline;
    gap: 0.45rem;
  }

  &__cost-label {
    font-size: 0.85rem;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__cost-value {
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }

  &__cost-total {
    font-size: 0.85rem;
    color: rgb(var(--v-theme-on-surface-variant));
    font-variant-numeric: tabular-nums;
  }

  &__progress {
    font-size: 0.82rem;
    font-weight: 600;
    color: rgb(var(--v-theme-primary-text));
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__skeleton {
    border-radius: 14px;
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

// Reorder + initial reveal animations for the grocery lines. `-move` is the FLIP
// transition that slides an item to its new spot when it gets ticked.
.reorder-move,
.reorder-enter-active {
  transition: transform 0.42s var(--app-ease), opacity 0.42s var(--app-ease);
}

.reorder-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

@media (prefers-reduced-motion: reduce) {
  .reorder-move,
  .reorder-enter-active {
    transition: none;
  }
}
</style>
