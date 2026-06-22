import { addDays, startOfWeek, todayISO, weekDates } from '../utils/planningDate'

// Pure date state for the planning: which week is shown and which day is selected.
// No API here — usePlanningBoard wires this to the data. The selected day always
// stays inside the visible week (changing week snaps the selection to its Monday,
// unless today is in that week).
export const useWeekNavigation = () => {
  const today = todayISO()

  const weekStart = ref(startOfWeek(today))
  const selectedDate = ref(today)

  const weekEnd = computed(() => addDays(weekStart.value, 6))
  const dates = computed(() => weekDates(weekStart.value))

  const goToWeek = (newStart: string) => {
    weekStart.value = newStart
    const inWeek = dates.value.includes(selectedDate.value)
    if (!inWeek) {
      selectedDate.value = dates.value.includes(today) ? today : newStart
    }
  }

  const prevWeek = () => goToWeek(addDays(weekStart.value, -7))
  const nextWeek = () => goToWeek(addDays(weekStart.value, 7))

  const selectDate = (iso: string) => {
    selectedDate.value = iso
  }

  const goToToday = () => {
    weekStart.value = startOfWeek(today)
    selectedDate.value = today
  }

  return {
    today,
    weekStart,
    weekEnd,
    dates,
    selectedDate,
    prevWeek,
    nextWeek,
    selectDate,
    goToToday,
  }
}
