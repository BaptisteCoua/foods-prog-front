<template>
  <div class="detail">
    <button
      type="button"
      class="detail__back"
      @click="goBack"
    >
      <v-icon
        icon="mdi-chevron-left"
        size="20"
      />
      Avis &amp; suggestions
    </button>

    <!-- Loading -->
    <template v-if="pending">
      <v-skeleton-loader
        type="article"
        class="detail__skeleton"
      />
      <v-skeleton-loader
        type="paragraph"
        class="detail__skeleton"
      />
    </template>

    <!-- Error -->
    <v-card
      v-else-if="error || !feedback"
      class="detail__state"
      elevation="0"
    >
      <v-icon
        icon="mdi-alert-circle-outline"
        size="26"
        color="error"
      />
      <p>Cet avis est introuvable.</p>
      <v-btn
        variant="tonal"
        @click="goBack"
      >
        Retour
      </v-btn>
    </v-card>

    <template v-else>
      <section class="detail__main">
        <FeedbackVoteButton
          :count="feedback.votesCount"
          :active="feedback.hasVoted"
          @toggle="toggleVote"
        />
        <div class="detail__head">
          <div class="detail__chips">
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
          <h1 class="detail__title">
            {{ feedback.title }}
          </h1>
          <p class="detail__meta">
            {{ authorLabel }} · {{ date }}
          </p>
        </div>
      </section>

      <p class="detail__desc">
        {{ feedback.description }}
      </p>

      <div
        v-if="canEdit"
        class="detail__owner-actions"
      >
        <v-btn
          variant="tonal"
          size="small"
          prepend-icon="mdi-pencil-outline"
          @click="openEdit"
        >
          Modifier
        </v-btn>
        <v-btn
          variant="text"
          size="small"
          color="error"
          prepend-icon="mdi-delete-outline"
          @click="confirmOpen = true"
        >
          Supprimer
        </v-btn>
      </div>

      <FeedbackStatusControl
        v-if="canModerate"
        :model-value="feedback.status"
        :saving="savingStatus"
        @change="setStatus"
      />

      <section class="detail__replies">
        <h2 class="detail__replies-title">
          {{ feedback.replies.length }} réponse{{ feedback.replies.length > 1 ? 's' : '' }}
        </h2>

        <div class="detail__composer">
          <v-textarea
            v-model="replyBody"
            placeholder="Ajouter une réponse…"
            rows="2"
            auto-grow
            hide-details
            density="comfortable"
          />
          <v-btn
            color="primary"
            flat
            :loading="posting"
            :disabled="!replyBody.trim()"
            @click="onReply"
          >
            Répondre
          </v-btn>
        </div>

        <div class="detail__reply-list">
          <FeedbackReplyItem
            v-for="reply in feedback.replies"
            :key="reply.id"
            :reply
            :can-delete="canManageReply(reply.userId)"
            @vote="toggleReplyVote"
            @delete="removeReply"
          />
        </div>
      </section>
    </template>

    <FeedbackFormDialog
      ref="formDialog"
      @saved="refresh"
    />

    <AppSheet
      v-model="confirmOpen"
      :max-width="400"
      title="Supprimer l'avis ?"
    >
      <div class="detail__confirm">
        <header class="detail__confirm-title">
          Supprimer ?
        </header>
        <p class="detail__confirm-text">
          Cet avis et ses réponses seront définitivement supprimés.
        </p>
        <div class="detail__confirm-actions">
          <v-btn
            variant="text"
            @click="confirmOpen = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="error"
            flat
            @click="onDelete"
          >
            Supprimer
          </v-btn>
        </div>
      </div>
    </AppSheet>
  </div>
</template>

<script setup lang="ts">
import { FEEDBACK_STATUS_META, FEEDBACK_TYPE_META, authorName, formatFeedbackDate } from '../../utils/feedbackMeta'

const route = useRoute()
const feedbackId = computed(() => Number(route.params.id))

const formDialog = useTemplateRef('formDialog')
const confirmOpen = ref(false)
const replyBody = ref('')

const { userId, isAdmin, canModerate } = useCurrentUser()
const {
  feedback,
  pending,
  error,
  refresh,
  posting,
  savingStatus,
  toggleVote,
  toggleReplyVote,
  addReply,
  removeReply,
  setStatus,
  remove,
} = useFeedbackDetail(feedbackId)

useHead({ title: () => feedback.value?.title ?? 'Avis' })

const typeMeta = computed(() => FEEDBACK_TYPE_META[feedback.value?.type ?? 'IDEA'])
const statusMeta = computed(() => FEEDBACK_STATUS_META[feedback.value?.status ?? 'OPEN'])
const authorLabel = computed(() => authorName(feedback.value?.author.displayName ?? null))
const date = computed(() => (feedback.value ? formatFeedbackDate(feedback.value.createdAt) : ''))

const canEdit = computed(() =>
  Boolean(feedback.value) && (isAdmin.value || feedback.value?.userId === userId.value),
)

const canManageReply = (replyUserId: number) =>
  isAdmin.value || replyUserId === userId.value

const goBack = () => navigateTo('/feedback')
const openEdit = () => {
  if (feedback.value) formDialog.value?.openEdit(feedback.value)
}

const onReply = async () => {
  const ok = await addReply(replyBody.value.trim())
  if (ok) replyBody.value = ''
}

const onDelete = async () => {
  confirmOpen.value = false
  const ok = await remove()
  if (ok) await goBack()
}
</script>

<style scoped lang="scss">
.detail {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__back {
    display: inline-flex;
    align-items: center;
    gap: 0.15rem;
    align-self: flex-start;
    padding: 0.4rem 0.2rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__skeleton {
    border-radius: 18px;
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

  &__main {
    display: flex;
    align-items: flex-start;
    gap: 0.9rem;
  }

  &__head {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  &__title {
    font-size: 1.4rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.25;
  }

  &__meta {
    font-size: 0.8rem;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__desc {
    font-size: 0.95rem;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
  }

  &__owner-actions {
    display: flex;
    gap: 0.4rem;
  }

  &__replies {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  &__replies-title {
    font-size: 1rem;
    font-weight: 800;
    letter-spacing: -0.01em;
  }

  &__composer {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }

  &__reply-list {
    display: flex;
    flex-direction: column;
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
</style>
