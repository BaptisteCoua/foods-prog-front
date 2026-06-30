import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const currentDir = dirname(fileURLToPath(import.meta.url))

// Project branding layer: global styles + default page/layout transitions.
// Theme colour definitions live in app/utils/themes.ts (consumed by the
// Vuetify layer plugin via auto-import). The global stylesheet is referenced
// with an absolute path so it resolves correctly when this layer is extended.
export default defineNuxtConfig({
  modules: ['@nuxt/fonts'],
  app: {
    // Cross-fade entre pages (pas de `mode: out-in`) : les deux pages s'animent
    // en même temps pour un vrai fondu enchaîné. Cf. la transition `page` dans
    // app/assets/scss/app.scss.
    pageTransition: { name: 'page' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },
  css: [join(currentDir, 'app/assets/scss/app.scss')],
  // Self-hosted Inter (no CDN at runtime). @nuxt/fonts downloads the used
  // weights at build time.
  fonts: {
    families: [{ name: 'Inter', provider: 'google', weights: [400, 500, 600, 700, 800] }],
  },
})
