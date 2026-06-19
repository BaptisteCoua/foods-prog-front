import { createVuetify } from 'vuetify'

// Generic createVuetify wiring. Theme definitions (`appThemes`, `DEFAULT_THEME`)
// are provided by the Theme layer and auto-imported across layers.
export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    theme: {
      defaultTheme: DEFAULT_THEME,
      themes: appThemes,
    },
    icons: { defaultSet: 'mdi' },
    defaults: {
      VBtn: { rounded: 'lg', class: 'text-none' },
      VCard: { rounded: 'xl' },
      VTextField: { variant: 'outlined', rounded: 'lg' },
      VTextarea: { variant: 'outlined', rounded: 'lg' },
      VSelect: { variant: 'outlined', rounded: 'lg' },
      VAutocomplete: { variant: 'outlined', rounded: 'lg' },
      VSheet: { rounded: 'xl' },
    },
  })

  nuxtApp.vueApp.use(vuetify)
})
