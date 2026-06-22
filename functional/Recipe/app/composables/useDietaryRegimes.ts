import type { DietaryRegime } from '../types/recipe'

// The dietary regimes used to tag recipes (GET /dietary-regimes): global
// reference regimes + the user's own.
export const useDietaryRegimes = () => {
  const api = useApi()

  const { data } = useAsyncData('dietary-regimes', () => api<DietaryRegime[]>('/dietary-regimes'))

  const dietaryRegimes = computed(() => data.value ?? [])

  return { dietaryRegimes }
}
