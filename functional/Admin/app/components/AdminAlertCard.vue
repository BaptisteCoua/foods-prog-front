<template>
  <li
    class="alert"
    :class="{ 'alert--unread': !alert.isRead, 'alert--removing': removing }"
    @transitionend="onRemoveEnd"
  >
    <!-- Fond destructif révélé progressivement par le swipe vers la gauche
         (rouge qui monte + poubelle qui grossit), comme la liste de repas du
         planning. Transparent au repos pour ne pas teinter la bordure. -->
    <div
      class="alert__backdrop"
      :style="{ opacity: backdropOpacity }"
    >
      <v-icon
        icon="mdi-trash-can"
        size="22"
        :style="{ transform: `scale(${trashScale})` }"
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
      <!-- Point émeraude : seul marqueur de non-lu, largeur réservée pour éviter
           tout décalage de mise en page entre lu / non lu. -->
      <span class="alert__flag">
        <span
          v-if="!alert.isRead"
          class="alert__dot"
        />
      </span>

      <span class="alert__icon">
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
          <span class="alert__type">{{ typeMeta.label }}</span>
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
// Import explicite : deux composables `useSwipeToDelete` existent (Theme + Planning),
// l'auto-import est ambigu et peut résoudre vers la mauvaise copie. On vise le Theme,
// qui porte rowStyle / suppressClick / le repli de suppression de cette carte.
import { useSwipeToDelete } from '../../../../technical/Theme/app/composables/useSwipeToDelete'

const props = defineProps<{ alert: AdminAlert }>()

const emit = defineEmits<{
  open: [alert: AdminAlert]
  read: [alert: AdminAlert]
  delete: [alert: AdminAlert]
}>()

const {
  removing,
  progress,
  suppressClick,
  rowStyle,
  onTransitionEnd,
  onRemoveEnd,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
} = useSwipeToDelete({ onDelete: () => emit('delete', props.alert) })

// Reveal progressif du fond destructif, identique à la liste de repas du planning :
// le rouge monte de 0,35 → 1 avec la distance de swipe. Transparent au repos
// (`suppressClick` faux) pour ne pas teinter la bordure de la carte ; plein rouge
// pendant le repli de suppression.
const backdropOpacity = computed(() => {
  if (removing.value) return 1
  if (!suppressClick.value) return 0
  return 0.35 + progress.value * 0.65
})

// La poubelle grossit de 0,7 → 1,2 avec le swipe (figée à 1,2 pendant la sortie).
const trashScale = computed(() =>
  removing.value ? 1.2 : 0.7 + progress.value * 0.5,
)

const typeMeta = computed(() => FEEDBACK_TYPE_META[props.alert.feedbackType])
const authorLabel = computed(() => authorName(props.alert.authorName))
const time = computed(() => formatAlertTime(props.alert.createdAt))

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
  // Repli vertical à la suppression (même motion que la liste de repas du
  // planning) : la carte s'écrase vers le haut en fondu. On passe par max-height
  // (et non grid 1fr→0fr) car la carte est enveloppée dans AppReveal et n'est
  // donc pas un flex item — le truc grid s'effondrerait à 0 dès le repos.
  max-height: 8rem;
  opacity: 1;
  transition:
    max-height 0.26s var(--app-ease, ease),
    opacity 0.26s var(--app-ease, ease);

  &--removing {
    max-height: 0;
    opacity: 0;
  }

  &__backdrop {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 1.25rem;
    // Même rayon que la carte : sinon le rectangle rouge laisse un liseré
    // d'anti-aliasing dans les 4 coins arrondis, sous la __row qui le recouvre.
    border-radius: inherit;
    background: rgb(var(--v-theme-error));
    color: #fff;
    // Opacité et scale de la poubelle pilotés inline par la distance de swipe
    // (`backdropOpacity` / `trashScale`) — reveal progressif comme le planning.
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

  // Pastille de non-lu : largeur fixe réservée même quand l'alerte est lue,
  // pour que l'icône et le texte ne bougent pas d'une carte à l'autre.
  &__flag {
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    width: 8px;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: rgb(var(--v-theme-primary));
  }

  // Icône neutre : aucune couleur de type, juste un cercle gris discret.
  &__icon {
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    width: 40px;
    height: 40px;
    border-radius: 999px;
    color: rgb(var(--v-theme-on-surface-variant));
    background: rgba(var(--v-border-color), 0.08);
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

  // Type en petit label discret : pas de couleur vive, juste une majuscule
  // espacée façon étiquette système.
  &__type {
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-size: 0.68rem;
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

  // Une alerte non lue se distingue par le seul point émeraude + un titre plus
  // fort. Pas de teinte ni de barre colorée : on reste neutre et minimal.
  &--unread &__title {
    font-weight: 700;
    color: rgb(var(--v-theme-on-surface));
  }
}

@media (prefers-reduced-motion: reduce) {
  .alert {
    transition: none;
  }
}
</style>
