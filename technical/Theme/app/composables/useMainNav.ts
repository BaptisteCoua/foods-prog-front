interface MainNavItem {
  value: string
  to: string
  icon: string
  label: string
}

// Top-level mobile navigation entries + the currently active one (route-driven).
export const useMainNav = () => {
  const route = useRoute()

  const items: MainNavItem[] = [
    { value: 'home', to: '/', icon: 'mdi-home-variant-outline', label: 'Accueil' },
    { value: 'planning', to: '/planning', icon: 'mdi-calendar-blank-outline', label: 'Planning' },
    { value: 'recipes', to: '/recipes', icon: 'mdi-book-open-outline', label: 'Recettes' },
    { value: 'ingredients', to: '/ingredients', icon: 'mdi-food-apple-outline', label: 'Ingrédients' },
    { value: 'profile', to: '/profile', icon: 'mdi-account-outline', label: 'Profil' },
  ]

  const active = computed(() => {
    const match = items.find(item =>
      item.to === '/' ? route.path === '/' : route.path.startsWith(item.to),
    )
    return match?.value
  })

  return { items, active }
}
