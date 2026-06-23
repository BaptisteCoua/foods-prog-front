import type { ICredentials, ITokens } from '../types/auth'

// Auth token pair shared app-wide (route guard, API client, app bar) → Pinia.
// Persisted so a refresh keeps the session. Auth endpoints are called directly
// here (no useApi) to keep the refresh flow free of recursion.
export const useAuthStore = defineStore('auth', () => {
  const config = useRuntimeConfig()

  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)

  const isLoggedIn = computed(() => Boolean(accessToken.value))

  const setTokens = (tokens: ITokens) => {
    accessToken.value = tokens.accessToken
    refreshToken.value = tokens.refreshToken
  }

  const clear = () => {
    accessToken.value = null
    refreshToken.value = null
  }

  const postAuth = (path: string, body: unknown) =>
    $fetch<ITokens>(path, {
      baseURL: config.public.apiBaseURL,
      method: 'POST',
      body,
    })

  const login = async (credentials: ICredentials) => {
    setTokens(await postAuth('/auth/login', credentials))
  }

  const register = async (credentials: ICredentials) => {
    setTokens(await postAuth('/auth/register', credentials))
  }

  const loginWithGoogle = async (code: string) => {
    setTokens(await postAuth('/auth/google', { code }))
  }

  const refreshTokens = async () => {
    if (!refreshToken.value) return false
    try {
      setTokens(await postAuth('/auth/refresh', { refreshToken: refreshToken.value }))
      return true
    }
    catch {
      clear()
      return false
    }
  }

  const logout = async () => {
    clear()
    await navigateTo('/login')
  }

  return {
    accessToken,
    refreshToken,
    isLoggedIn,
    login,
    register,
    loginWithGoogle,
    refreshTokens,
    logout,
    clear,
  }
}, {
  persist: true,
})
