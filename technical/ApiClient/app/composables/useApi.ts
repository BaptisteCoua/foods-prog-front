import type { FetchError, FetchOptions } from 'ofetch'

type ApiOptions = FetchOptions & { _retry?: boolean }

// Configured fetch for protected endpoints: injects the Bearer access token and,
// on a 401, transparently refreshes the token pair once and replays the request.
// Auth endpoints (login/register/refresh) talk to the backend directly from the
// auth store and do NOT go through this — that avoids any refresh recursion.
export const useApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const baseFetch = $fetch.create({
    baseURL: config.public.apiBaseURL,
    onRequest({ options }) {
      const token = authStore.accessToken
      if (token) {
        const headers = new Headers(options.headers)
        headers.set('Authorization', `Bearer ${token}`)
        options.headers = headers
      }
    },
  })

  const call = async <T>(request: string, options: ApiOptions = {}): Promise<T> => {
    try {
      return await baseFetch<T>(request, options as FetchOptions)
    }
    catch (error) {
      const status = (error as FetchError).statusCode
      const canRetry = status === 401 && !options._retry && Boolean(authStore.refreshToken)

      if (!canRetry) throw error

      const refreshed = await authStore.refreshTokens()
      if (!refreshed) {
        await authStore.logout()
        throw error
      }

      return await baseFetch<T>(request, { ...options, _retry: true } as FetchOptions)
    }
  }

  return call
}
