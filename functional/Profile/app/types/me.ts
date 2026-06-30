// Identité de l'utilisateur courant (GET/PATCH /me) — distincte du BodyProfile.
// Les champs `givenName`…`nickname` viennent du compte Google (null sinon).
// Deux axes orthogonaux (cf. usePermissions) :
// - rôle (pouvoir) : 'MODERATOR' (sous-admin) modère, 'ADMIN' a tous les droits ;
// - abonnement : 'PREMIUM' débloque les fonctionnalités payantes.
export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN'
export type SubscriptionPlan = 'FREE' | 'PREMIUM'

export interface Me {
  id: number
  email: string
  role: UserRole
  plan: SubscriptionPlan
  displayName: string | null
  givenName: string | null
  familyName: string | null
  picture: string | null
  locale: string | null
  birthDate: string | null
  gender: string | null
  address: string | null
  phoneNumber: string | null
  nickname: string | null
  createdAt: string
}

export interface UpdateMePayload {
  displayName?: string
}
