<template>
  <div class="fb-status">
    <span class="fb-status__label">
      <v-icon
        icon="mdi-shield-account-outline"
        size="15"
      />
      Statut (modération)
    </span>
    <div class="fb-status__chips">
      <v-chip
        v-for="status in FEEDBACK_STATUSES"
        :key="status"
        size="small"
        :variant="status === modelValue ? 'flat' : 'tonal'"
        :color="FEEDBACK_STATUS_META[status].color"
        :prepend-icon="FEEDBACK_STATUS_META[status].icon"
        :disabled="saving"
        class="fb-status__chip"
        @click="emit('change', status)"
      >
        {{ FEEDBACK_STATUS_META[status].label }}
      </v-chip>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FeedbackStatus } from '../types/feedback'
import { FEEDBACK_STATUSES, FEEDBACK_STATUS_META } from '../utils/feedbackMeta'

// Admin-only status moderation: a row of status chips, the active one filled.
defineProps<{
  modelValue: FeedbackStatus
  saving: boolean
}>()

const emit = defineEmits<{ change: [status: FeedbackStatus] }>()
</script>

<style scoped lang="scss">
.fb-status {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.85rem;
  border: 1px dashed rgba(var(--v-theme-primary), 0.4);
  border-radius: 16px;
  background: rgba(var(--v-theme-primary), 0.04);

  &__label {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.74rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  &__chip {
    cursor: pointer;
  }
}
</style>
