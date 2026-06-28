<template>
  <v-card
    class="fb-entry"
    elevation="0"
    role="link"
    @click="goToBoard"
  >
    <span class="fb-entry__icon">
      <v-icon
        icon="mdi-message-text-outline"
        size="22"
      />
    </span>
    <div class="fb-entry__body">
      <h3 class="fb-entry__title">
        Avis &amp; suggestions
      </h3>
      <p class="fb-entry__text">
        Proposez une idée, votez et suivez ce qui est en cours.
      </p>
    </div>
    <v-icon
      icon="mdi-chevron-right"
      class="fb-entry__chevron"
    />
  </v-card>
</template>

<script setup lang="ts">
// Entry point to the feedback board, surfaced on the profile page.
const goToBoard = () => navigateTo('/feedback')
</script>

<style scoped lang="scss">
.fb-entry {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem;
  border-radius: 18px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  cursor: pointer;
  transition: border-color 0.18s var(--app-ease);

  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.4);
  }

  &__icon {
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    width: 44px;
    height: 44px;
    border-radius: 14px;
    color: rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), 0.12);
  }

  &__body {
    flex: 1 1 auto;
    min-width: 0;
  }

  &__title {
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  &__text {
    font-size: 0.83rem;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-top: 0.1rem;
  }

  &__chevron {
    color: rgba(var(--v-border-color), 0.8);
  }
}
</style>
