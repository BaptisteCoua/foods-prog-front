import type { AdminUser, Paginated } from '../types/admin-user'

// Statistiques du tableau de bord admin, assemblées côté front à partir des
// endpoints existants (pas d'endpoint d'agrégat dédié) :
// - total utilisateurs : `total` de GET /admin/users (réservé ADMIN) ;
// - alertes non lues    : compteur du store partagé (MODERATOR+).
// Un MODERATOR n'a pas accès à /admin/users → on ne tente l'appel que pour un
// ADMIN, sinon la carte « utilisateurs » reste masquée.
export const useAdminDashboard = () => {
  const api = useApi()
  const { isAdmin, me } = usePermissions()
  const { unreadCount } = useAlertsBadge()

  const usersTotal = ref<number | null>(null)
  const pending = ref(false)
  const error = ref(false)

  const loadUsersTotal = async (): Promise<void> => {
    if (!isAdmin.value) return
    pending.value = true
    error.value = false
    try {
      // limit=1 : on ne veut que le `total`, pas la liste.
      const result = await api<Paginated<AdminUser>>('/admin/users', {
        query: { page: 1, limit: 1 },
      })
      usersTotal.value = result.total
    }
    catch {
      error.value = true
    }
    finally {
      pending.value = false
    }
  }

  return { me, isAdmin, usersTotal, unreadCount, pending, error, loadUsersTotal }
}
