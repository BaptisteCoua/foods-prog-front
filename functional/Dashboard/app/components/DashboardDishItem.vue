<template>
  <!-- Planned recipe: the whole row toggles its "eaten" tick. -->
  <button
    v-if="!dish.logged"
    type="button"
    class="dish"
    :class="{ 'dish--eaten': dish.eaten }"
    :aria-pressed="dish.eaten"
    :aria-label="`${dish.name} — marquer comme mangé`"
    @click="emit('toggle', dish.id, !dish.eaten)"
  >
    <CheckToggle
      :model-value="dish.eaten"
      :interactive="false"
      class="dish__check"
    />
    <span class="dish__main">
      <span class="dish__name">{{ dish.name }}</span>
      <span class="dish__sub">{{ subtitle }}</span>
    </span>
    <span class="dish__kcal">{{ dish.kcal }} kcal</span>
  </button>

  <!-- Logged hors-plan line: already eaten by definition, removable. -->
  <div
    v-else
    class="dish dish--logged"
  >
    <span class="dish__marker">
      <v-icon
        icon="mdi-plus"
        size="16"
      />
    </span>
    <span class="dish__main">
      <span class="dish__name">{{ dish.name }}</span>
      <span class="dish__sub">
        {{ subtitle }}
        <span class="dish__badge">hors plan</span>
      </span>
    </span>
    <span class="dish__kcal">{{ dish.kcal }} kcal</span>
    <button
      type="button"
      class="dish__remove"
      :aria-label="`Retirer ${dish.name}`"
      @click="emit('remove', dish.id)"
    >
      <v-icon
        icon="mdi-close"
        size="16"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import type { DayDish } from '../composables/useDailySummary'

const props = defineProps<{ dish: DayDish }>()
const emit = defineEmits<{
  toggle: [number, boolean]
  remove: [number]
}>()

const subtitle = computed(() =>
  props.dish.detail ? `${props.dish.slotLabel} · ${props.dish.detail}` : props.dish.slotLabel,
)
</script>

<style scoped lang="scss">
.dish {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  width: 100%;
  padding: 0.55rem 0.6rem;
  border-radius: 14px;
  border: 1px solid transparent;
  background: transparent;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background 0.3s var(--app-ease, ease),
    border-color 0.3s var(--app-ease, ease),
    transform 0.12s var(--app-ease, ease);

  & + & {
    margin-top: 0.2rem;
  }

  &:hover:not(.dish--eaten):not(.dish--logged) {
    background: rgba(var(--v-theme-on-surface), 0.04);
  }

  &:active {
    transform: scale(0.99);
  }

  &:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
  }

  &--eaten {
    background: rgba(var(--v-theme-primary), 0.07);
    border-color: rgba(var(--v-theme-primary), 0.18);
  }

  &--eaten:hover {
    background: rgba(var(--v-theme-primary), 0.1);
  }

  // Logged hors-plan rows are not a toggle — leave the row static.
  &--logged {
    cursor: default;
    background: rgba(var(--v-theme-primary), 0.07);
    border-color: rgba(var(--v-theme-primary), 0.18);

    &:active {
      transform: none;
    }
  }

  &__check {
    flex: 0 0 auto;
  }

  &__marker {
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary));
    box-shadow: 0 3px 10px rgba(var(--v-theme-primary), 0.4);
  }

  &__main {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__name {
    font-weight: 600;
    font-size: 0.92rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__sub {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.76rem;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-top: 0.1rem;
  }

  &__badge {
    font-size: 0.6rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: rgb(var(--v-theme-primary-text));
    background: rgba(var(--v-theme-primary), 0.12);
    border-radius: 999px;
    padding: 0.08rem 0.4rem;
  }

  &__kcal {
    font-size: 0.82rem;
    font-weight: 700;
    color: rgb(var(--v-theme-on-surface-variant));
    font-variant-numeric: tabular-nums;
    flex: none;
  }

  &__remove {
    flex: none;
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border-radius: 9px;
    border: none;
    background: transparent;
    color: rgb(var(--v-theme-on-surface-variant));
    cursor: pointer;
    transition: background 0.2s var(--app-ease), color 0.2s var(--app-ease);

    &:hover {
      background: rgba(var(--v-theme-error), 0.12);
      color: rgb(var(--v-theme-error));
    }

    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-error));
      outline-offset: 2px;
    }
  }

  &--eaten &__name {
    color: rgb(var(--v-theme-on-surface-variant));
    text-decoration: line-through;
    text-decoration-color: rgba(var(--v-theme-on-surface-variant), 0.45);
  }

  &--eaten &__kcal {
    color: rgb(var(--v-theme-primary-text));
  }

  &--logged &__kcal {
    color: rgb(var(--v-theme-primary-text));
  }
}

@media (prefers-reduced-motion: reduce) {
  .dish {
    transition: none;
  }
}
</style>
