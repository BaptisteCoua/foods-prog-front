interface CountUpOptions {
  duration?: number
  decimals?: number
}

// Animates a number from 0 to `target` on mount (and whenever target changes),
// easing out. Honours reduced-motion and renders the final value during SSR.
export const useCountUp = (target: MaybeRefOrGetter<number>, options: CountUpOptions = {}) => {
  const { duration = 1200, decimals = 0 } = options
  const current = ref(0)
  let frame = 0

  const animate = () => {
    const to = toValue(target)

    if (import.meta.server || prefersReducedMotion()) {
      current.value = to
      return
    }

    const from = current.value
    const start = performance.now()
    cancelAnimationFrame(frame)

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - progress) ** 3
      current.value = from + (to - from) * eased
      if (progress < 1) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
  }

  const formatted = computed(() =>
    current.value.toLocaleString('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }),
  )

  onMounted(animate)
  watch(() => toValue(target), animate)
  onBeforeUnmount(() => cancelAnimationFrame(frame))

  return { value: current, formatted }
}
