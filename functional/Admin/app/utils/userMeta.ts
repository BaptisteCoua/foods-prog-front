import type { SubscriptionPlan, UserRole } from '../../../Profile/app/types/me'

// Presentation metadata for user roles & plans (label, accent color, icon).
// Colors follow the app palette: admin = indigo, moderator = amber,
// premium = emerald accent, neutral = slate. Kept here so the admin table
// stays visually consistent with the feedback chips.
interface Meta {
  label: string
  color: string
  icon: string
}

export const ROLE_META: Record<UserRole, Meta> = {
  USER: { label: 'Utilisateur', color: '#94A3B8', icon: 'mdi-account-outline' },
  MODERATOR: { label: 'Modérateur', color: '#F59E0B', icon: 'mdi-shield-account-outline' },
  ADMIN: { label: 'Admin', color: '#6366F1', icon: 'mdi-shield-crown-outline' },
}

export const PLAN_META: Record<SubscriptionPlan, Meta> = {
  FREE: { label: 'Gratuit', color: '#94A3B8', icon: 'mdi-account-outline' },
  PREMIUM: { label: 'Premium', color: '#10B981', icon: 'mdi-star-four-points-outline' },
}

// Short date for the admin table ("28 juin 2026").
export const formatUserDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

// Display fallback when no pseudo is set.
export const userDisplayName = (displayName: string | null): string =>
  displayName?.trim() || '—'
