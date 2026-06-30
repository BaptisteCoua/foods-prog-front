import type { SubscriptionPlan, UserRole } from '../../../Profile/app/types/me'

// Vue d'un utilisateur côté admin (GET /admin/users) — miroir de AdminUserSummary
// côté API. Sous-ensemble sûr (pas de mot de passe ni de champs Google sensibles).
export interface AdminUser {
  id: number
  email: string
  role: UserRole
  plan: SubscriptionPlan
  displayName: string | null
  createdAt: string
}

// Enveloppe de pagination renvoyée par l'API (PaginatedResult<T>).
export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pageCount: number
}
