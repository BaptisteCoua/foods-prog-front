import type { Ingredient, Paginated } from '../../../Ingredient/app/types/ingredient'
import type { LogMealPayload } from '../../../Planning/app/types/planning'
import type { Recipe } from '../../../Recipe/app/types/recipe'

// A recently logged source, resolved back to its library entry so its current
// name / macros are always fresh.
export type RecentEntry
  = | { key: string, kind: 'RECIPE', recipe: Recipe }
    | { key: string, kind: 'INGREDIENT', ingredient: Ingredient }

interface RecentRef {
  kind: 'RECIPE' | 'INGREDIENT'
  id: number
}

const RECENTS_KEY = 'foodprog:log-recents'
const RECENTS_MAX = 6
// Combien de résultats on demande par type à l'API (recherche serveur).
const RESULT_LIMIT = 30
// Anti-rebond de la frappe avant de requêter l'API.
const SEARCH_DEBOUNCE_MS = 220

const readRecents = (): RecentRef[] => {
  if (!import.meta.client) return []
  try {
    const raw = localStorage.getItem(RECENTS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  }
  catch {
    return []
  }
}

// Feeds the quick-log sheet: searches the recipe library AND the ingredient
// library (both personal + global reference catalog) SERVER-SIDE, so every
// entry is reachable — not just the first page loaded client-side. Plus a
// localStorage-backed "recents" list (resolved by id) and the single
// POST /meals/log mutation. Nutrition is computed server-side; we only ever
// send ids + quantities (or free macros).
export const useMealLogger = () => {
  const api = useApi()

  // `clearable` on the search field can set this to null — keep it a string.
  const search = ref<string | null>('')
  // Terme réellement envoyé à l'API, débounce derrière `search`.
  const query = ref('')
  let debounce: ReturnType<typeof setTimeout> | null = null
  watch(search, (value) => {
    if (debounce) clearTimeout(debounce)
    debounce = setTimeout(() => {
      query.value = (value ?? '').trim()
    }, SEARCH_DEBOUNCE_MS)
  })

  // Recherche serveur : la clé inclut le terme → refetch à chaque changement.
  // Sans terme, l'API renvoie le début du catalogue (ordre alphabétique).
  // `/recipes` sans scope = mes recettes + catalogue global fusionnés.
  const { data: recipeData, pending: recipesPending } = useAsyncData(
    'log-recipes',
    () => api<Paginated<Recipe>>('/recipes', {
      query: { limit: RESULT_LIMIT, search: query.value || undefined },
    }),
    { watch: [query] },
  )

  const { data: ingredientData, pending: ingredientsPending } = useAsyncData(
    'log-ingredients',
    () => api<Paginated<Ingredient>>('/ingredients', {
      query: { limit: RESULT_LIMIT, search: query.value || undefined },
    }),
    { watch: [query] },
  )

  const recipeResults = computed<Recipe[]>(() => recipeData.value?.items ?? [])
  const ingredientResults = computed<Ingredient[]>(() => ingredientData.value?.items ?? [])
  const pending = computed(() => recipesPending.value || ingredientsPending.value)

  // Résout les refs récents en entrées fraîches (par id), en écartant celles qui
  // n'existent plus. Peu d'appels (≤ 6), uniquement à l'ouverture de la feuille.
  const resolveRecents = async (): Promise<RecentEntry[]> => {
    const refs = readRecents()
    const resolved = await Promise.all(
      refs.map(async (ref): Promise<RecentEntry | null> => {
        try {
          if (ref.kind === 'RECIPE') {
            const recipe = await api<Recipe>(`/recipes/${ref.id}`)
            return { key: `r-${ref.id}`, kind: 'RECIPE', recipe }
          }
          const ingredient = await api<Ingredient>(`/ingredients/${ref.id}`)
          return { key: `i-${ref.id}`, kind: 'INGREDIENT', ingredient }
        }
        catch {
          return null
        }
      }),
    )
    return resolved.filter((entry): entry is RecentEntry => entry !== null)
  }

  const { data: recentsData, refresh: refreshRecents } = useAsyncData(
    'log-recents',
    resolveRecents,
  )
  const recents = computed<RecentEntry[]>(() => recentsData.value ?? [])

  const rememberRecent = (kind: 'RECIPE' | 'INGREDIENT', id: number) => {
    const next = [{ kind, id }, ...readRecents().filter(r => !(r.kind === kind && r.id === id))]
      .slice(0, RECENTS_MAX)
    if (import.meta.client) {
      try {
        localStorage.setItem(RECENTS_KEY, JSON.stringify(next))
      }
      catch {
        // localStorage unavailable (private mode) — recents are best-effort.
      }
    }
  }

  const log = async (payload: LogMealPayload): Promise<void> => {
    await api('/meals/log', { method: 'POST', body: payload })
    if (payload.item.kind === 'RECIPE') rememberRecent('RECIPE', payload.item.recipe.id)
    else if (payload.item.kind === 'INGREDIENT') rememberRecent('INGREDIENT', payload.item.ingredient.id)
  }

  // Remet la feuille à zéro : vide la recherche (immédiatement, sans attendre le
  // debounce) et recharge les récents depuis le stockage local.
  const reset = () => {
    search.value = ''
    query.value = ''
    refreshRecents()
  }

  return {
    search,
    pending,
    recipeResults,
    ingredientResults,
    recents,
    log,
    reset,
  }
}
