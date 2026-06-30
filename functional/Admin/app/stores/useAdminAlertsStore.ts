import type { AdminAlert } from '../types/admin-alert'

// Shared admin-alert state: the header badge (in the default layout) and the
// /admin/alerts page are two unrelated consumers that must agree on the unread
// count, so it lives in Pinia. Mutations patch the local list in place to keep
// the badge in sync without a refetch. Admin-only endpoints (AdminGuard); the
// header only ever calls these when the current user is an admin.
export const useAdminAlertsStore = defineStore('admin-alerts', () => {
  const api = useApi()

  const alerts = ref<AdminAlert[]>([])
  const pending = ref(false)
  const loaded = ref(false)

  const unreadCount = computed(
    () => alerts.value.filter(alert => !alert.isRead).length,
  )

  const fetch = async () => {
    pending.value = true
    try {
      alerts.value = await api<AdminAlert[]>('/admin/alerts')
      loaded.value = true
    }
    finally {
      pending.value = false
    }
  }

  const markRead = async (id: number) => {
    const alert = alerts.value.find(item => item.id === id)
    if (!alert || alert.isRead) return
    alert.isRead = true
    await api(`/admin/alerts/${id}/read`, { method: 'PATCH' })
  }

  const markAllRead = async () => {
    if (!unreadCount.value) return
    alerts.value.forEach(alert => (alert.isRead = true))
    await api('/admin/alerts/read-all', { method: 'PATCH' })
  }

  const remove = async (id: number) => {
    alerts.value = alerts.value.filter(item => item.id !== id)
    await api(`/admin/alerts/${id}`, { method: 'DELETE' })
  }

  const clearAll = async () => {
    if (!alerts.value.length) return
    alerts.value = []
    await api('/admin/alerts', { method: 'DELETE' })
  }

  return {
    alerts,
    pending,
    loaded,
    unreadCount,
    fetch,
    markRead,
    markAllRead,
    remove,
    clearAll,
  }
})
