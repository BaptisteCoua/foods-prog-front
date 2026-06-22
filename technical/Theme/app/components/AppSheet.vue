<template>
  <v-bottom-sheet
    :model-value="modelValue"
    :max-width="maxWidth"
    :scrim="scrim"
    @update:model-value="onUpdate"
  >
    <section
      class="app-sheet"
      :class="{ 'app-sheet--dragging': dragging }"
      :style="containerStyle"
      data-swipe-nav-ignore
      @transitionend="onTransitionEnd"
    >
      <div
        class="app-sheet__grab"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerCancel"
      >
        <v-btn
          icon="mdi-chevron-down"
          variant="text"
          size="small"
          class="app-sheet__close"
          aria-label="Fermer"
          @click="dismiss"
        />
      </div>
      <div class="app-sheet__body">
        <slot />
      </div>
    </section>
  </v-bottom-sheet>
</template>

<script setup lang="ts">
// Mobile-first popup shell: a bottom-anchored panel with a centred down-chevron grab handle.
// Drag the handle down (or tap the chevron) to dismiss — the panel slides out downward via
// `useSwipeToDismiss`. Every popup in the app wraps its content in this so the gesture and the
// close affordance stay identical everywhere.
const props = withDefaults(defineProps<{
  modelValue: boolean
  maxWidth?: string | number
  scrim?: boolean
}>(), {
  maxWidth: 640,
  scrim: true,
})

const emit = defineEmits<{ 'update:modelValue': [boolean] }>()

const {
  dragging,
  containerStyle,
  dismiss,
  reset,
  onTransitionEnd,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
} = useSwipeToDismiss({ onDismiss: () => emit('update:modelValue', false) })

// Route every close path (backdrop, Esc) through the same downward slide-out.
const onUpdate = (value: boolean) => {
  if (value) emit('update:modelValue', true)
  else dismiss()
}

// Reset gesture state on every open: the panel stays mounted between uses, so a leftover
// `closing` flag (translateY 100%) would otherwise keep the next opening invisible. Resetting
// here — never on close — also avoids snapping the panel back mid-exit.
watch(() => props.modelValue, (open) => {
  if (open) reset()
})
</script>

<style scoped lang="scss">
.app-sheet {
  display: flex;
  flex-direction: column;
  max-height: 92vh;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  will-change: transform;

  &--dragging {
    cursor: grabbing;
  }

  &__grab {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
    flex: 0 0 auto;
    padding-top: 0.5rem;
    // Keep the vertical drag from scrolling the page / triggering pull-to-refresh.
    touch-action: none;
    cursor: grab;

    &::before {
      content: '';
      width: 2.25rem;
      height: 0.28rem;
      border-radius: 999px;
      background: rgba(var(--v-border-color), 0.55);
    }
  }

  &__close {
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__body {
    flex: 1 1 auto;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}
</style>
