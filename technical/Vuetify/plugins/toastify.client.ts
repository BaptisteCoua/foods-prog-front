import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
// Habillage maison (verre dépoli, arrondis, accents de marque) par-dessus le CSS
// par défaut de la lib. Doit rester importé APRÈS index.css.
import '../assets/toastify.css'

// Notifications at Xefi use vue3-toastify (not v-snackbar). Registered client-side
// only; call `toast.success(...)` / `toast.error(...)` from anywhere.
// Thème `light` : nos overlays gèrent les fonds clairs + accents colorés par type.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Vue3Toastify, {
    autoClose: 1500,
    position: 'top-center',
    theme: 'light',
    hideProgressBar: true,
    clearOnUrlChange: false,
  } as ToastContainerOptions)
})
