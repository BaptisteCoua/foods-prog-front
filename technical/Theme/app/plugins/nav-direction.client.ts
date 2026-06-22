// Drives the directional page transition (slide left / right) by comparing the
// source and target positions in the top-level nav order. Works for every kind
// of navigation — bottom-nav taps, swipes and browser back/forward alike — so
// the transition always matches the spatial direction of travel. Navigations
// off the nav (detail pages, auth, onboarding) fall back to the neutral fade.
export default defineNuxtPlugin(() => {
  const router = useRouter()
  const direction = useState<'forward' | 'backward' | 'none'>('navDirection', () => 'none')

  router.beforeEach((to, from) => {
    const toIndex = mainNavIndexOf(to.path)
    const fromIndex = mainNavIndexOf(from.path)

    direction.value = toIndex === -1 || fromIndex === -1 || toIndex === fromIndex
      ? 'none'
      : toIndex > fromIndex
        ? 'forward'
        : 'backward'
  })
})
