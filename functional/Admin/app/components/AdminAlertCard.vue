<template>
  <li
    class="alert"
    :class="{ 'alert--unread': !alert.isRead, 'alert--removing': removing }"
  >
    <!-- Fond destructif révélé par le swipe vers la gauche. -->
    <div
      class="alert__backdrop"
      :class="{ 'alert__backdrop--armed': willDelete }"
    >
      <v-icon
        icon="mdi-trash-can-outline"
        size="22"
      />
    </div>

    <div
      class="alert__row"
      :style="rowStyle"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerCancel"
      @transitionend="onTransitionEnd"
      @click="onRowClick"
    >
      <span
        class="alert__icon"
        :style="iconStyle"
      >
        <v-icon
          :icon="typeMeta.icon"
          size="20"
        />
      </span>

      <div class="alert__body">
        <p class="alert__title">
          {{ alert.title }}
        </p>
        <p class="alert__meta">
          <span
            class="alert__type"
            :style="{ color: typeMeta.color }"
          >{{ typeMeta.label }}</span>
          <span class="alert__sep">·</span>
          {{ authorLabel }}
          <span class="alert__sep">·</span>
          {{ time }}
        </p>
      </div>

      <button
        v-if="!alert.isRead"
        type="button"
        class="alert__mark"
        aria-label="Marquer comme lu"
        @click.stop="emit('read', alert)"
      >
        <v-icon
          icon="mdi-check"
          size="18"
        />
      </button>
      <v-icon
        v-else
        icon="mdi-chevron-right"
        size="20"
        class="alert__chevron"
      />
    </div>
  </li>
</template>

<script setup lang="ts">
import type { AdminAlert } from '../types/admin-alert'
import { FEEDBACK_TYPE_META, authorName } from '../../../Feedback/app/utils/feedbackMeta'
import { formatAlertTime } from '../utils/alertMeta'

const props = defineProps<{ alert: AdminAlert }>()

const emit = defineEmits<{
  open: [alert: AdminAlert]
  read: [alert: AdminAlert]
  delete: [alert: AdminAlert]
}>()

const {
  removing,
  willDelete,
  suppressClick,
  rowStyle,
  onTransitionEnd,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
} = useSwipeToDelete({ onDelete: () => emit('delete', props.alert) })

const typeMeta = computed(() => FEEDBACK_TYPE_META[props.alert.feedbackType])
const authorLabel = computed(() => authorName(props.alert.authorName))
const time = computed(() => formatAlertTime(props.alert.createdAt))

// Tinted square behind the type icon — `1f` ≈ 12 % alpha over the opaque row.
const iconStyle = computed(() => ({
  color: typeMeta.value.color,
  background: `${typeMeta.value.color}1f`,
}))

// Tap opens the alert, but only when it wasn't a swipe (the trailing click of a
// drag is suppressed by the gesture composable).
const onRowClick = () => {
  if (suppressClick.value) return
  emit('open', props.alert)
}
</script>

<style scoped lang="scss">
.alert {
  position: relative;
  list-style: none;
  border-radius: 16px;
  // Le fond destructif ne déborde pas des coins arrondis.
  overflow: hidden;

  &__backdrop {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 1.25rem;
    background: rgb(var(--v-theme-error));
    color: #fff;
  }

  &__backdrop :deep(.v-icon) {
    transition: transform 0.18s var(--app-ease);
  }

  &__backdrop--armed :deep(.v-icon) {
    transform: scale(1.2);
  }

  &__row {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.85rem 0.7rem 0.85rem 0.95rem;
    border-radius: 16px;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    // Fond OPAQUE : masque le fond destructif tant que la carte n'est pas glissée.
    background: rgb(var(--v-theme-surface));
    cursor: pointer;
    // Laisse le scroll vertical au navigateur, capte les pans horizontaux.
    touch-action: pan-y;
    user-select: none;
  }

  &__icon {
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    width: 40px;
    height: 40px;
    border-radius: 12px;
  }

  &__body {
    flex: 1 1 auto;
    min-width: 0;
  }

  &__title {
    font-size: 0.92rem;
    font-weight: 600;
    line-height: 1.3;
    color: rgb(var(--v-theme-on-surface));
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    margin-top: 0.15rem;
    font-size: 0.76rem;
    color: rgb(var(--v-theme-on-surface-variant));
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__type {
    font-weight: 600;
  }

  &__sep {
    opacity: 0.45;
  }

  // Bouton « marquer comme lu » — pastille discrète, surlignée au survol.
  &__mark {
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    width: 32px;
    height: 32px;
    border-radius: 999px;
    color: rgb(var(--v-theme-on-surface-variant));
    transition: background 0.18s var(--app-ease), color 0.18s var(--app-ease);

    &:hover {
      background: rgba(var(--v-theme-primary), 0.12);
      color: rgb(var(--v-theme-primary));
    }
  }

  &__chevron {
    flex: 0 0 auto;
    color: rgba(var(--v-border-color), 0.8);
  }

  // Une alerte non lue : fond teinté OPAQUE (dégradé posé sur la surface) + une
  // barre d'accent à gauche + un titre plus fort. Aucun fond translucide, donc
  // le fond destructif reste caché tant qu'on ne glisse pas la carte.
  &--unread &__row {
    background:
      linear-gradient(
        rgba(var(--v-theme-primary), 0.07),
        rgba(var(--v-theme-primary), 0.07)
      ),
      rgb(var(--v-theme-surface));
    border-color: rgba(var(--v-theme-primary), 0.25);
    box-shadow: inset 3px 0 0 rgb(var(--v-theme-primary));
  }

  &--unread &__title {
    font-weight: 700;
  }
}
</style>
