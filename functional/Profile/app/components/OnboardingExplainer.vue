<template>
  <div class="explainer">
    <button
      type="button"
      class="explainer__toggle"
      :class="{ 'explainer__toggle--open': open }"
      :aria-expanded="open"
      :aria-controls="panelId"
      @click="open = !open"
    >
      <v-icon
        icon="mdi-information-outline"
        size="18"
        class="explainer__toggle-icon"
      />
      <span class="explainer__toggle-label">{{ title }}</span>
      <v-icon
        icon="mdi-chevron-down"
        size="20"
        class="explainer__chevron"
      />
    </button>

    <v-expand-transition>
      <div
        v-show="open"
        :id="panelId"
        class="explainer__panel"
      >
        <slot />
      </div>
    </v-expand-transition>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
  }>(),
  { title: 'Comment c\'est calculé ?' },
)

const open = ref(false)
const panelId = useId()
</script>

<style scoped lang="scss">
.explainer {
  margin-top: 0.25rem;

  &__toggle {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    width: 100%;
    padding: 0.3rem 0;
    background: none;
    border: none;
    color: rgb(var(--v-theme-on-surface-variant));
    cursor: pointer;
    font: inherit;
    text-align: left;
    transition: color 0.18s var(--app-ease);

    &:hover,
    &--open {
      color: rgb(var(--v-theme-primary));
    }
  }

  &__toggle-icon {
    flex: none;
  }

  &__toggle-label {
    flex: 1;
    font-size: 0.85rem;
    font-weight: 600;
  }

  &__chevron {
    flex: none;
    transition: transform 0.25s var(--app-ease);
  }

  &__toggle--open &__chevron {
    transform: rotate(180deg);
  }

  &__panel {
    padding: 0.85rem 1rem;
    margin-top: 0.5rem;
    border-radius: 14px;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    background: rgba(var(--v-theme-primary), 0.05);
    font-size: 0.85rem;
    line-height: 1.5;
    color: rgb(var(--v-theme-on-surface-variant));

    :deep(p) {
      margin: 0;
    }

    :deep(p + p) {
      margin-top: 0.6rem;
    }

    :deep(strong) {
      color: rgb(var(--v-theme-on-surface));
      font-weight: 700;
    }

    :deep(.explainer__formula) {
      display: block;
      margin: 0.6rem 0;
      padding: 0.5rem 0.7rem;
      border-radius: 10px;
      background: rgb(var(--v-theme-surface));
      border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
      font-weight: 600;
      color: rgb(var(--v-theme-on-surface));
      letter-spacing: -0.01em;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .explainer__toggle,
  .explainer__chevron {
    transition: none;
  }
}
</style>
