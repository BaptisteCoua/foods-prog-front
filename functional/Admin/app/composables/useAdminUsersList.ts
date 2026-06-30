import { toast } from 'vue3-toastify'
import type { SubscriptionPlan, UserRole } from '../../../Profile/app/types/me'
import type { AdminUser, Paginated } from '../types/admin-user'

// 10 par page (demandé). Liste paginée des comptes pour la page admin.
const PAGE_SIZE = 10

// Charge la liste paginée des utilisateurs depuis GET /admin/users. La page est
// pilotée par le tableau (v-data-table-server) via loadPage. Pas de store : la
// donnée est propre à la page admin, pas partagée dans l'app.
// Champs triables, alignés sur le DTO côté API (admin-users-query.dto.ts).
export type AdminUserSortField = 'createdAt' | 'role' | 'plan'

export const useAdminUsersList = () => {
  const api = useApi()

  const items = ref<AdminUser[]>([])
  const total = ref(0)
  const page = ref(1)
  const pending = ref(false)
  const error = ref(false)

  // Tri (par défaut : plus récent d'abord) + filtres optionnels rôle/abonnement.
  // Tout est envoyé à l'API ; le tri/filtre est serveur (la liste est paginée,
  // un tri client ne porterait que sur les 10 lignes visibles → trompeur).
  const sortBy = ref<AdminUserSortField>('createdAt')
  const sortDir = ref<'asc' | 'desc'>('desc')
  const roleFilter = ref<UserRole | null>(null)
  const planFilter = ref<SubscriptionPlan | null>(null)

  const loadPage = async (targetPage: number): Promise<void> => {
    pending.value = true
    error.value = false
    try {
      const result = await api<Paginated<AdminUser>>('/admin/users', {
        query: {
          page: targetPage,
          limit: PAGE_SIZE,
          sortBy: sortBy.value,
          sortDir: sortDir.value,
          ...(roleFilter.value ? { role: roleFilter.value } : {}),
          ...(planFilter.value ? { plan: planFilter.value } : {}),
        },
      })
      items.value = result.items
      total.value = result.total
      page.value = result.page
    }
    catch {
      error.value = true
      items.value = []
      total.value = 0
    }
    finally {
      pending.value = false
    }
  }

  // Met à jour le rôle et/ou l'abonnement d'un compte (PATCH /admin/users/:id).
  // Optimiste : on patche la ligne en place puis on confirme avec la réponse
  // serveur ; en cas d'échec on restaure l'état précédent. Le backend refuse de
  // changer son propre rôle (CANNOT_CHANGE_OWN_ROLE) — la ligne self est de
  // toute façon non éditable côté UI.
  const updateUser = async (
    id: number,
    payload: { role?: UserRole, plan?: SubscriptionPlan },
  ): Promise<void> => {
    const target = items.value.find(user => user.id === id)
    if (!target) return

    const previous = { role: target.role, plan: target.plan }
    if (payload.role) target.role = payload.role
    if (payload.plan) target.plan = payload.plan

    try {
      const updated = await api<AdminUser>(`/admin/users/${id}`, {
        method: 'PATCH',
        body: payload,
      })
      Object.assign(target, updated)
      toast.success('Compte mis à jour')
    }
    catch {
      target.role = previous.role
      target.plan = previous.plan
      toast.error('Mise à jour impossible')
    }
  }

  // Bascule le tri sur une colonne : (ré)active la colonne en ASC, puis alterne
  // ASC ↔ DESC aux clics suivants. Recharge toujours depuis la page 1.
  const toggleSort = (field: AdminUserSortField): void => {
    if (sortBy.value === field) {
      sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
    }
    else {
      sortBy.value = field
      sortDir.value = 'asc'
    }
    void loadPage(1)
  }

  // Applique un filtre (null = « tous ») et revient à la page 1.
  const setRoleFilter = (role: UserRole | null): void => {
    roleFilter.value = role
    void loadPage(1)
  }

  const setPlanFilter = (plan: SubscriptionPlan | null): void => {
    planFilter.value = plan
    void loadPage(1)
  }

  return {
    items,
    total,
    page,
    pending,
    error,
    pageSize: PAGE_SIZE,
    sortBy,
    sortDir,
    roleFilter,
    planFilter,
    loadPage,
    updateUser,
    toggleSort,
    setRoleFilter,
    setPlanFilter,
  }
}
