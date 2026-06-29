// Routes visible without a session: the public landing (`/`) + the auth screens.
const PUBLIC_ROUTES = ['/', '/login', '/register']

// Routes ouvertes à TOUS (connecté ou non), sans redirection : les pages
// légales doivent rester accessibles aux visiteurs anonymes (vérification
// OAuth Google) comme aux utilisateurs connectés (liens en pied de page).
const OPEN_ROUTES = ['/privacy', '/terms']

// Gate every route: unauthenticated users are sent to /login (except on a
// public route); authenticated users never sit on the landing or auth screens
// and are sent straight to their dashboard.
export default defineNuxtRouteMiddleware((to) => {
  if (OPEN_ROUTES.includes(to.path)) return

  const authStore = useAuthStore()
  const isPublic = PUBLIC_ROUTES.includes(to.path)

  if (!authStore.isLoggedIn && !isPublic) {
    return navigateTo('/login')
  }

  if (authStore.isLoggedIn && isPublic) {
    return navigateTo('/dashboard')
  }
})
