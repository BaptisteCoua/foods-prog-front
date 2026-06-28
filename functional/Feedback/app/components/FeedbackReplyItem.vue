<template>
  <article class="fb-reply">
    <div class="fb-reply__main">
      <header class="fb-reply__head">
        <span class="fb-reply__author">{{ authorLabel }}</span>
        <span class="fb-reply__dot">·</span>
        <time class="fb-reply__date">{{ date }}</time>
      </header>
      <p class="fb-reply__body">
        {{ reply.body }}
      </p>
      <div
        v-if="canDelete"
        class="fb-reply__actions"
      >
        <v-btn
          variant="text"
          size="x-small"
          color="error"
          prepend-icon="mdi-delete-outline"
          @click="emit('delete', reply.id)"
        >
          Supprimer
        </v-btn>
      </div>
    </div>

    <FeedbackVoteButton
      compact
      :count="reply.votesCount"
      :active="reply.hasVoted"
      @toggle="emit('vote', reply.id, reply.hasVoted)"
    />
  </article>
</template>

<script setup lang="ts">
import type { FeedbackReply } from '../types/feedback'
import { authorName, formatFeedbackDate } from '../utils/feedbackMeta'

const props = defineProps<{
  reply: FeedbackReply
  canDelete: boolean
}>()

const emit = defineEmits<{
  vote: [replyId: number, hasVoted: boolean]
  delete: [replyId: number]
}>()

const authorLabel = computed(() => authorName(props.reply.author.displayName))
const date = computed(() => formatFeedbackDate(props.reply.createdAt))
</script>

<style scoped lang="scss">
.fb-reply {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.85rem 0;
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

  &__main {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.78rem;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__author {
    font-weight: 700;
    color: rgb(var(--v-theme-on-surface));
  }

  &__dot {
    opacity: 0.5;
  }

  &__body {
    font-size: 0.9rem;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }

  &__actions {
    display: flex;
    justify-content: flex-start;
  }
}
</style>
