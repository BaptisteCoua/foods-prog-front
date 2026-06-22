// Horizontal swipe navigation between the top-level pages, mobile-app style.
// Pointer-based (touch + mouse), the page content follows the finger with a
// rubber-band at the two ends of the nav; releasing past a threshold commits a
// navigation to the previous / next section, which then plays the directional
// page transition. Vertical scroll stays native thanks to `touch-action: pan-y`
// on the swipe surface + the browser-fired `pointercancel`.
export const useSwipeNavigation = () => {
  const route = useRoute()

  // Horizontal travel (px) needed to commit a navigation on release.
  const THRESHOLD = 64
  // Min travel before we lock onto an axis (tap vs swipe, horizontal vs scroll).
  const SLOP = 10
  // Rubber-band resistance applied when swiping past the first / last page.
  const RESISTANCE = 0.4
  // Visual clamp so the page never drifts too far while dragging.
  const MAX = 120

  // Live translateX of the page while dragging (0 when at rest).
  const offset = ref(0)
  const dragging = ref(false)

  let startX = 0
  let startY = 0
  let dx = 0
  let axis: 'h' | 'v' | null = null
  let index = -1
  let surface: HTMLElement | null = null

  const reset = () => {
    dragging.value = false
    offset.value = 0
    axis = null
    dx = 0
  }

  const onPointerDown = (event: PointerEvent) => {
    // Let elements with their own horizontal gesture (swipe-to-delete rows) win.
    if ((event.target as HTMLElement)?.closest('[data-swipe-nav-ignore]')) return
    index = mainNavIndexOf(route.path)
    if (index === -1) return // not on a top-level page → nothing to swipe between
    startX = event.clientX
    startY = event.clientY
    dx = 0
    axis = null
    dragging.value = true
    surface = event.currentTarget as HTMLElement
  }

  const onPointerMove = (event: PointerEvent) => {
    if (!dragging.value) return
    dx = event.clientX - startX
    const dy = event.clientY - startY

    if (axis === null) {
      if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return
      axis = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v'
      // Horizontal: keep the gesture even if the finger leaves the surface.
      if (axis === 'h') surface?.setPointerCapture(event.pointerId)
    }
    if (axis !== 'h') return

    // No neighbour on that side → drag with resistance, then clamp.
    const atStart = index === 0 && dx > 0
    const atEnd = index === mainNavItems.length - 1 && dx < 0
    const travel = atStart || atEnd ? dx * RESISTANCE : dx
    offset.value = prefersReducedMotion()
      ? 0
      : Math.max(-MAX, Math.min(MAX, travel))
  }

  const onPointerUp = () => {
    if (!dragging.value) return
    const committed = axis === 'h' && Math.abs(dx) >= THRESHOLD
    if (committed) {
      // Drag right (dx > 0) → previous page ; drag left → next page.
      const target = mainNavItems[index + (dx > 0 ? -1 : 1)]
      if (target) navigateTo(target.to)
    }
    reset()
  }

  const onPointerCancel = () => reset()

  return {
    offset,
    dragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  }
}
