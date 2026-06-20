// Flips to visible shortly after mount so an element can animate in. Pass a delay
// (ms) to stagger siblings. Reduced-motion shows the element immediately.
export const useReveal = (delay = 0) => {
  const isVisible = ref(false)

  onMounted(() => {
    if (prefersReducedMotion()) {
      isVisible.value = true
      return
    }
    setTimeout(() => {
      isVisible.value = true
    }, delay)
  })

  return { isVisible }
}
