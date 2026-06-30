import type { Me } from '../../../Profile/app/types/me'

// Réserve la route aux modérateurs (sous-admins) et plus : exige une session
// (le middleware d'auth global a déjà filtré), puis vérifie le rôle via GET /me.
// Tout échec (non connecté, rôle insuffisant, /me en erreur) renvoie hors zone.
export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore()
  if (!authStore.isLoggedIn) return navigateTo('/login')

  const api = useApi()
  try {
    const me = await api<Me>('/me')
    if (me.role !== 'ADMIN' && me.role !== 'MODERATOR') {
      return navigateTo('/dashboard')
    }
  }
  catch {
    return navigateTo('/dashboard')
  }
})
