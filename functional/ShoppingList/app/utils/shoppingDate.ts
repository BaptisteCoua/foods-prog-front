// Pure date helpers for the shopping-list period selector. Everything is a
// local-time 'YYYY-MM-DD' string (the shape the API stores) — we never touch UTC
// so a day never drifts across a timezone boundary. Mirrors the Planning layer's
// planningDate.ts: re-implemented here to keep the layer self-contained rather
// than reaching across into another functional layer.

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

// Shift an ISO date by N months, clamping the day to the target month length
// (e.g. 31 Jan + 1 month → 28/29 Feb).
export const addMonths = (iso: string, months: number): string => {
  const date = parseISODate(iso)
  const day = date.getDate()
  date.setDate(1)
  date.setMonth(date.getMonth() + months)
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  date.setDate(Math.min(day, lastDay))
  return toISODate(date)
}

// Monday of the week containing the given ISO date.
export const startOfWeek = (iso: string): string => {
  const date = parseISODate(iso)
  const offset = (date.getDay() + 6) % 7 // Monday = 0 … Sunday = 6
  date.setDate(date.getDate() - offset)
  return toISODate(date)
}

// First and last day of the month containing the given ISO date.
export const monthBounds = (iso: string): { from: string, to: string } => {
  const date = parseISODate(iso)
  const from = new Date(date.getFullYear(), date.getMonth(), 1)
  const to = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return { from: toISODate(from), to: toISODate(to) }
}

// Long human label, e.g. « mercredi 24 juin ».
export const formatLongDate = (iso: string): string =>
  new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    .format(parseISODate(iso))

// Short human label, e.g. « 24 juin ».
export const formatShortDate = (iso: string): string =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' })
    .format(parseISODate(iso))

// Month + year label, e.g. « juin 2026 ».
export const formatMonth = (iso: string): string =>
  new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })
    .format(parseISODate(iso))
