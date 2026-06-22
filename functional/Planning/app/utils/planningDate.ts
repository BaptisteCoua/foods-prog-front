// Pure date helpers for the weekly planning. Everything is a local-time
// `YYYY-MM-DD` string (the same shape the API stores) — we never touch UTC so a
// day never drifts across a timezone boundary.

const pad = (value: number): string => String(value).padStart(2, '0')

// A Date → 'YYYY-MM-DD' (local time).
export const toISODate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

// 'YYYY-MM-DD' → Date at local midnight.
export const parseISODate = (iso: string): Date => {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// Today as 'YYYY-MM-DD'.
export const todayISO = (): string => toISODate(new Date())

// Shift an ISO date by N days (N may be negative).
export const addDays = (iso: string, days: number): string => {
  const date = parseISODate(iso)
  date.setDate(date.getDate() + days)
  return toISODate(date)
}

// Monday of the week containing the given ISO date.
export const startOfWeek = (iso: string): string => {
  const date = parseISODate(iso)
  const offset = (date.getDay() + 6) % 7 // Monday = 0 … Sunday = 6
  date.setDate(date.getDate() - offset)
  return toISODate(date)
}

// The seven ISO dates of the week starting at `weekStart` (a Monday).
export const weekDates = (weekStart: string): string[] =>
  Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))

// Single-letter weekday initial (L M M J V S D) for the compact week strip.
export const weekdayInitial = (iso: string): string =>
  ['L', 'M', 'M', 'J', 'V', 'S', 'D'][(parseISODate(iso).getDay() + 6) % 7]

// Day-of-month number, e.g. 24.
export const dayNumber = (iso: string): number => parseISODate(iso).getDate()

// Long human label, e.g. « mercredi 24 juin ».
export const formatLongDate = (iso: string): string =>
  new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    .format(parseISODate(iso))

// Short human label for a target day in pickers, e.g. « mer. 24 ».
export const formatShortDate = (iso: string): string =>
  new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric' })
    .format(parseISODate(iso))
