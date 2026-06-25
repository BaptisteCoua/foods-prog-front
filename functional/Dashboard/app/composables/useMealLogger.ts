import type { Ingredient } from '../../../Ingredient/app/types/ingredient'
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

// Feeds the quick-log sheet: the user's recipe library and ingredient library
// (both reused, shared, client-side searched) plus a localStorage-backed
// "recents" list — and the single POST /meals/log mutation. Nutrition is
// computed server-side; we only ever send ids + quantities (or free macros).
export const useMealLogger = () => {
  const api = useApi()
  const { items: recipes, pending: recipesPending } = useRecipes()
  const { items: ingredients, pending: ingredientsPending } = useIngredients()

  // `clearable` on the search field can set this to null — keep it a string.
  const search = ref<string | null>('')
  const pending = computed(() => recipesPending.value || ingredientsPending.value)

  const recipeResults = computed<Recipe[]>(() => {
    const query = (search.value ?? '').trim().toLowerCase()
    const base = [...recipes.value].sort((a, b) => a.name.localeCompare(b.name, 'fr'))
    return query ? base.filter(recipe => recipe.name.toLowerCase().includes(query)) : base
  })

  const ingredientResults = computed<Ingredient[]>(() => {
    const query = (search.value ?? '').trim().toLowerCase()
    const base = [...ingredients.value].sort((a, b) => a.name.localeCompare(b.name, 'fr'))
    return query ? base.filter(item => item.name.toLowerCase().includes(query)) : base
  })

  const recentRefs = ref<RecentRef[]>(readRecents())

  // Resolve refs to live library entries, dropping any that no longer exist.
  const recents = computed<RecentEntry[]>(() =>
    recentRefs.value.flatMap((ref): RecentEntry[] => {
      if (ref.kind === 'RECIPE') {
        const recipe = recipes.value.find(item => item.id === ref.id)
        return recipe ? [{ key: `r-${ref.id}`, kind: 'RECIPE', recipe }] : []
      }
      const ingredient = ingredients.value.find(item => item.id === ref.id)
      return ingredient ? [{ key: `i-${ref.id}`, kind: 'INGREDIENT', ingredient }] : []
    }),
  )

  const rememberRecent = (kind: 'RECIPE' | 'INGREDIENT', id: number) => {
    const next = [{ kind, id }, ...recentRefs.value.filter(r => !(r.kind === kind && r.id === id))]
      .slice(0, RECENTS_MAX)
    recentRefs.value = next
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

  const reset = () => {
    search.value = ''
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
