import type { ShoppingList } from '../types/shoppingList'

// Loads the aggregated shopping list for a date range (GET /shopping-list?from&to).
// Keyed by the range so changing the period refetches. The whole aggregation
// (quantities + cost per ingredient) is computed server-side — we only display.
export const useShoppingList = (
  from: MaybeRefOrGetter<string>,
  to: MaybeRefOrGetter<string>,
) => {
  const api = useApi()

  const { data, pending, error, refresh } = useAsyncData(
    () => `shopping-${toValue(from)}-${toValue(to)}`,
    () => api<ShoppingList>('/shopping-list', { query: { from: toValue(from), to: toValue(to) } }),
    { watch: [() => toValue(from), () => toValue(to)] },
  )

  return { list: data, pending, error, refresh }
}
