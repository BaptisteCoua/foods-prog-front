<template>
  <button
    type="button"
    class="vote"
    :class="{ 'vote--active': active, 'vote--compact': compact }"
    :aria-pressed="active"
    :aria-label="active ? 'Retirer mon vote' : 'Voter'"
    @click.stop="emit('toggle')"
  >
    <v-icon
      icon="mdi-chevron-up"
      :size="compact ? 18 : 20"
    />
    <span class="vote__count">{{ count }}</span>
  </button>
</template>

<script setup lang="ts">
// Upvote pill (count + up chevron). Filled accent when the current user has
// voted. Presentational: emits `toggle`, the parent owns the API call.
withDefaults(defineProps<{
  count: number
  active: boolean
  compact?: boolean
}>(), {
  compact: false,
})

const emit = defineEmits<{ toggle: [] }>()
</script>

<style scoped lang="scss">
.vote {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.05rem;
  min-width: 3rem;
  padding: 0.45rem 0.35rem;
  border-radius: 14px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface-variant));
  font-weight: 700;
  line-height: 1;
  transition:
    color 0.18s var(--app-ease),
    border-color 0.18s var(--app-ease),
    background 0.18s var(--app-ease),
    transform 0.12s var(--app-ease);

  &:active {
    transform: scale(0.94);
  }

  &--compact {
    min-width: 2.4rem;
    padding: 0.3rem 0.3rem;
    flex-direction: row;
    gap: 0.2rem;
    border-radius: 999px;
  }

  &--active {
    color: rgb(var(--v-theme-primary-text));
    border-color: rgba(var(--v-theme-primary), 0.5);
    background: rgba(var(--v-theme-primary), 0.1);
  }

  &__count {
    font-size: 0.85rem;
  }
}
</style>
