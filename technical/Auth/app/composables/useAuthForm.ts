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

  const submit = async () => {
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
      toast.error(
        mode === 'register'
          ? 'Impossible de créer le compte. E-mail déjà utilisé ?'
          : 'E-mail ou mot de passe incorrect.',
      )
    }
    finally {
      isSubmitting.value = false
    }
  }

  return { formRef, email, password, isSubmitting, submit }
}
