<template>
  <div
    class="pantry"
    :class="{ 'pantry--padded': padded }"
  >
    <header class="pantry__head">
      <div>
        <h1 class="pantry__title">
          Garde-manger
        </h1>
        <p class="pantry__count">
          {{ countLabel }}
        </p>
      </div>
      <v-btn
        color="primary"
        :icon="mobile"
        :variant="mobile ? 'text' : 'flat'"
        :density="mobile ? 'comfortable' : 'default'"
        :prepend-icon="mobile ? undefined : 'mdi-plus'"
        :aria-label="mobile ? 'Ajouter' : undefined"
        @click="board.openAdd()"
      >
        <v-icon
          v-if="mobile"
          icon="mdi-plus"
        />
        <template v-else>
          Ajouter
        </template>
      </v-btn>
    </header>

    <!-- Loading -->
    <div
      v-if="board.pending.value && !board.sortedLines.value.length"
      class="pantry__list"
    >
      <v-skeleton-loader
        v-for="n in 5"
        :key="n"
        type="list-item"
        class="pantry__skeleton"
      />
    </div>

    <!-- Error -->
    <v-card
      v-else-if="board.error.value"
      class="pantry__state"
      elevation="0"
    >
      <v-icon
        icon="mdi-wifi-off"
        size="26"
        color="error"
      />
      <p>Impossible de charger ton garde-manger.</p>
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
      class="pantry__state"
      elevation="0"
    >
      <span class="pantry__state-icon">
        <v-icon
          icon="mdi-fridge-outline"
          size="26"
        />
      </span>
      <p>Ton garde-manger est vide.</p>
      <v-btn
        color="primary"
        flat
        prepend-icon="mdi-plus"
        @click="board.openAdd()"
      >
        Ajouter un produit
      </v-btn>
    </v-card>

    <!-- List: newly ticked items animate to their sorted spot. -->
    <TransitionGroup
      v-else
      name="reorder"
      tag="div"
      class="pantry__list"
      appear
    >
      <PantryItemRow
        v-for="line in board.sortedLines.value"
        :key="line.id"
        :line="line"
        @edit="board.openEdit(line)"
        @remove="board.askDelete(line)"
      />
    </TransitionGroup>

    <PantryItemSheet
      v-model="board.sheetOpen.value"
      :editing="board.editingLine.value"
      :is-saving="board.isSaving.value"
      @save="board.save"
    />

    <AppSheet
      :model-value="board.confirmTarget.value !== null"
      :max-width="400"
      title="Retirer du garde-manger ?"
      @update:model-value="board.cancelDelete()"
    >
      <div class="pantry__confirm">
        <header class="pantry__confirm-title">
          Retirer ?
        </header>
        <p class="pantry__confirm-text">
          Retirer « {{ board.confirmTarget.value?.name }} » de ton garde-manger ?
        </p>
        <div class="pantry__confirm-actions">
          <v-btn
            variant="text"
            @click="board.cancelDelete()"
          >
            Annuler
          </v-btn>
          <v-btn
            color="error"
            flat
            :loading="board.isDeleting.value"
            @click="board.confirmDelete()"
          >
            Retirer
          </v-btn>
        </div>
      </div>
    </AppSheet>
  </div>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'

// Body of the Garde-manger screen, reusable both as the standalone page and as a
// popup (see Planning). `padded` adds the inset the page layout normally provides
// but a bottom-sheet does not.
defineProps<{ padded?: boolean }>()

// `mobile` collapses the "Ajouter" button to an icon-only round button so the
// header never overflows on narrow viewports.
const { mobile } = useDisplay()

const board = usePantryBoard()

const countLabel = computed(() => {
  const count = board.sortedLines.value.length
  return `${count} produit${count > 1 ? 's' : ''} en stock`
})
</script>

<style scoped lang="scss">
.pantry {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &--padded {
    padding: 0.25rem 1rem 1.5rem;
  }

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.5rem 0.25rem 0;
  }

  &__title {
    font-size: 1.7rem;
    font-weight: 800;
    letter-spacing: -0.03em;
  }

  &__count {
    font-size: 0.82rem;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-top: 0.2rem;
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

  &__state-icon {
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    border-radius: 16px;
    color: rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), 0.12);
  }

  &__confirm-title {
    padding: 0.25rem 1.25rem 0.5rem;
    font-size: 1.2rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  &__confirm-text {
    padding: 0 1.25rem;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__confirm-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 1rem 1.25rem 1.4rem;
  }
}

// Reorder + reveal animation for the stock lines (mirrors the shopping list).
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
