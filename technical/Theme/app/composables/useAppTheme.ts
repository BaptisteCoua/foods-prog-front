import { useTheme } from 'vuetify'

// Bridges the persisted theme preference (Pinia) with Vuetify's runtime theme.
// Components consume this — they never touch `useTheme()` directly.
export const useAppTheme = () => {
  const vuetifyTheme = useTheme()
  const themeStore = useThemeStore()
  const { name, isDark } = storeToRefs(themeStore)

  // Keep Vuetify in sync with the stored preference (incl. after persisted
  // rehydration on the client).
  watch(name, value => vuetifyTheme.change(value), { immediate: true })

  return {
    isDark,
    toggle: themeStore.toggle,
  }
}
