import { toast } from 'vue3-toastify'
import type { GoogleCodeClient, GoogleCodeResponse } from '../types/google'

const GIS_SRC = 'https://accounts.google.com/gsi/client'

// Scopes demandés au consentement. `profile` couvre nom/photo/locale/surnom ;
// les scopes `user.*.read` débloquent les champs People API (naissance, genre,
// adresse, téléphone). Ces 4 derniers sont « sensibles » → l'app doit être
// vérifiée par Google pour sortir du mode test (sinon écran d'avertissement).
const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/user.birthday.read',
  'https://www.googleapis.com/auth/user.gender.read',
  'https://www.googleapis.com/auth/user.addresses.read',
  'https://www.googleapis.com/auth/user.phonenumbers.read',
].join(' ')

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

// Drives the "Continue with Google" button via the authorization-code flow.
// On click we open Google's consent popup; the returned code goes to our
// backend, which exchanges it for tokens + People API profile data. The form
// stays presentational and just calls `signIn()` on a custom Vuetify button.
export const useGoogleSignIn = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  const clientId = config.public.googleClientId

  const isEnabled = computed(() => Boolean(clientId))
  const isLoading = ref(false)

  let codeClient: GoogleCodeClient | null = null

  const handleCode = async (response: GoogleCodeResponse) => {
    if (!response.code) {
      isLoading.value = false
      // L'utilisateur a fermé la popup ou refusé : pas une vraie erreur.
      return
    }
    try {
      await authStore.loginWithGoogle(response.code)
      toast.success('Connecté avec Google !')
      await navigateTo('/')
    }
    catch {
      toast.error('La connexion Google a échoué.')
    }
    finally {
      isLoading.value = false
    }
  }

  const signIn = async () => {
    if (!import.meta.client || !isEnabled.value || isLoading.value) return
    isLoading.value = true
    try {
      await loadGisScript()
      const oauth2 = window.google?.accounts.oauth2
      if (!oauth2) throw new Error('Google Identity Services unavailable')
      if (!codeClient) {
        codeClient = oauth2.initCodeClient({
          client_id: clientId,
          scope: GOOGLE_SCOPES,
          ux_mode: 'popup',
          callback: (response) => {
            void handleCode(response)
          },
        })
      }
      codeClient.requestCode()
    }
    catch {
      isLoading.value = false
      toast.error('Impossible de charger la connexion Google.')
    }
  }

  return { isEnabled, isLoading, signIn }
}
