import type { Period, PresetKey } from '../types/shoppingList'
import {
  addDays,
  addMonths,
  formatLongDate,
  formatMonth,
  formatShortDate,
  monthBounds,
  startOfWeek,
  todayISO,
} from '../utils/shoppingDate'

// Owns the selected period: a preset (day/week/month/custom) plus an anchor date,
// resolved into the { from, to } range the API expects. `prev()` / `next()` step
// the anchor by the preset's granularity. Optionally seeded from the route query
// (?preset&from&to) so the Planning shortcut can open us on a given week.
export const useShoppingPeriod = () => {
  const route = useRoute()

  const queryPreset = route.query.preset as PresetKey | undefined
  const queryFrom = route.query.from as string | undefined
  const queryTo = route.query.to as string | undefined

  const preset = ref<PresetKey>(queryPreset ?? 'week')
  const anchor = ref<string>(queryFrom ?? todayISO())
  const customFrom = ref<string>(queryFrom ?? todayISO())
  const customTo = ref<string>(queryTo ?? todayISO())

  const period = computed<Period>(() => {
    switch (preset.value) {
      case 'day':
        return { from: anchor.value, to: anchor.value }
      case 'month':
        return monthBounds(anchor.value)
      case 'custom':
        return { from: customFrom.value, to: customTo.value }
      case 'week':
      default: {
        const from = startOfWeek(anchor.value)
        return { from, to: addDays(from, 6) }
      }
    }
  })

  // Step the anchor back/forward by the preset's granularity (no-op for custom,
  // whose bounds are edited directly).
  const step = (direction: -1 | 1) => {
    switch (preset.value) {
      case 'day':
        anchor.value = addDays(anchor.value, direction)
        break
      case 'week':
        anchor.value = addDays(anchor.value, direction * 7)
        break
      case 'month':
        anchor.value = addMonths(anchor.value, direction)
        break
    }
  }
  const prev = () => step(-1)
  const next = () => step(1)
  const goToToday = () => {
    anchor.value = todayISO()
  }

  // Human label of the current range, e.g. « 22 – 28 juin » or « juin 2026 ».
  const label = computed(() => {
    switch (preset.value) {
      case 'day':
        return formatLongDate(period.value.from)
      case 'month':
        return formatMonth(anchor.value)
      case 'week':
      case 'custom':
      default:
        return `${formatShortDate(period.value.from)} – ${formatShortDate(period.value.to)}`
    }
  })

  return { preset, anchor, customFrom, customTo, period, prev, next, goToToday, label }
}
