import { toast } from 'vue3-toastify'
import type { PantryLine } from '../types/pantry'
import { usePantry } from './usePantry'

// Orchestrates the Garde-manger screen: sorts the stock lines and owns the
// add/edit sheet and the delete-confirm state, wrapping the mutations with
// toasts. The stock itself is server-persisted (usePantry).
export const usePantryBoard = () => {
  const { lines, pending, error, refresh, setQuantity, remove } = usePantry()

  const sortedLines = computed(() =>
    [...lines.value].sort((a, b) => a.name.localeCompare(b.name, 'fr')),
  )
  const isEmpty = computed(
    () => !pending.value && !error.value && !lines.value.length,
  )

  // Add / edit sheet. `editingLine` null = add mode (pick an ingredient),
  // otherwise edit that line's quantity.
  const sheetOpen = ref(false)
  const editingLine = ref<PantryLine | null>(null)
  const openAdd = () => {
    editingLine.value = null
    sheetOpen.value = true
  }
  const openEdit = (line: PantryLine) => {
    editingLine.value = line
    sheetOpen.value = true
  }

  const isSaving = ref(false)
  // Both add and edit set the absolute available quantity for the ingredient.
  const save = async (ingredientId: number, quantity: number) => {
    isSaving.value = true
    try {
      await setQuantity({ ingredientId, quantity })
      toast.success('Stock mis à jour.')
      sheetOpen.value = false
    }
    catch {
      toast.error('Échec de l\'enregistrement.')
    }
    finally {
      isSaving.value = false
    }
  }

  // Delete confirm.
  const confirmTarget = ref<PantryLine | null>(null)
  const isDeleting = ref(false)
  const askDelete = (line: PantryLine) => {
    confirmTarget.value = line
  }
  const cancelDelete = () => {
    confirmTarget.value = null
  }
  const confirmDelete = async () => {
    if (!confirmTarget.value) return
    isDeleting.value = true
    try {
      await remove(confirmTarget.value.id)
      toast.success('Retiré du garde-manger.')
      confirmTarget.value = null
    }
    catch {
      toast.error('Suppression impossible.')
    }
    finally {
      isDeleting.value = false
    }
  }

  return {
    sortedLines,
    pending,
    error,
    isEmpty,
    refresh,
    sheetOpen,
    editingLine,
    openAdd,
    openEdit,
    save,
    isSaving,
    confirmTarget,
    isDeleting,
    askDelete,
    cancelDelete,
    confirmDelete,
  }
}
