// Swipe-to-delete gesture for a single list row (mobile-first, pointer-based so
// it works for touch and mouse alike). The row tracks a horizontal leftward drag,
// reveals a red trash zone behind it, and — past a confirmation threshold — plays
// a slide-out before calling `onDelete`. Vertical scroll stays untouched thanks to
// `touch-action: pan-y` on the dragged element + the browser-fired `pointercancel`.
interface SwipeToDeleteOptions {
  onDelete: () => void
}

export const useSwipeToDelete = ({ onDelete }: SwipeToDeleteOptions) => {
  // Drag left past this many px → a release confirms the delete.
  const THRESHOLD = 96
  // Resting width of the revealed red trash zone.
  const REVEAL = 84
  // Rubber-band resistance applied once dragged beyond the reveal width.
  const RESISTANCE = 0.35
  // Min horizontal travel before we treat the gesture as a swipe (vs a tap).
  const SLOP = 6

  const offset = ref(0)
  const dragging = ref(false)
  const removing = ref(false)
  // Stays true after a confirmed swipe so the trailing `click` doesn't open the row.
  const moved = ref(false)

  let startX = 0
  let target: HTMLElement | null = null

  // 0 → 1 as the row approaches the confirmation threshold; drives the trash reveal.
  const progress = computed(() => Math.min(1, Math.abs(offset.value) / THRESHOLD))
  const armed = computed(() => Math.abs(offset.value) >= THRESHOLD)

  const reset = () => {
    dragging.value = false
    offset.value = 0
  }

  const confirm = () => {
    // No animation requested → delete straight away.
    if (prefersReducedMotion()) {
      onDelete()
      return
    }
    removing.value = true
  }

  const onPointerDown = (event: PointerEvent) => {
    if (removing.value) return
    startX = event.clientX
    dragging.value = true
    moved.value = false
    target = event.currentTarget as HTMLElement
  }

  const onPointerMove = (event: PointerEvent) => {
    if (!dragging.value) return
    const dx = event.clientX - startX
    // Never drag past the origin to the right.
    if (dx >= 0) {
      offset.value = 0
      return
    }
    if (!moved.value && Math.abs(dx) > SLOP) {
      moved.value = true
      // Keep receiving moves even if the finger leaves the element bounds.
      target?.setPointerCapture(event.pointerId)
    }
    offset.value = -dx > REVEAL
      ? -REVEAL - (-dx - REVEAL) * RESISTANCE
      : dx
  }

  const onPointerUp = () => {
    if (!dragging.value) return
    dragging.value = false
    if (armed.value) confirm()
    else offset.value = 0
  }

  const onPointerCancel = () => {
    reset()
  }

  // Called by the row when the slide-out transition ends — actually drops the item.
  const onRemoveEnd = (event: TransitionEvent) => {
    if (removing.value && event.propertyName === 'opacity') onDelete()
  }

  return {
    offset,
    dragging,
    removing,
    moved,
    progress,
    armed,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onRemoveEnd,
  }
}
