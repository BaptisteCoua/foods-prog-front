<template>
  <button
    type="button"
    class="recipe-save"
    :class="{
      'recipe-save--on': saved,
      'recipe-save--readonly': readonly,
    }"
    :disabled="loading || readonly"
    :aria-pressed="readonly ? undefined : saved"
    :aria-label="ariaLabel"
    @click.stop="onClick"
  >
    <v-progress-circular
      v-if="loading"
      indeterminate
      size="15"
      width="2"
    />
    <v-icon
      v-else
      :icon="saved ? 'mdi-bookmark' : 'mdi-bookmark-outline'"
      :size="size"
    />
    <span class="recipe-save__count">{{ count }}</span>
    <v-tooltip
      activator="parent"
      location="bottom"
    >
      {{ tooltipText }}
    </v-tooltip>
  </button>
</template>

<script setup lang="ts">
// Pastille « enregistrer » : indicateur de popularité (nb d'enregistrements) ET
// bouton toggle d'un seul tenant. Présentationnel : le parent décide quoi faire
// au @toggle (clone / unclone) et gère la MAJ optimiste du compteur.
const props = withDefaults(
  defineProps<{
    count: number
    saved?: boolean
    readonly?: boolean
    loading?: boolean
    size?: number | string
  }>(),
  { saved: false, readonly: false, loading: false, size: 16 },
)

const emit = defineEmits<{ toggle: [] }>()

const tooltipText = computed(() =>
  props.readonly
    ? formatSaves(props.count)
    : props.saved
      ? 'Retirer de mes recettes'
      : 'Enregistrer dans mes recettes',
)

const ariaLabel = computed(() =>
  props.readonly ? formatSaves(props.count) : tooltipText.value)

const onClick = () => {
  if (props.readonly || props.loading) return
  emit('toggle')
}
</script>

<style scoped lang="scss">
.recipe-save {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.28rem 0.62rem;
  border-radius: 999px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: transparent;
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: rgb(var(--v-theme-on-surface-variant));
  transition:
    color 0.18s var(--app-ease),
    background 0.18s var(--app-ease),
    border-color 0.18s var(--app-ease),
    transform 0.12s var(--app-ease);

  &:hover:not(:disabled) {
    border-color: rgba(var(--v-theme-primary), 0.5);
    color: rgb(var(--v-theme-primary-text));
  }

  // Petit « pop » tactile au clic : renforce le retour visuel de l'incrément.
  &:active:not(:disabled) {
    transform: scale(0.93);
  }

  // Enregistrée : pastille émeraude pleine, signet rempli.
  &--on {
    color: rgb(var(--v-theme-primary-text));
    border-color: transparent;
    background: rgba(var(--v-theme-primary), 0.14);

    &:hover:not(:disabled) {
      background: rgba(var(--v-theme-primary), 0.2);
    }
  }

  // Lecture seule (ma propre recette) : indicateur calme, non cliquable.
  &--readonly {
    cursor: default;
    border-color: transparent;
    background: rgba(var(--v-border-color), 0.1);
  }

  &__count {
    min-width: 0.6ch;
    text-align: center;
  }
}
</style>
