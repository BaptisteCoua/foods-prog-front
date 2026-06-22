// Swipe-down-to-dismiss gesture for a bottom-anchored popup (mobile-first, pointer-based
// so touch and mouse behave alike). A grab handle tracks a downward drag: the panel follows
// the finger, and — past a threshold (or on a tap of the close button) — it plays a downward
// slide-out before asking the host to close. Upward drag meets rubber-band resistance, and a
// release short of the threshold springs the panel back. Respects `prefers-reduced-motion`.
interface SwipeToDismissOptions {
  onDismiss: () => void
}

export const useSwipeToDismiss = ({ onDismiss }: SwipeToDismissOptions) => {
  // Drag down past this many px → a release confirms the dismiss.
  const THRESHOLD = 110
  // Min vertical travel before we treat the gesture as a drag (vs a tap on the close button).
  const SLOP = 6
  // Rubber-band resistance applied to any upward drag (offset stays mostly pinned).
  const RESISTANCE = 0.4

  // Downward travel of the panel, in px (always >= a small negative from resistance).
  const offset = ref(0)
  const dragging = ref(false)
  // True while the slide-out animation runs; the host stays mounted until it ends.
  const closing = ref(false)

  let startY = 0
  let moved = false
  let target: HTMLElement | null = null

  const reset = () => {
    dragging.value = false
    closing.value = false
    offset.value = 0
  }

  // Plays the downward slide-out, then asks the host to close on transition end.
  const dismiss = () => {
    if (closing.value) return
    if (prefersReducedMotion()) {
      reset()
      onDismiss()
      return
    }
    dragging.value = false
    closing.value = true
  }

  const onPointerDown = (event: PointerEvent) => {
    if (closing.value) return
    startY = event.clientY
    dragging.value = true
    moved = false
    target = event.currentTarget as HTMLElement
  }

  const onPointerMove = (event: PointerEvent) => {
    if (!dragging.value) return
    const dy = event.clientY - startY
    if (!moved && Math.abs(dy) > SLOP) {
      moved = true
      // Keep receiving moves even if the finger leaves the handle bounds.
      target?.setPointerCapture(event.pointerId)
    }
    // Follow the finger downward; resist upward travel.
    offset.value = dy >= 0 ? dy : dy * RESISTANCE
  }

  const onPointerUp = () => {
    if (!dragging.value) return
    dragging.value = false
    if (offset.value >= THRESHOLD) dismiss()
    else offset.value = 0
  }

  const onPointerCancel = () => {
    if (!dragging.value) return
    dragging.value = false
    offset.value = 0
  }

  // The panel drops fully below its own height for a clean exit regardless of content size.
  const containerStyle = computed(() => {
    if (closing.value) {
      return {
        transform: 'translateY(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 1, 1)',
      }
    }
    if (dragging.value) {
      return { transform: `translateY(${offset.value}px)`, transition: 'none' }
    }
    if (offset.value !== 0) {
      // Released short of the threshold → spring back.
      return {
        transform: `translateY(${offset.value}px)`,
        transition: 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
      }
    }
    // At rest → leave the panel untouched so the open transition can play.
    return {}
  })

  // Fires the actual close once the slide-out finishes; ignored for the spring-back and for
  // any `transitionend` bubbling up from child elements (ripples, expand transitions…).
  const onTransitionEnd = (event: TransitionEvent) => {
    if (event.target !== event.currentTarget) return
    if (closing.value && event.propertyName === 'transform') onDismiss()
  }

  return {
    offset,
    dragging,
    closing,
    dismiss,
    reset,
    containerStyle,
    onTransitionEnd,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  }
}
