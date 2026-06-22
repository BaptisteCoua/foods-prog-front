import { toast } from 'vue3-toastify'
import type { GoogleCredentialResponse } from '../types/google'

const GIS_SRC = 'https://accounts.google.com/gsi/client'

// Loads the Google Identity Services script exactly once (client-side only).
let scriptPromise: Promise<void> | null = null

const loadGisScript = (): Promise<void> => {
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GIS_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
    document.head.appendChild(script)
  })
  return scriptPromise
}

// Drives the "Continue with Google" button. The login form stays presentational:
// it hands us a target element and we render Google's button into it, exchange the
// returned ID token for our own JWTs, then route home (the onboarding gate sends
// brand-new accounts to /onboarding, so no need to distinguish login vs register).
export const useGoogleSignIn = (target: Ref<HTMLElement | null>) => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  const clientId = config.public.googleClientId

  const isEnabled = computed(() => Boolean(clientId))

  const handleCredential = async (response: GoogleCredentialResponse) => {
    try {
      await authStore.loginWithGoogle(response.credential)
      toast.success('Connecté avec Google !')
      await navigateTo('/')
    }
    catch {
      toast.error('La connexion Google a échoué.')
    }
  }

  onMounted(async () => {
    if (!import.meta.client || !isEnabled.value || !target.value) return
    try {
      await loadGisScript()
      const gis = window.google?.accounts.id
      if (!gis) return
      gis.initialize({
        client_id: clientId,
        callback: (response) => {
          void handleCredential(response)
        },
      })
      gis.renderButton(target.value, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        width: 320,
      })
    }
    catch {
      // Script blocked or offline: the form's email/password path still works.
      toast.error('Impossible de charger la connexion Google.')
    }
  })

  return { isEnabled }
}
