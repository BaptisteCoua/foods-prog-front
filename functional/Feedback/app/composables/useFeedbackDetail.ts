import { toast } from 'vue3-toastify'
import type { FeedbackDetail, FeedbackStatus } from '../types/feedback'

// Drives the feedback detail page: load one entry with its replies, then vote
// (on the entry or a reply), reply, moderate the status (admin), and delete.
// Every mutation returns the full refreshed entry, so we just swap it in.
export const useFeedbackDetail = (id: MaybeRefOrGetter<number>) => {
  const api = useApi()
  const feedbackId = computed(() => toValue(id))

  const { data: feedback, pending, error, refresh } = useAsyncData(
    () => `feedback-${feedbackId.value}`,
    () => api<FeedbackDetail>(`/feedback/${feedbackId.value}`),
    { watch: [feedbackId] },
  )

  const posting = ref(false)
  const savingStatus = ref(false)

  const apply = (updated: FeedbackDetail) => {
    feedback.value = updated
  }

  const toggleVote = async () => {
    if (!feedback.value) return
    const method = feedback.value.hasVoted ? 'DELETE' : 'POST'
    try {
      apply(await api<FeedbackDetail>(`/feedback/${feedbackId.value}/vote`, { method }))
    }
    catch {
      toast.error('Le vote n\'a pas pu être enregistré.')
    }
  }

  const toggleReplyVote = async (replyId: number, hasVoted: boolean) => {
    const method = hasVoted ? 'DELETE' : 'POST'
    try {
      apply(await api<FeedbackDetail>(`/feedback/replies/${replyId}/vote`, { method }))
    }
    catch {
      toast.error('Le vote n\'a pas pu être enregistré.')
    }
  }

  const addReply = async (body: string): Promise<boolean> => {
    posting.value = true
    try {
      apply(await api<FeedbackDetail>(`/feedback/${feedbackId.value}/replies`, {
        method: 'POST',
        body: { body },
      }))
      return true
    }
    catch {
      toast.error('La réponse n\'a pas pu être publiée.')
      return false
    }
    finally {
      posting.value = false
    }
  }

  const removeReply = async (replyId: number) => {
    try {
      apply(await api<FeedbackDetail>(`/feedback/replies/${replyId}`, { method: 'DELETE' }))
      toast.success('Réponse supprimée.')
    }
    catch {
      toast.error('Suppression impossible.')
    }
  }

  const setStatus = async (status: FeedbackStatus) => {
    savingStatus.value = true
    try {
      apply(await api<FeedbackDetail>(`/feedback/${feedbackId.value}/status`, {
        method: 'PATCH',
        body: { status },
      }))
      toast.success('Statut mis à jour.')
    }
    catch {
      toast.error('Mise à jour du statut impossible.')
    }
    finally {
      savingStatus.value = false
    }
  }

  const remove = async (): Promise<boolean> => {
    try {
      await api(`/feedback/${feedbackId.value}`, { method: 'DELETE' })
      toast.success('Avis supprimé.')
      return true
    }
    catch {
      toast.error('Suppression impossible.')
      return false
    }
  }

  return {
    feedback,
    pending,
    error,
    refresh,
    posting,
    savingStatus,
    toggleVote,
    toggleReplyVote,
    addReply,
    removeReply,
    setStatus,
    remove,
  }
}
