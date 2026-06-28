import type { Me } from '../../../Profile/app/types/me'

// Current user's id + admin flag, read from GET /me. Shares the 'me' useAsyncData
// cache with the Profile layer (same key) so it isn't refetched. Used to show
// owner-only actions (edit/delete) and admin-only status moderation.
export const useCurrentUser = () => {
  const api = useApi()

  const { data: me } = useAsyncData<Me | null>('me', () => api<Me>('/me'))

  const userId = computed(() => me.value?.id ?? null)
  const isAdmin = computed(() => me.value?.role === 'ADMIN')

  return { me, userId, isAdmin }
}
