const PUBLIC_ROUTES = ['/login', '/register']

// Gate every route: unauthenticated users are sent to /login; authenticated
// users never see the auth screens.
export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  const isPublic = PUBLIC_ROUTES.includes(to.path)

  if (!authStore.isLoggedIn && !isPublic) {
    return navigateTo('/login')
  }

  if (authStore.isLoggedIn && isPublic) {
    return navigateTo('/')
  }
})
