import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

// Notifications at Xefi use vue3-toastify (not v-snackbar). Registered client-side
// only; call `toast.success(...)` / `toast.error(...)` from anywhere.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Vue3Toastify, {
    autoClose: 3000,
    position: 'top-center',
    theme: 'colored',
    hideProgressBar: true,
  } as ToastContainerOptions)
})
