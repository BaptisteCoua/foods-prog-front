// Persisted user preference for the active Vuetify theme. Shared across the app
// (toggle in the app bar, applied by useAppTheme), so it lives in Pinia.
export const useThemeStore = defineStore('theme', () => {
  const name = ref<string>(DEFAULT_THEME)

  const isDark = computed(() => name.value === THEME_DARK)

  const toggle = () => {
    name.value = isDark.value ? THEME_LIGHT : THEME_DARK
  }

  return { name, isDark, toggle }
}, {
  persist: true,
})
