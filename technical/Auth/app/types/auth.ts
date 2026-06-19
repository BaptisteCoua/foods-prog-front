// Mirrors the backend AuthTokens contract (POST /auth/{register,login,refresh}).
export interface ITokens {
  accessToken: string
  refreshToken: string
}

export interface ICredentials {
  email: string
  password: string
}

export type AuthMode = 'login' | 'register'
