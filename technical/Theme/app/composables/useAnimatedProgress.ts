// Holds a progress value that starts at 0 and eases to its real target after
// mount, letting a CSS transition do the tween (used by gauges / bars). Reduced
// motion and SSR jump straight to the target.
export const useAnimatedProgress = (target: MaybeRefOrGetter<number>) => {
  const shown = ref(0)

  const apply = () => {
    shown.value = toValue(target)
  }

  onMounted(() => {
    if (prefersReducedMotion()) {
      apply()
      return
    }
    requestAnimationFrame(() => requestAnimationFrame(apply))
  })

  watch(() => toValue(target), apply)

  return { shown }
}
