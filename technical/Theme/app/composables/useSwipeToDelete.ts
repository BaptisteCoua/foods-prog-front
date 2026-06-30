// Swipe-left-to-delete gesture for a list row (mobile-first, pointer-based so touch and
// mouse behave alike). A leftward drag moves the row's foreground over a destructive
// backdrop; past a threshold (or via `remove()`) the host collapses the row vertically
// (height + fade) before dropping it — same removal motion as the planning meal list.
// Rightward drag meets rubber-band resistance and a release short of the threshold
// springs the row back. Respects `prefers-reduced-motion`.
//
// The draggable element should set `touch-action: pan-y` so the browser keeps vertical
// scrolling while horizontal pans are delivered here (a scroll then fires pointercancel).
// A genuine tap (no movement past the slop) leaves the row at rest and lets the host's
// click handler run; after a real drag, `suppressClick` is true so the trailing click is
// ignored rather than treated as a tap.
interface SwipeToDeleteOptions {
  onDelete: () => void
}

export const useSwipeToDelete = ({ onDelete }: SwipeToDeleteOptions) => {
  // Drag left past this many px → a release confirms the delete.
  const THRESHOLD = 96
  // Min horizontal travel before we treat the gesture as a drag (vs a tap).
  const SLOP = 6
  // Rubber-band resistance applied to any rightward drag (offset stays near 0).
  const RESISTANCE = 0.35

  // Leftward travel of the row, in px (<= 0, small positive only from resistance).
  const offset = ref(0)
  const dragging = ref(false)
  // True while the spring-back-to-rest animation runs after a sub-threshold release.
  const settling = ref(false)
  // True while the slide-out animation runs; the host keeps the row until it ends.
  const removing = ref(false)

  let startX = 0
  let moved = false
  let target: HTMLElement | null = null

  // True for any moment a trailing synthetic click should be ignored (mid-drag,
  // springing back, or sliding out) — the host checks this before treating a
  // click as a tap.
  const suppressClick = computed(
    () => dragging.value || settling.value || removing.value,
  )

  const reset = () => {
    dragging.value = false
    settling.value = false
    removing.value = false
    offset.value = 0
  }

  // Plays the leftward slide-out, then asks the host to drop the row on transition end.
  const remove = () => {
    if (removing.value) return
    if (prefersReducedMotion()) {
      reset()
      onDelete()
      return
    }
    dragging.value = false
    settling.value = false
    removing.value = true
  }

  const onPointerDown = (event: PointerEvent) => {
    if (removing.value) return
    startX = event.clientX
    dragging.value = true
    settling.value = false
    moved = false
    target = event.currentTarget as HTMLElement
  }

  const onPointerMove = (event: PointerEvent) => {
    if (!dragging.value) return
    const dx = event.clientX - startX
    if (!moved && Math.abs(dx) > SLOP) {
      moved = true
      // Keep receiving moves even if the finger leaves the row bounds.
      target?.setPointerCapture(event.pointerId)
    }
    // Follow the finger leftward; resist rightward travel past the rest position.
    offset.value = dx <= 0 ? dx : dx * RESISTANCE
  }

  const onPointerUp = () => {
    if (!dragging.value) return
    dragging.value = false
    // A tap (no real movement) leaves the row at rest so the host can open it.
    if (!moved) return
    if (offset.value <= -THRESHOLD) remove()
    else if (offset.value !== 0) settling.value = true
    offset.value = 0
  }

  const onPointerCancel = () => {
    if (!dragging.value) return
    dragging.value = false
    if (offset.value !== 0) settling.value = true
    offset.value = 0
  }

  const rowStyle = computed(() => {
    if (dragging.value) {
      return { transform: `translateX(${offset.value}px)`, transition: 'none' }
    }
    if (settling.value) {
      // Spring back to rest from the released position.
      return { transform: 'translateX(0)', transition: 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)' }
    }
    // At rest (and while removing → the host collapses the row, foreground stays put).
    return {}
  })

  // True once the row has travelled far enough that a release would delete it
  // (drives the backdrop ramping up to its "release to delete" state).
  const willDelete = computed(() => offset.value <= -THRESHOLD)

  // 0 → 1 as the leftward drag approaches the confirmation threshold; lets the host
  // ramp the destructive backdrop (opacity + trash scale) progressively with the swipe.
  const progress = computed(() => Math.min(1, Math.abs(offset.value) / THRESHOLD))

  // Ends the spring-back (back to rest) on the foreground row's transform; ignores
  // transitions bubbling up from child elements.
  const onTransitionEnd = (event: TransitionEvent) => {
    if (event.target !== event.currentTarget) return
    if (event.propertyName !== 'transform') return
    if (settling.value) settling.value = false
  }

  // Ends the collapse-out on the host row: once its own opacity transition finishes,
  // drop the item. Bound to the collapsing element (not the foreground row).
  const onRemoveEnd = (event: TransitionEvent) => {
    if (event.target !== event.currentTarget) return
    if (!removing.value || event.propertyName !== 'opacity') return
    onDelete()
  }

  return {
    offset,
    dragging,
    settling,
    removing,
    willDelete,
    progress,
    suppressClick,
    reset,
    remove,
    rowStyle,
    onTransitionEnd,
    onRemoveEnd,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  }
}
