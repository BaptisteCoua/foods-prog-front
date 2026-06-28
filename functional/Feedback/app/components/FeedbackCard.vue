<template>
  <article
    class="fb-card"
    @click="emit('open', feedback)"
  >
    <FeedbackVoteButton
      :count="feedback.votesCount"
      :active="feedback.hasVoted"
      @toggle="emit('vote', feedback)"
    />

    <div class="fb-card__body">
      <div class="fb-card__chips">
        <v-chip
          size="x-small"
          variant="tonal"
          :color="typeMeta.color"
          :prepend-icon="typeMeta.icon"
        >
          {{ typeMeta.label }}
        </v-chip>
        <v-chip
          size="x-small"
          variant="flat"
          :color="statusMeta.color"
          :prepend-icon="statusMeta.icon"
        >
          {{ statusMeta.label }}
        </v-chip>
      </div>

      <h3 class="fb-card__title">
        {{ feedback.title }}
      </h3>
      <p class="fb-card__desc">
        {{ feedback.description }}
      </p>

      <div class="fb-card__meta">
        <span>{{ authorLabel }}</span>
        <span class="fb-card__dot">·</span>
        <span class="fb-card__replies">
          <v-icon
            icon="mdi-comment-outline"
            size="14"
          />
          {{ feedback.repliesCount }}
        </span>
      </div>
    </div>

    <v-icon
      icon="mdi-chevron-right"
      class="fb-card__chevron"
    />
  </article>
</template>

<script setup lang="ts">
import type { Feedback } from '../types/feedback'
import { FEEDBACK_STATUS_META, FEEDBACK_TYPE_META, authorName } from '../utils/feedbackMeta'

const props = defineProps<{ feedback: Feedback }>()

const emit = defineEmits<{
  open: [feedback: Feedback]
  vote: [feedback: Feedback]
}>()

const typeMeta = computed(() => FEEDBACK_TYPE_META[props.feedback.type])
const statusMeta = computed(() => FEEDBACK_STATUS_META[props.feedback.status])
const authorLabel = computed(() => authorName(props.feedback.author.displayName))
</script>

<style scoped lang="scss">
.fb-card {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 0.95rem;
  border-radius: 18px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgb(var(--v-theme-surface));
  cursor: pointer;
  transition:
    border-color 0.18s var(--app-ease),
    transform 0.12s var(--app-ease);

  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.4);
  }

  &:active {
    transform: scale(0.995);
  }

  &__body {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  &__title {
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1.3;
  }

  &__desc {
    font-size: 0.85rem;
    color: rgb(var(--v-theme-on-surface-variant));
    line-height: 1.45;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.78rem;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__dot {
    opacity: 0.5;
  }

  &__replies {
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
  }

  &__chevron {
    align-self: center;
    color: rgba(var(--v-border-color), 0.8);
  }
}
</style>
