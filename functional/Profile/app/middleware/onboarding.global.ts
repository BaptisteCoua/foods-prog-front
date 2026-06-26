const PUBLIC_ROUTES = ['/', '/login', '/register']

// After auth, force first-time users through the onboarding wizard: if they have
// no body profile yet, every route redirects to /onboarding (and vice-versa once
// it's done). Runs after the auth guard — bails out for anonymous users.
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return
  const authStore = useAuthStore()
  if (!authStore.isLoggedIn || PUBLIC_ROUTES.includes(to.path)) return

  const profileStore = useProfileStore()
  await profileStore.ensureLoaded()

  if (!profileStore.hasProfile && to.path !== '/onboarding') {
    return navigateTo('/onboarding')
  }

  if (profileStore.hasProfile && to.path === '/onboarding') {
    return navigateTo('/dashboard')
  }
})
