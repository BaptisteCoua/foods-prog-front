// Identité de l'utilisateur courant (GET/PATCH /me) — distincte du BodyProfile.
export interface Me {
  id: number
  email: string
  displayName: string | null
  createdAt: string
}

export interface UpdateMePayload {
  displayName?: string
}
