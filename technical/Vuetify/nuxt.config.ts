import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// Generic Vuetify package wiring — reusable across any Xefi Nuxt project.
// Project-specific colours/branding live in the Theme layer, not here.
export default defineNuxtConfig({
  css: [
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.css',
  ],
  build: { transpile: ['vuetify'] },
  vite: {
    vue: { template: { transformAssetUrls } },
    plugins: [vuetify({ autoImport: true })],
  },
})
