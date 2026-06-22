import { useShoppingList } from './useShoppingList'
import { useShoppingPeriod } from './useShoppingPeriod'

// Orchestrates the shopping page: resolves the period, fetches its list, sorts
// the lines and tracks which items have been picked up. The check-off state is
// local and intentionally non-persisted (it covers a single shopping session and
// resets whenever the period changes).
export const useShoppingBoard = () => {
  const periodApi = useShoppingPeriod()
  const period = periodApi.period

  const { list, pending, error, refresh } = useShoppingList(
    () => period.value.from,
    () => period.value.to,
  )

  // Unchecked items first, picked-up ones sink to the bottom; each group sorted
  // by name (French collation). Depends on `checked`, so ticking an item
  // recomputes the order and the list animates the move.
  const lines = computed(() =>
    [...(list.value?.lines ?? [])].sort((a, b) => {
      const aChecked = checked.value.has(a.ingredientId)
      const bChecked = checked.value.has(b.ingredientId)
      if (aChecked !== bChecked) return aChecked ? 1 : -1
      return a.name.localeCompare(b.name, 'fr')
    }),
  )

  const isEmpty = computed(() => !pending.value && !error.value && lines.value.length === 0)

  // Local check-off, by ingredient id. Cleared on every period change.
  const checked = ref<Set<number>>(new Set())
  const isChecked = (ingredientId: number) => checked.value.has(ingredientId)
  const toggleCheck = (ingredientId: number) => {
    const next = new Set(checked.value)
    if (next.has(ingredientId)) {
      next.delete(ingredientId)
    }
    else {
      next.add(ingredientId)
    }
    checked.value = next
  }
  watch(period, () => {
    checked.value = new Set()
  })

  // Total cost of the list and cost of what's left to buy (unchecked lines).
  const totalCostCents = computed(() => list.value?.totalCostCents ?? 0)
  const remainingCostCents = computed(() =>
    lines.value
      .filter(line => !checked.value.has(line.ingredientId))
      .reduce((sum, line) => sum + line.costCents, 0),
  )
  const checkedCount = computed(() =>
    lines.value.filter(line => checked.value.has(line.ingredientId)).length,
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
    checkedCount,
    // check-off
    isChecked,
    toggleCheck,
  }
}
