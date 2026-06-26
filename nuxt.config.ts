import { defineOSDDNuxtConfig } from 'nuxt-osdd'

// OSDD project (nuxt-osdd). Business + technical concerns live in root-level
// functional/* and technical/* layer buckets; the `osdd` key wires them into
// `extends`. There is no `app/` directory at the project root.
export default defineOSDDNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@vite-pwa/nuxt',
  ],
  // SPA statique : l'app est une SPA bearer-auth, le SSR n'apporte rien et
  // permet un déploiement gratuit sur Cloudflare Pages (0 cold start).
  // Repasser à `true` (+ choisir un host SSR) suffit pour réactiver le SSR.
  ssr: false,
  components: [{ path: '~/components', pathPrefix: false }],
  devtools: { enabled: true },
  // Favicon = le logo feuille du header (AppLogo), pas l'icône Nuxt par défaut.
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'alternate icon', href: '/favicon.ico' },
      ],
    },
  },
  compatibilityDate: '2025-07-15',
  eslint: {
    config: {
      stylistic: true,
    },
  },
  osdd: {
    technical: ['Vuetify', 'Theme', 'ApiClient', 'Forms', 'Auth'],
    functional: ['Home', 'Dashboard', 'Profile', 'Ingredient', 'Recipe', 'Planning', 'ShoppingList'],
  },
  // @pinia/nuxt only auto-imports stores from the root srcDir by default, so the
  // per-layer stores/ folders are registered explicitly here.
  pinia: {
    storesDirs: [
      './technical/*/app/stores/**',
      './functional/*/app/stores/**',
    ],
  },
  // PWA installable (SPA bearer-auth). Le service worker ne met en cache que
  // l'app shell (JS/CSS/fonts) ; les appels API partent toujours au réseau →
  // données fraîches + auth préservée. Icônes générées depuis public/pwa-source.svg.
  pwa: {
    registerType: 'autoUpdate',
    pwaAssets: {
      image: 'public/pwa-source.svg',
      preset: 'minimal-2023',
    },
    manifest: {
      name: 'FoodProg',
      short_name: 'FoodProg',
      description: 'Nutrition personnelle : cible quotidienne, recettes, planning, courses.',
      lang: 'fr',
      theme_color: '#10B981',
      background_color: '#ffffff',
      display: 'standalone',
      start_url: '/',
    },
    workbox: {
      // SPA : toute route inconnue renvoie l'app shell, le routing client reprend la main.
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      // SW désactivé en `nuxt dev` pour éviter tout cache fantôme pendant l'itération.
      enabled: false,
    },
  },
})
