import { toast } from 'vue3-toastify'
import type {
  NutritionProposal,
  NutritionTarget,
  NutritionTargetPayload,
} from '../types/target'

const roundPayload = (values: NutritionProposal): NutritionTargetPayload => ({
  calories: Math.round(values.calories),
  proteinG: Math.round(values.proteinG),
  carbG: Math.round(values.carbG),
  fatG: Math.round(values.fatG),
})

// Cible journalière : valeur effective + proposition recalculée depuis le profil.
// `saveTarget` fige une cible personnalisée ; `applyProposal` adopte la proposition.
export const useNutritionTarget = () => {
  const api = useApi()

  const { data, pending, error, refresh } = useAsyncData('me-target', async () => {
    const [target, proposal] = await Promise.all([
      api<NutritionTarget>('/me/target'),
      api<NutritionProposal>('/me/target/proposal').catch(() => null),
    ])
    return { target, proposal }
  })

  const target = computed(() => data.value?.target ?? null)
  const proposal = computed(() => data.value?.proposal ?? null)
  const isCustom = computed(() => target.value?.isCustom ?? false)
  const saving = ref(false)

  // La proposition diffère de la cible effective (comparaison sur valeurs arrondies).
  const proposalDiffers = computed(() => {
    const t = target.value
    const p = proposal.value
    if (!t || !p) return false
    const a = roundPayload(t)
    const b = roundPayload(p)
    return (
      a.calories !== b.calories
      || a.proteinG !== b.proteinG
      || a.carbG !== b.carbG
      || a.fatG !== b.fatG
    )
  })

  const saveTarget = async (payload: NutritionTargetPayload): Promise<boolean> => {
    saving.value = true
    try {
      const updated = await api<NutritionTarget>('/me/target', {
        method: 'PUT',
        body: payload,
      })
      if (data.value) data.value.target = updated
      toast.success('Cible mise à jour.')
      return true
    }
    catch {
      toast.error('Impossible de mettre à jour la cible.')
      return false
    }
    finally {
      saving.value = false
    }
  }

  const applyProposal = async (): Promise<boolean> => {
    if (!proposal.value) return false
    return saveTarget(roundPayload(proposal.value))
  }

  return {
    target,
    proposal,
    isCustom,
    proposalDiffers,
    pending,
    error,
    refresh,
    saving,
    saveTarget,
    applyProposal,
  }
}
