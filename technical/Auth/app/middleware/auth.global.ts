// Routes visible without a session: the public landing (`/`) + the auth screens.
const PUBLIC_ROUTES = ['/', '/login', '/register']

// Gate every route: unauthenticated users are sent to /login (except on a
// public route); authenticated users never sit on the landing or auth screens
// and are sent straight to their dashboard.
export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  const isPublic = PUBLIC_ROUTES.includes(to.path)

  if (!authStore.isLoggedIn && !isPublic) {
    return navigateTo('/login')
  }

  if (authStore.isLoggedIn && isPublic) {
    return navigateTo('/dashboard')
  }
})
