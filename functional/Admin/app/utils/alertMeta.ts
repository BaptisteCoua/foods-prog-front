// Compact relative time for the alert feed ("il y a 5 min", "il y a 2 h"),
// falling back to an absolute date past a week. Mirrors the tone of the feedback
// board's date helper but tuned for a notification-style list.
export const formatAlertTime = (iso: string): string => {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (minutes < 1) return 'à l\'instant'
  if (minutes < 60) return `il y a ${minutes} min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`

  const days = Math.floor(hours / 24)
  if (days < 7) return `il y a ${days} j`

  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
