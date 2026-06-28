import { toast } from 'vue3-toastify'
import type {
  Feedback,
  FeedbackDetail,
  FeedbackPayload,
  FeedbackSort,
  FeedbackStatus,
  FeedbackType,
  Paginated,
} from '../types/feedback'

// Drives the feedback board: the shared list with status/type filters and
// votes/recent sorting, plus create and vote toggling. State is keyed
// ('feedback-board') so the board and detail page stay in sync; filters refetch
// from the API (the server owns sorting by the denormalised vote counter).
export const useFeedbackBoard = () => {
  const api = useApi()

  const statusFilter = ref<FeedbackStatus | null>(null)
  const typeFilter = ref<FeedbackType | null>(null)
  const sort = ref<FeedbackSort>('VOTES')

  const { data, pending, error, refresh } = useAsyncData(
    'feedback-board',
    () =>
      api<Paginated<Feedback>>('/feedback', {
        query: {
          limit: 100,
          sort: sort.value,
          ...(statusFilter.value ? { status: statusFilter.value } : {}),
          ...(typeFilter.value ? { type: typeFilter.value } : {}),
        },
      }),
    {
      watch: [statusFilter, typeFilter, sort],
      // Pas de cache : on refetch à chaque montage du board (donc au retour
      // d'un détail), pour refléter les votes / réponses / statuts modifiés là-bas.
      getCachedData: () => undefined,
    },
  )

  const items = computed(() => data.value?.items ?? [])
  const total = computed(() => data.value?.total ?? 0)
  const hasActiveFilter = computed(() =>
    Boolean(statusFilter.value || typeFilter.value),
  )

  const create = async (payload: FeedbackPayload) => {
    const created = await api<FeedbackDetail>('/feedback', {
      method: 'POST',
      body: payload,
    })
    await refresh()
    return created
  }

  const update = async (id: number, payload: FeedbackPayload) => {
    const updated = await api<FeedbackDetail>(`/feedback/${id}`, {
      method: 'PUT',
      body: payload,
    })
    await refresh()
    return updated
  }

  // Toggle the current user's upvote, then patch the affected row in place from
  // the API response (votesCount + hasVoted are authoritative).
  const toggleVote = async (item: Feedback) => {
    const method = item.hasVoted ? 'DELETE' : 'POST'
    try {
      const updated = await api<FeedbackDetail>(`/feedback/${item.id}/vote`, {
        method,
      })
      const row = data.value?.items.find(entry => entry.id === item.id)
      if (row) {
        row.votesCount = updated.votesCount
        row.hasVoted = updated.hasVoted
      }
    }
    catch {
      toast.error('Le vote n\'a pas pu être enregistré.')
    }
  }

  return {
    items,
    total,
    pending,
    error,
    refresh,
    statusFilter,
    typeFilter,
    sort,
    hasActiveFilter,
    create,
    update,
    toggleVote,
  }
}
