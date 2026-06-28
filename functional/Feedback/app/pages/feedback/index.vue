<template>
  <div class="board">
    <header class="board__head">
      <div>
        <h1 class="board__title">
          Avis &amp; suggestions
        </h1>
        <p class="board__count">
          {{ total }} avis · votez pour faire remonter vos préférés
        </p>
      </div>
      <v-btn
        color="primary"
        flat
        prepend-icon="mdi-plus"
        @click="openCreate"
      >
        Proposer
      </v-btn>
    </header>

    <div
      class="board__segments"
      role="tablist"
    >
      <button
        v-for="option in sortOptions"
        :key="option.value"
        type="button"
        role="tab"
        :aria-selected="sort === option.value"
        class="board__segment"
        :class="{ 'board__segment--active': sort === option.value }"
        @click="sort = option.value"
      >
        {{ option.label }}
      </button>
    </div>

    <div class="board__filters">
      <v-chip
        :variant="typeFilter === null ? 'flat' : 'tonal'"
        :color="typeFilter === null ? 'primary' : undefined"
        size="small"
        @click="typeFilter = null"
      >
        Tous types
      </v-chip>
      <v-chip
        v-for="type in FEEDBACK_TYPES"
        :key="type"
        size="small"
        :variant="typeFilter === type ? 'flat' : 'tonal'"
        :color="FEEDBACK_TYPE_META[type].color"
        :prepend-icon="FEEDBACK_TYPE_META[type].icon"
        @click="typeFilter = typeFilter === type ? null : type"
      >
        {{ FEEDBACK_TYPE_META[type].label }}
      </v-chip>
    </div>

    <div class="board__filters">
      <v-chip
        :variant="statusFilter === null ? 'flat' : 'tonal'"
        :color="statusFilter === null ? 'primary' : undefined"
        size="small"
        @click="statusFilter = null"
      >
        Tous statuts
      </v-chip>
      <v-chip
        v-for="status in FEEDBACK_STATUSES"
        :key="status"
        size="small"
        :variant="statusFilter === status ? 'flat' : 'tonal'"
        :color="FEEDBACK_STATUS_META[status].color"
        :prepend-icon="FEEDBACK_STATUS_META[status].icon"
        @click="statusFilter = statusFilter === status ? null : status"
      >
        {{ FEEDBACK_STATUS_META[status].label }}
      </v-chip>
    </div>

    <!-- Loading -->
    <div
      v-if="pending"
      class="board__list"
    >
      <v-skeleton-loader
        v-for="n in 4"
        :key="n"
        type="article"
        class="board__skeleton"
      />
    </div>

    <!-- Error -->
    <v-card
      v-else-if="error"
      class="board__state"
      elevation="0"
    >
      <v-icon
        icon="mdi-wifi-off"
        size="26"
        color="error"
      />
      <p>Impossible de charger les avis.</p>
      <v-btn
        variant="tonal"
        prepend-icon="mdi-refresh"
        @click="refresh"
      >
        Réessayer
      </v-btn>
    </v-card>

    <!-- Empty -->
    <v-card
      v-else-if="!items.length"
      class="board__state"
      elevation="0"
    >
      <span class="board__state-icon">
        <v-icon
          icon="mdi-message-text-outline"
          size="26"
        />
      </span>
      <p>{{ hasActiveFilter ? 'Aucun avis ne correspond aux filtres.' : 'Aucun avis pour l\'instant. Lancez la discussion !' }}</p>
      <v-btn
        v-if="!hasActiveFilter"
        color="primary"
        flat
        prepend-icon="mdi-plus"
        @click="openCreate"
      >
        Proposer une idée
      </v-btn>
    </v-card>

    <!-- List -->
    <div
      v-else
      class="board__list"
    >
      <AppReveal
        v-for="(feedback, index) in items"
        :key="feedback.id"
        :delay="Math.min(index * 40, 240)"
      >
        <FeedbackCard
          :feedback
          @open="goToFeedback"
          @vote="toggleVote"
        />
      </AppReveal>
    </div>

    <FeedbackFormDialog
      ref="formDialog"
      @saved="goToFeedback"
    />
  </div>
</template>

<script setup lang="ts">
import type { Feedback, FeedbackSort } from '../../types/feedback'
import {
  FEEDBACK_STATUSES,
  FEEDBACK_STATUS_META,
  FEEDBACK_TYPES,
  FEEDBACK_TYPE_META,
} from '../../utils/feedbackMeta'

useHead({ title: 'Avis & suggestions' })

const formDialog = useTemplateRef('formDialog')

const {
  items,
  total,
  pending,
  error,
  refresh,
  statusFilter,
  typeFilter,
  sort,
  hasActiveFilter,
  toggleVote,
} = useFeedbackBoard()

const sortOptions: { value: FeedbackSort, label: string }[] = [
  { value: 'VOTES', label: 'Populaires' },
  { value: 'RECENT', label: 'Récents' },
]

const openCreate = () => formDialog.value?.openCreate()
const goToFeedback = (feedback: Feedback) => navigateTo(`/feedback/${feedback.id}`)
</script>

<style scoped lang="scss">
.board {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;

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

  &__segments {
    display: inline-flex;
    align-self: flex-start;
    gap: 0.2rem;
    padding: 0.2rem;
    border-radius: 999px;
    background: rgba(var(--v-border-color), 0.1);
  }

  &__segment {
    padding: 0.4rem 1rem;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: rgb(var(--v-theme-on-surface-variant));
    transition: color 0.2s var(--app-ease), background 0.2s var(--app-ease);

    &--active {
      color: rgb(var(--v-theme-on-surface));
      background: rgb(var(--v-theme-surface));
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  }

  &__filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin-top: 0.25rem;
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

  &__state-icon {
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    border-radius: 16px;
    color: rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), 0.12);
  }
}
</style>
