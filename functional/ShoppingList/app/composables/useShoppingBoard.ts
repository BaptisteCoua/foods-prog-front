import { toast } from 'vue3-toastify'
import type { PeriodSeed } from './useShoppingPeriod'
import { useShoppingList } from './useShoppingList'
import { useShoppingPeriod } from './useShoppingPeriod'
import type { ShoppingListLine } from '../types/shoppingList'

// Orchestrates the shopping page: resolves the period, fetches its list (needs
// already netted against the pantry stock server-side), sorts the lines and turns
// checking an item into a real "buy" that tops the pantry up. Because coverage is
// derived from server stock (a line is covered when there's nothing left to buy),
// the check-off is persistent by construction — it survives reloads and syncs
// with the Garde-manger page. `seed` lets a caller (the Planning popup) open the
// board on a given period rather than the route query / current week.
export const useShoppingBoard = (seed?: PeriodSeed) => {
  const periodApi = useShoppingPeriod(seed)
  const period = periodApi.period

  const { list, pending, error, refresh } = useShoppingList(
    () => period.value.from,
    () => period.value.to,
  )

  // Buying tops up the pantry stock; the shared 'pantry' cache is refreshed too.
  const { adjust } = usePantry()

  // Still-to-buy items first, covered ones (fully in stock) sink to the bottom;
  // each group sorted by name (French collation).
  const lines = computed(() =>
    [...(list.value?.lines ?? [])].sort((a, b) => {
      const aCovered = a.toBuyQuantity <= 0
      const bCovered = b.toBuyQuantity <= 0
      if (aCovered !== bCovered) return aCovered ? 1 : -1
      return a.name.localeCompare(b.name, 'fr')
    }),
  )

  const isEmpty = computed(() => !pending.value && !error.value && lines.value.length === 0)

  // A line is covered when the stock already meets the need (nothing to buy).
  const isCovered = (line: ShoppingListLine) => line.toBuyQuantity <= 0

  // Per-line spinner while its "buy" request is in flight.
  const buying = ref<Set<number>>(new Set())
  const isBuying = (ingredientId: number) => buying.value.has(ingredientId)

  // Check an item = "acheté" : add the shortfall to the pantry, then refetch the
  // list so the line recomputes as covered. Persistent because it's real stock.
  const buy = async (line: ShoppingListLine) => {
    if (line.toBuyQuantity <= 0) return
    buying.value = new Set(buying.value).add(line.ingredientId)
    try {
      await adjust({ ingredientId: line.ingredientId, delta: line.toBuyQuantity })
      await refresh()
    }
    catch {
      toast.error('Achat impossible.')
    }
    finally {
      const next = new Set(buying.value)
      next.delete(line.ingredientId)
      buying.value = next
    }
  }

  // Full-need cost and cost of what's left to buy (after the pantry stock).
  const totalCostCents = computed(() => list.value?.totalCostCents ?? 0)
  const remainingCostCents = computed(() => list.value?.toBuyTotalCostCents ?? 0)
  const coveredCount = computed(() =>
    lines.value.filter(line => line.toBuyQuantity <= 0).length,
  )

  return {
    // period
    preset: periodApi.preset,
    customFrom: periodApi.customFrom,
    customTo: periodApi.customTo,
    label: periodApi.label,
    prev: periodApi.prev,
    next: periodApi.next,
    goToToday: periodApi.goToToday,
    // data
    lines,
    pending,
    error,
    isEmpty,
    refresh,
    totalCostCents,
    remainingCostCents,
    coveredCount,
    // buy / coverage
    isCovered,
    isBuying,
    buy,
  }
}
