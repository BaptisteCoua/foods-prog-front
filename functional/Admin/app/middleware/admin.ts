import type { Me } from '../../../Profile/app/types/me'

// Réserve la route aux administrateurs : exige une session (le middleware
// d'auth global a déjà filtré), puis vérifie le rôle via GET /me. Tout échec
// (non connecté, non admin, /me en erreur) renvoie hors de la zone admin.
export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore()
  if (!authStore.isLoggedIn) return navigateTo('/login')

  const api = useApi()
  try {
    const me = await api<Me>('/me')
    if (me.role !== 'ADMIN') return navigateTo('/dashboard')
  }
  catch {
    return navigateTo('/dashboard')
  }
})
