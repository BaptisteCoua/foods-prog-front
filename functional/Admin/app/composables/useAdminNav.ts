export interface AdminNavItem {
  value: string
  to: string
  icon: string
  label: string
  // ADMIN strict ; sinon MODERATOR+ suffit (cf. usePermissions / @MinRole API).
  adminOnly?: boolean
  // Entrée porteuse du badge d'alertes non lues.
  badge?: boolean
}

// Entrées de l'espace admin, dans l'ordre d'affichage. Le mapping rôle suit les
// gardes API : alertes = modération (MODERATOR+), utilisateurs + recettes =
// admin strict. Le tableau de bord est l'entrée commune de la zone.
export const adminNavItems: AdminNavItem[] = [
  { value: 'dashboard', to: '/admin', icon: 'mdi-view-dashboard-outline', label: 'Tableau de bord' },
  { value: 'users', to: '/admin/users', icon: 'mdi-account-group-outline', label: 'Utilisateurs', adminOnly: true },
  { value: 'recipes', to: '/admin/recipes/import', icon: 'mdi-silverware-fork-knife', label: 'Recettes', adminOnly: true },
  { value: 'alerts', to: '/admin/alerts', icon: 'mdi-bell-outline', label: 'Alertes', badge: true },
]

// Entrées visibles pour l'utilisateur courant + helper d'activation. Le tableau
// de bord (`/admin`) ne s'active qu'en correspondance exacte (sinon il resterait
// actif sur toutes les sous-routes) ; les autres via startsWith pour englober
// les pages de détail.
export const useAdminNav = () => {
  const route = useRoute()
  const { isAdmin } = usePermissions()

  const items = computed(() =>
    adminNavItems.filter(item => !item.adminOnly || isAdmin.value),
  )

  const isActive = (item: AdminNavItem): boolean =>
    item.to === '/admin' ? route.path === '/admin' : route.path.startsWith(item.to)

  const activeValue = computed(
    () => items.value.find(isActive)?.value ?? 'dashboard',
  )

  return { items, isActive, activeValue }
}
