import { toast } from 'vue3-toastify'
import type { VForm } from 'vuetify/components'
import type { Feedback, FeedbackPayload, FeedbackType } from '../types/feedback'

interface FeedbackFormState {
  title: string
  description: string
  type: FeedbackType
}

const createForm = (): FeedbackFormState => ({
  title: '',
  description: '',
  type: 'FEATURE',
})

// Owns the create/edit feedback dialog: open state, form, validation and the
// submit mapping to the API payload. Reuses the board's create/update so the
// shared 'feedback-board' cache refreshes after a save.
export const useFeedbackForm = () => {
  const { create, update } = useFeedbackBoard()
  const { required } = useValidationRules()

  const dialogOpen = ref(false)
  const editingId = ref<number | null>(null)
  const isSaving = ref(false)
  const formRef = ref<VForm | null>(null)
  const form = reactive<FeedbackFormState>(createForm())

  const isEditing = computed(() => editingId.value !== null)
  const title = computed(() => (isEditing.value ? 'Modifier l\'avis' : 'Nouvel avis'))

  const reset = () => {
    Object.assign(form, createForm())
  }

  const openCreate = () => {
    reset()
    editingId.value = null
    dialogOpen.value = true
  }

  const openEdit = (feedback: Feedback) => {
    editingId.value = feedback.id
    Object.assign(form, {
      title: feedback.title,
      description: feedback.description,
      type: feedback.type,
    })
    dialogOpen.value = true
  }

  const close = () => {
    dialogOpen.value = false
  }

  const buildPayload = (): FeedbackPayload => ({
    title: form.title.trim(),
    description: form.description.trim(),
    type: form.type,
  })

  const submit = async () => {
    const validation = await formRef.value?.validate()
    if (!validation?.valid) return

    isSaving.value = true
    try {
      const payload = buildPayload()
      const feedback = editingId.value !== null
        ? await update(editingId.value, payload)
        : await create(payload)
      toast.success(isEditing.value ? 'Avis mis à jour.' : 'Avis publié.')
      close()
      return feedback
    }
    catch {
      toast.error('Échec de l\'enregistrement.')
    }
    finally {
      isSaving.value = false
    }
  }

  return {
    dialogOpen,
    isEditing,
    isSaving,
    formRef,
    form,
    title,
    rules: { required },
    openCreate,
    openEdit,
    close,
    submit,
  }
}
