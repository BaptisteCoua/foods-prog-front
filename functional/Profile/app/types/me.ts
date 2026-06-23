// Identité de l'utilisateur courant (GET/PATCH /me) — distincte du BodyProfile.
// Les champs `givenName`…`nickname` viennent du compte Google (null sinon).
export interface Me {
  id: number
  email: string
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
