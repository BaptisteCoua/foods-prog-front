import { toast } from 'vue3-toastify'
import type {
  ImportUrlsResult,
  RecipeImportSummary,
  RecipePreviewItem,
  RecipePreviewResult,
  ScrapeFailure,
} from '../types/recipe-import'

// Plafond aligné sur le backend (DTO ImportUrlsDto) pour éviter les timeouts.
const MAX_URLS = 25

// Assistant d'import en 3 étapes : (1) coller les URLs → (2) aperçu des noms
// scrapés → (3) confirmer l'ajout (scrape + IA + insertion côté serveur).
export const useRecipeImport = () => {
  const api = useApi()

  const step = ref(1)
  const urlsText = ref('')
  const perServing = ref(true)
  const isLoading = ref(false)

  const previewRecipes = ref<RecipePreviewItem[]>([])
  const previewFailures = ref<ScrapeFailure[]>([])

  const summary = ref<RecipeImportSummary | null>(null)
  const importFailures = ref<ScrapeFailure[]>([])

  const parsedUrls = computed(() =>
    urlsText.value
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0),
  )

  // Étape 1 → 2 : scrape juste les noms (pas d'IA) pour valider la liste.
  const preview = async () => {
    const urls = parsedUrls.value
    if (urls.length === 0) {
      toast.error('Collez au moins une URL.')
      return
    }
    if (urls.length > MAX_URLS) {
      toast.error(`Maximum ${MAX_URLS} URLs à la fois.`)
      return
    }

    isLoading.value = true
    try {
      const result = await api<RecipePreviewResult>('/admin/recipes/preview-urls', {
        method: 'POST',
        body: { urls },
      })
      previewRecipes.value = result.recipes
      previewFailures.value = result.failures
      if (result.recipes.length === 0) {
        toast.error('Aucune recette trouvée sur ces adresses.')
        return
      }
      step.value = 2
    }
    catch {
      toast.error('Échec de la vérification des adresses.')
    }
    finally {
      isLoading.value = false
    }
  }

  // Étape 2 → 3 : ajoute réellement les recettes aperçues (scrape + IA + insert).
  const confirmImport = async () => {
    const urls = previewRecipes.value.map(recipe => recipe.url)
    if (urls.length === 0) return

    isLoading.value = true
    try {
      const result = await api<ImportUrlsResult>('/admin/recipes/import-urls', {
        method: 'POST',
        body: { urls, perServing: perServing.value },
      })
      summary.value = result.summary
      importFailures.value = result.failures
      toast.success(`${result.summary.importedRecipes.length} recette(s) ajoutée(s).`)
      step.value = 3
    }
    catch {
      toast.error('Échec de l\'ajout des recettes.')
    }
    finally {
      isLoading.value = false
    }
  }

  const backToUrls = () => {
    step.value = 1
  }

  const restart = () => {
    step.value = 1
    urlsText.value = ''
    previewRecipes.value = []
    previewFailures.value = []
    summary.value = null
    importFailures.value = []
  }

  return {
    step,
    urlsText,
    perServing,
    isLoading,
    parsedUrls,
    maxUrls: MAX_URLS,
    previewRecipes,
    previewFailures,
    summary,
    importFailures,
    preview,
    confirmImport,
    backToUrls,
    restart,
  }
}
