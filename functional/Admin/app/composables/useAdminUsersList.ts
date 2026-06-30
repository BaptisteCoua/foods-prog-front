import type { AdminUser, Paginated } from '../types/admin-user'

// 10 par page (demandé). Liste paginée des comptes pour la page admin.
const PAGE_SIZE = 10

// Charge la liste paginée des utilisateurs depuis GET /admin/users. La page est
// pilotée par le tableau (v-data-table-server) via loadPage. Pas de store : la
// donnée est propre à la page admin, pas partagée dans l'app.
export const useAdminUsersList = () => {
  const api = useApi()

  const items = ref<AdminUser[]>([])
  const total = ref(0)
  const page = ref(1)
  const pending = ref(false)
  const error = ref(false)

  const loadPage = async (targetPage: number): Promise<void> => {
    pending.value = true
    error.value = false
    try {
      const result = await api<Paginated<AdminUser>>('/admin/users', {
        query: { page: targetPage, limit: PAGE_SIZE },
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

  return { items, total, page, pending, error, pageSize: PAGE_SIZE, loadPage }
}
