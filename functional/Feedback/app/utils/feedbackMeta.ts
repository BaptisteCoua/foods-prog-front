import type { FeedbackStatus, FeedbackType } from '../types/feedback'

// Presentation metadata for feedback types & statuses (label, accent color,
// icon). Colors follow the app palette: feature = indigo, idea = amber,
// bug = rose, done = emerald accent. Kept here so cards, chips and the detail
// page stay visually consistent.
interface Meta {
  label: string
  color: string
  icon: string
}

export const FEEDBACK_TYPE_META: Record<FeedbackType, Meta> = {
  BUG: { label: 'Bug', color: '#F43F5E', icon: 'mdi-bug-outline' },
  FEATURE: { label: 'Fonctionnalité', color: '#6366F1', icon: 'mdi-shape-outline' },
  IDEA: { label: 'Idée', color: '#F59E0B', icon: 'mdi-lightbulb-outline' },
}

export const FEEDBACK_STATUS_META: Record<FeedbackStatus, Meta> = {
  OPEN: { label: 'Ouvert', color: '#94A3B8', icon: 'mdi-circle-outline' },
  PLANNED: { label: 'Planifié', color: '#6366F1', icon: 'mdi-calendar-check-outline' },
  IN_PROGRESS: { label: 'En cours', color: '#F59E0B', icon: 'mdi-progress-clock' },
  DONE: { label: 'Terminé', color: '#10B981', icon: 'mdi-check-circle-outline' },
  DECLINED: { label: 'Pas retenu', color: '#94A3B8', icon: 'mdi-close-circle-outline' },
}

// Ordered lists for filters / selectors (drives the status workflow order).
export const FEEDBACK_TYPES: FeedbackType[] = ['BUG', 'FEATURE', 'IDEA']
export const FEEDBACK_STATUSES: FeedbackStatus[] = [
  'OPEN',
  'PLANNED',
  'IN_PROGRESS',
  'DONE',
  'DECLINED',
]

// Short relative-ish date for cards ("28 juin 2026").
export const formatFeedbackDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

// Author display fallback when no pseudo is set.
export const authorName = (displayName: string | null): string =>
  displayName?.trim() || 'Utilisateur'
