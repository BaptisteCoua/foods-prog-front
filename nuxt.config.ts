import { defineOSDDNuxtConfig } from 'nuxt-osdd'

// OSDD project (nuxt-osdd). Business + technical concerns live in root-level
// functional/* and technical/* layer buckets; the `osdd` key wires them into
// `extends`. There is no `app/` directory at the project root.
export default defineOSDDNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
  ],
  components: [{ path: '~/components', pathPrefix: false }],
  devtools: { enabled: true },
  compatibilityDate: '2025-07-15',
  eslint: {
    config: {
      stylistic: true,
    },
  },
  osdd: {
    technical: ['Vuetify', 'Theme', 'ApiClient', 'Forms', 'Auth'],
    functional: ['Dashboard', 'Profile'],
  },
  // @pinia/nuxt only auto-imports stores from the root srcDir by default, so the
  // per-layer stores/ folders are registered explicitly here.
  pinia: {
    storesDirs: [
      './technical/*/app/stores/**',
      './functional/*/app/stores/**',
    ],
  },
})
