import { toast } from 'vue3-toastify'
import type { VForm } from 'vuetify/components'
import type { AuthMode } from '../types/auth'

// Drives both the login and register screens. Components stay presentational —
// fields, rules, submit state and the API call all live here.
export const useAuthForm = (mode: AuthMode) => {
  const authStore = useAuthStore()

  const formRef = ref<VForm | null>(null)
  const email = ref('')
  const password = ref('')
  const isSubmitting = ref(false)
  // Persistent, form-anchored error surface (in addition to the transient toast):
  // rendered in a role="alert" region so screen readers announce it and it stays
  // visible until the next attempt — the toast alone auto-dismisses and is easy to miss.
  const errorMessage = ref('')

  const submit = async () => {
    errorMessage.value = ''
    const validation = await formRef.value?.validate()
    if (!validation?.valid) return

    isSubmitting.value = true
    try {
      const credentials = { email: email.value, password: password.value }
      if (mode === 'register') await authStore.register(credentials)
      else await authStore.login(credentials)

      toast.success(mode === 'register' ? 'Compte créé, bienvenue !' : 'Content de te revoir !')
      // New accounts go straight to the onboarding wizard; the gate middleware
      // also enforces this, but redirecting here avoids a flash of the dashboard.
      await navigateTo(mode === 'register' ? '/onboarding' : '/dashboard')
    }
    catch {
      errorMessage.value = mode === 'register'
        ? 'Impossible de créer le compte. E-mail déjà utilisé ?'
        : 'E-mail ou mot de passe incorrect.'
      toast.error(errorMessage.value)
    }
    finally {
      isSubmitting.value = false
    }
  }

  return { formRef, email, password, isSubmitting, errorMessage, submit }
}
