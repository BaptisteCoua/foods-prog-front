import { toast } from 'vue3-toastify'
import type { Me } from '../types/me'

// Identité de l'utilisateur courant (pseudo, email, date d'inscription).
// Le pseudo est éditable via PATCH /me ; le cache est mis à jour localement.
export const useMe = () => {
  const api = useApi()

  const { data: me, pending, error, refresh } = useAsyncData<Me | null>(
    'me',
    () => api<Me>('/me'),
  )

  const savingName = ref(false)

  const updateDisplayName = async (displayName: string): Promise<boolean> => {
    savingName.value = true
    try {
      me.value = await api<Me>('/me', { method: 'PATCH', body: { displayName } })
      toast.success('Pseudo mis à jour.')
      return true
    }
    catch {
      toast.error('Impossible de mettre à jour le pseudo.')
      return false
    }
    finally {
      savingName.value = false
    }
  }

  return { me, pending, error, refresh, savingName, updateDisplayName }
}
