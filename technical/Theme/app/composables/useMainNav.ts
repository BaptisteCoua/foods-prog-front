export interface MainNavItem {
  value: string
  to: string
  icon: string
  label: string
}

// Top-level mobile navigation entries, in swipe order (left ⇄ right).
// Shared as a module constant so both the nav UI and the swipe/transition
// logic agree on the order without re-instantiating the composable.
export const mainNavItems: MainNavItem[] = [
  { value: 'home', to: '/dashboard', icon: 'mdi-home-variant-outline', label: 'Accueil' },
  { value: 'planning', to: '/planning', icon: 'mdi-calendar-blank-outline', label: 'Planning' },
  { value: 'recipes', to: '/recipes', icon: 'mdi-pot-steam-outline', label: 'Recettes' },
  // [EXPERIMENT nav] Courses + Ingrédients déplacés vers les actions mises en
  // évidence de la page Planning. Décommenter ces deux lignes pour revenir à
  // l'ancien menu du bas à 6 entrées.
  // { value: 'shopping', to: '/shopping-list', icon: 'mdi-cart-outline', label: 'Courses' },
  // { value: 'ingredients', to: '/ingredients', icon: 'mdi-food-apple-outline', label: 'Ingrédients' },
  { value: 'profile', to: '/profile', icon: 'mdi-account-outline', label: 'Profil' },
]

// Index of the top-level nav entry matching a path (-1 when off the nav, e.g.
// a detail page like /recipes/42 still maps to its section via startsWith).
export const mainNavIndexOf = (path: string): number =>
  mainNavItems.findIndex(item => path.startsWith(item.to))

// Top-level mobile navigation entries + the currently active one (route-driven).
export const useMainNav = () => {
  const route = useRoute()

  const active = computed(() => mainNavItems[mainNavIndexOf(route.path)]?.value)

  return { items: mainNavItems, active }
}
