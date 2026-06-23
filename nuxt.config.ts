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
  // SPA statique : l'app est une SPA bearer-auth, le SSR n'apporte rien et
  // permet un déploiement gratuit sur Cloudflare Pages (0 cold start).
  // Repasser à `true` (+ choisir un host SSR) suffit pour réactiver le SSR.
  ssr: false,
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
    functional: ['Dashboard', 'Profile', 'Ingredient', 'Recipe', 'Planning', 'ShoppingList'],
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
