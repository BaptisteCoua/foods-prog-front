import type {
  PantryAdjustPayload,
  PantryLine,
  PantrySetPayload,
} from '../types/pantry'

// Loads the pantry stock and exposes its mutations. Keyed shared state
// ('pantry'), so the Garde-manger page and the shopping-list "buy" action see the
// same data and every mutation refreshes it. Stock is server-persisted — no
// client-side persistence needed.
export const usePantry = () => {
  const api = useApi()

  const { data, pending, error, refresh } = useAsyncData('pantry', () =>
    api<PantryLine[]>('/pantry'),
  )

  const lines = computed(() => data.value ?? [])

  // Set the absolute available quantity ("j'ai 2 kg de riz").
  const setQuantity = async (payload: PantrySetPayload) => {
    await api<PantryLine>('/pantry', { method: 'PUT', body: payload })
    await refresh()
  }

  // Add a signed delta to the stock: buying from the shopping list (delta > 0) or
  // a manual correction.
  const adjust = async (payload: PantryAdjustPayload) => {
    await api<PantryLine>('/pantry/adjust', { method: 'PATCH', body: payload })
    await refresh()
  }

  const remove = async (id: number) => {
    await api(`/pantry/${id}`, { method: 'DELETE' })
    await refresh()
  }

  return { lines, pending, error, refresh, setQuantity, adjust, remove }
}
