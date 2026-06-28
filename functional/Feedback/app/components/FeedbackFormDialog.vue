<template>
  <AppSheet
    v-model="dialogOpen"
    :max-width="560"
  >
    <div class="fb-dialog">
      <header class="fb-dialog__title">
        {{ title }}
      </header>

      <div class="fb-dialog__content">
        <v-form
          ref="formRef"
          class="fb-dialog__form"
          @submit.prevent="onSubmit"
        >
          <div class="fb-dialog__types">
            <button
              v-for="type in FEEDBACK_TYPES"
              :key="type"
              type="button"
              class="fb-dialog__type"
              :class="{ 'fb-dialog__type--active': form.type === type }"
              :style="form.type === type ? { borderColor: meta(type).color, color: meta(type).color } : undefined"
              @click="form.type = type"
            >
              <v-icon
                :icon="meta(type).icon"
                size="18"
              />
              {{ meta(type).label }}
            </button>
          </div>

          <v-text-field
            v-model="form.title"
            label="Titre"
            placeholder="Résume ton avis en une phrase"
            prepend-inner-icon="mdi-format-title"
            counter="140"
            maxlength="140"
            :rules="[rules.required]"
          />

          <v-textarea
            v-model="form.description"
            label="Description"
            placeholder="Décris le besoin, le contexte, l'intérêt…"
            prepend-inner-icon="mdi-text"
            rows="4"
            auto-grow
            :rules="[rules.required]"
          />
        </v-form>
      </div>

      <div class="fb-dialog__actions">
        <v-btn
          variant="text"
          @click="close"
        >
          Annuler
        </v-btn>
        <v-btn
          color="primary"
          flat
          :loading="isSaving"
          @click="onSubmit"
        >
          Publier
        </v-btn>
      </div>
    </div>
  </AppSheet>
</template>

<script setup lang="ts">
import type { Feedback, FeedbackType } from '../types/feedback'
import { FEEDBACK_TYPES, FEEDBACK_TYPE_META } from '../utils/feedbackMeta'

const emit = defineEmits<{ saved: [Feedback] }>()

const {
  dialogOpen,
  isSaving,
  formRef,
  form,
  title,
  rules,
  openCreate,
  openEdit,
  close,
  submit,
} = useFeedbackForm()

const meta = (type: FeedbackType) => FEEDBACK_TYPE_META[type]

const onSubmit = async () => {
  const feedback = await submit()
  if (feedback) emit('saved', feedback)
}

defineExpose({ openCreate, openEdit })
</script>

<style scoped lang="scss">
.fb-dialog {
  &__title {
    padding: 0.25rem 1.25rem 0.75rem;
    font-size: 1.2rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  &__content {
    padding: 0 1.25rem;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-top: 0.5rem;
  }

  &__types {
    display: flex;
    gap: 0.4rem;
  }

  &__type {
    flex: 1 1 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    padding: 0.55rem 0.4rem;
    border-radius: 14px;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface-variant));
    font-size: 0.85rem;
    font-weight: 600;
    transition:
      color 0.18s var(--app-ease),
      border-color 0.18s var(--app-ease);

    &--active {
      font-weight: 700;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 1rem 1.25rem 1.4rem;
  }
}
</style>
