<template>
  <v-card
    class="account"
    elevation="0"
  >
    <button
      type="button"
      class="account__row account__row--danger"
      @click="emit('logout')"
    >
      <v-icon
        icon="mdi-logout-variant"
        size="20"
      />
      <span class="account__label">Se déconnecter</span>
      <v-icon
        icon="mdi-chevron-right"
        size="20"
        class="account__chevron"
      />
    </button>
  </v-card>
</template>

<script setup lang="ts">
const emit = defineEmits<{ logout: [] }>()
</script>

<style scoped lang="scss">
.account {
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

  &__row {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    width: 100%;
    padding: 1rem 1.15rem;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: background 0.18s var(--app-ease);

    &:hover {
      background: rgba(var(--v-border-color), 0.06);
    }

    &--danger {
      color: rgb(var(--v-theme-error));
    }
  }

  &__label {
    flex: 1 1 auto;
    font-size: 0.95rem;
    font-weight: 600;
  }

  &__chevron {
    color: rgb(var(--v-theme-on-surface-variant));
  }
}
</style>
