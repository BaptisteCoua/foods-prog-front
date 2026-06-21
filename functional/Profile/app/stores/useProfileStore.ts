import type { FetchError } from 'ofetch'
import type { BodyProfile, BodyProfilePayload } from '../types/profile'

// Body profile, shared across the app (onboarding gate, dashboard, profile screen).
// Not persisted: it always reflects the server. `loaded` caches the
// has-profile-or-not answer so the gate middleware fetches at most once per load.
export const useProfileStore = defineStore('profile', () => {
  const profile = ref<BodyProfile | null>(null)
  const loaded = ref(false)

  const hasProfile = computed(() => profile.value !== null)

  const ensureLoaded = async () => {
    if (loaded.value) return
    const api = useApi()
    try {
      profile.value = await api<BodyProfile>('/me/profile')
      loaded.value = true
    }
    catch (error) {
      // 404 = the user has no profile yet → send them through onboarding.
      // Any other error is a real failure: don't cache it as "no profile",
      // so the next navigation retries instead of trapping the user.
      if ((error as FetchError).statusCode === 404) {
        profile.value = null
        loaded.value = true
      }
    }
  }

  const save = async (payload: BodyProfilePayload) => {
    const api = useApi()
    profile.value = await api<BodyProfile>('/me/profile', { method: 'PUT', body: payload })
    loaded.value = true
  }

  const reset = () => {
    profile.value = null
    loaded.value = false
  }

  return { profile, hasProfile, loaded, ensureLoaded, save, reset }
})
