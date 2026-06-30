import type { Me, SubscriptionPlan, UserRole } from '../types/me'

// Permissions de l'utilisateur courant, lues depuis GET /me. Source unique pour
// le gating (rôle ET abonnement) : réutilise le cache useAsyncData('me') partagé
// avec useMe / useCurrentUser (même clé → pas de refetch).
//
// Deux axes orthogonaux :
// - rôle (pouvoir)     : USER < MODERATOR (sous-admin) < ADMIN ;
// - abonnement (payant): FREE < PREMIUM.
export const usePermissions = () => {
  const api = useApi()

  const { data: me } = useAsyncData<Me | null>('me', () => api<Me>('/me'))

  const userId = computed(() => me.value?.id ?? null)
  const role = computed<UserRole | null>(() => me.value?.role ?? null)
  const plan = computed<SubscriptionPlan | null>(() => me.value?.plan ?? null)

  const isAdmin = computed(() => role.value === 'ADMIN')
  // Modération ouverte au sous-admin (MODERATOR) et à l'admin.
  const canModerate = computed(
    () => role.value === 'ADMIN' || role.value === 'MODERATOR',
  )
  const isPremium = computed(() => plan.value === 'PREMIUM')

  return { me, userId, role, plan, isAdmin, canModerate, isPremium }
}
