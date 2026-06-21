// Clear the cached body profile when the session ends, so a different account
// logging in on the same browser re-fetches (and re-onboards) instead of seeing
// the previous user's profile. Profile depends on Auth, never the reverse.
export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  const profileStore = useProfileStore()

  watch(
    () => authStore.accessToken,
    (token) => {
      if (!token) profileStore.reset()
    },
  )
})
