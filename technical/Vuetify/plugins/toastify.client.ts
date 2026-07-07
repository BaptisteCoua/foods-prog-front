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
    // 1500 ms was too short to read a message (surtout une erreur) ; 4 s laisse
    // le temps de lire tout en restant discret. vue3-toastify pose déjà role="alert".
    autoClose: 4000,
    position: 'top-center',
    // `auto` suit la préférence claire/sombre du système au lieu d'un thème figé
    // (un toast clair sur une app en mode sombre était inconfortable).
    theme: 'auto',
    hideProgressBar: true,
    clearOnUrlChange: false,
  } as ToastContainerOptions)
})
