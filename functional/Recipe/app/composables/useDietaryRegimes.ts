import type { DietaryRegime } from '../types/recipe'

// The dietary regimes used to tag recipes (GET /dietary-regimes): global
// reference regimes + the user's own.
export const useDietaryRegimes = () => {
  const api = useApi()

  const { data, refresh } = useAsyncData('dietary-regimes', () => api<DietaryRegime[]>('/dietary-regimes'))

  const dietaryRegimes = computed(() => data.value ?? [])

  // Resolve the (deduped, cached) catalog fetch — used to apply profile-based
  // default filters in a single list request rather than reloading once loaded.
  const ensureLoaded = async () => {
    if (!dietaryRegimes.value.length) await refresh()
  }

  return { dietaryRegimes, ensureLoaded }
}
