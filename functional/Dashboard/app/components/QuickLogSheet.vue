<template>
  <AppSheet
    :model-value="modelValue"
    :max-width="560"
    full-height
    :title="headTitle"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="log">
      <!-- Header -->
      <div class="log__head">
        <button
          v-if="view !== 'list'"
          type="button"
          class="log__back"
          @click="back"
        >
          <v-icon
            icon="mdi-chevron-left"
            size="18"
          />
          Retour
        </button>
        <h2 class="log__title">
          {{ headTitle }}
        </h2>
      </div>

      <!-- Context: which slot, which day -->
      <div class="log__ctx">
        <div class="log__chips">
          <button
            v-for="s in SLOTS"
            :key="s.value"
            type="button"
            class="log__chip"
            :class="{ 'log__chip--on': slot === s.value }"
            @click="slot = s.value"
          >
            {{ s.label }}
          </button>
        </div>
        <div class="log__chips">
          <button
            type="button"
            class="log__chip"
            :class="{ 'log__chip--on': day === 'today' }"
            @click="day = 'today'"
          >
            Aujourd'hui
          </button>
          <button
            type="button"
            class="log__chip"
            :class="{ 'log__chip--on': day === 'yesterday' }"
            @click="day = 'yesterday'"
          >
            Hier
          </button>
        </div>
      </div>

      <!-- LIST -->
      <template v-if="view === 'list'">
        <v-text-field
          v-model="search"
          placeholder="Rechercher une recette ou un aliment"
          prepend-inner-icon="mdi-magnify"
          density="comfortable"
          variant="solo-filled"
          flat
          hide-details
          clearable
          autofocus
          class="log__search"
        />

        <div
          class="log__segments"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            :aria-selected="kindFilter === 'all'"
            class="log__segment"
            :class="{ 'log__segment--active': kindFilter === 'all' }"
            @click="kindFilter = 'all'"
          >
            Tout
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="kindFilter === 'recipes'"
            class="log__segment"
            :class="{ 'log__segment--active': kindFilter === 'recipes' }"
            @click="kindFilter = 'recipes'"
          >
            Recettes
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="kindFilter === 'ingredients'"
            class="log__segment"
            :class="{ 'log__segment--active': kindFilter === 'ingredients' }"
            @click="kindFilter = 'ingredients'"
          >
            Aliments
          </button>
        </div>

        <button
          type="button"
          class="log__free-row"
          @click="openFree"
        >
          <span class="log__opt-ico">⚡</span>
          <span class="log__opt-main">
            <span class="log__opt-name">Saisie rapide (kcal)</span>
            <span class="log__opt-sub">Resto, plat sans recette…</span>
          </span>
          <v-icon
            icon="mdi-chevron-right"
            color="on-surface-variant"
          />
        </button>

        <div
          v-if="!search && recents.length"
          class="log__section"
        >
          <span class="log__label">Récents</span>
          <div class="log__chips log__chips--scroll">
            <button
              v-for="entry in recents"
              :key="entry.key"
              type="button"
              class="log__recent"
              :disabled="busy"
              @click="pickRecent(entry)"
            >
              <v-icon
                :icon="entry.kind === 'RECIPE' ? 'mdi-silverware-fork-knife' : 'mdi-food-apple-outline'"
                size="14"
              />
              <span class="log__recent-name">{{ entry.kind === 'RECIPE' ? entry.recipe.name : entry.ingredient.name }}</span>
            </button>
          </div>
        </div>

        <div
          v-if="pending"
          class="log__state"
        >
          <v-progress-circular
            indeterminate
            size="22"
            color="primary"
          />
        </div>

        <template v-else>
          <div
            v-if="showRecipes && recipeResults.length"
            class="log__section"
          >
            <span class="log__label">Recettes</span>
            <button
              v-for="recipe in visibleRecipes"
              :key="`r-${recipe.id}`"
              type="button"
              class="log__opt"
              :disabled="busy"
              @click="pickRecipe(recipe)"
            >
              <span class="log__opt-ico log__opt-ico--recipe">
                <v-icon
                  icon="mdi-silverware-fork-knife"
                  size="18"
                />
              </span>
              <span class="log__opt-main">
                <span class="log__opt-name">{{ recipe.name }}</span>
                <span class="log__opt-sub">{{ formatKcal(recipe.perServing.calories) }} / portion</span>
              </span>
              <v-icon
                icon="mdi-plus-circle-outline"
                color="primary"
              />
            </button>
            <!-- Les recettes peuvent être nombreuses : on déplie 10 par 10. -->
            <button
              v-if="hasMoreRecipes"
              type="button"
              class="log__more"
              @click="showMoreRecipes"
            >
              Voir plus
            </button>
          </div>

          <div
            v-if="showIngredients && ingredientResults.length"
            class="log__section"
          >
            <span class="log__label">Aliments</span>
            <button
              v-for="ingredient in ingredientResults"
              :key="`i-${ingredient.id}`"
              type="button"
              class="log__opt"
              :disabled="busy"
              @click="pickIngredient(ingredient)"
            >
              <span class="log__opt-ico">
                <v-icon
                  icon="mdi-food-apple-outline"
                  size="18"
                />
              </span>
              <span class="log__opt-main">
                <span class="log__opt-name">{{ ingredient.name }}</span>
                <span class="log__opt-sub">
                  {{ formatKcal(ingredient.calories) }} / 100 {{ ingredient.unitType === 'VOLUME' ? 'ml' : 'g' }}
                </span>
              </span>
              <v-icon
                icon="mdi-plus-circle-outline"
                color="primary"
              />
            </button>
          </div>

          <p
            v-if="noVisibleResults"
            class="log__state"
          >
            Aucun résultat — utilise la saisie rapide en haut.
          </p>
        </template>
      </template>

      <!-- CONFIG (recipe portions / ingredient quantity) -->
      <template v-else-if="view === 'config'">
        <div class="log__stepper">
          <span class="log__stepper-label">
            {{ selectedKind === 'RECIPE' ? 'Portions' : 'Quantité' }}
          </span>
          <div class="log__stepper-ctrl">
            <v-btn
              icon="mdi-minus"
              variant="tonal"
              size="small"
              aria-label="Diminuer"
              @click="selectedKind === 'RECIPE' ? stepPortions(-1) : stepQuantity(-1)"
            />
            <span class="log__stepper-val">
              {{ selectedKind === 'RECIPE' ? formatPortions(portions) : quantity
              }}<small v-if="selectedKind === 'INGREDIENT'"> {{ unit }}</small>
            </span>
            <v-btn
              icon="mdi-plus"
              variant="tonal"
              size="small"
              aria-label="Augmenter"
              @click="selectedKind === 'RECIPE' ? stepPortions(1) : stepQuantity(1)"
            />
          </div>
        </div>

        <div class="log__preview">
          <span class="log__preview-kcal">{{ formatKcal(preview.calories) }}</span>
          <div class="log__preview-macros">
            <span class="log__pm log__pm--protein"><b>{{ round(preview.proteinG) }}</b> P</span>
            <span class="log__pm log__pm--carb"><b>{{ round(preview.carbG) }}</b> G</span>
            <span class="log__pm log__pm--fat"><b>{{ round(preview.fatG) }}</b> L</span>
          </div>
        </div>

        <v-btn
          block
          flat
          color="primary"
          size="large"
          :loading="busy"
          class="log__cta"
          prepend-icon="mdi-check"
          @click="confirm"
        >
          Ajouter — {{ formatKcal(preview.calories) }}
        </v-btn>
      </template>

      <!-- FREE entry -->
      <template v-else>
        <div class="log__fields">
          <v-text-field
            v-model="freeName"
            label="Nom (optionnel)"
            placeholder="ex. Burger frites"
            density="comfortable"
            variant="solo-filled"
            flat
            hide-details
            autocomplete="off"
          />
          <div class="log__fields-row">
            <v-text-field
              v-model="freeKcal"
              label="Calories"
              type="number"
              suffix="kcal"
              density="comfortable"
              variant="solo-filled"
              flat
              hide-details
              autocomplete="off"
            />
            <v-text-field
              v-model="freeProtein"
              label="Protéines"
              type="number"
              suffix="g"
              density="comfortable"
              variant="solo-filled"
              flat
              hide-details
              autocomplete="off"
            />
          </div>
        </div>

        <v-btn
          block
          flat
          color="primary"
          size="large"
          :disabled="!freeValid"
          :loading="busy"
          class="log__cta"
          prepend-icon="mdi-check"
          @click="confirmFree"
        >
          {{ freeValid ? `Ajouter — ${formatKcal(freeKcalNum)}` : 'Ajouter' }}
        </v-btn>
      </template>
    </div>
  </AppSheet>
</template>

<script setup lang="ts">
import { toast } from 'vue3-toastify'
import type { Ingredient } from '../../../Ingredient/app/types/ingredient'
import type { LogItemPayload, MealSlot } from '../../../Planning/app/types/planning'
import type { Recipe } from '../../../Recipe/app/types/recipe'
import type { RecentEntry } from '../composables/useMealLogger'

const props = defineProps<{
  modelValue: boolean
  // Pre-selected slot (e.g. the "rien noté ce midi ?" nudge passes LUNCH).
  defaultSlot?: MealSlot
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
  'logged': []
}>()

const { search, pending, recipeResults, ingredientResults, recents, log, reset } = useMealLogger()

type View = 'list' | 'config' | 'free'
const view = ref<View>('list')
const slot = ref<MealSlot>('LUNCH')
const day = ref<'today' | 'yesterday'>('today')
const busy = ref(false)

// Segmented filter over the result list: everything, recipes only, or aliments only.
type KindFilter = 'all' | 'recipes' | 'ingredients'
const kindFilter = ref<KindFilter>('all')
const showRecipes = computed(() => kindFilter.value !== 'ingredients')
const showIngredients = computed(() => kindFilter.value !== 'recipes')
const noVisibleResults = computed(() =>
  (!showRecipes.value || recipeResults.value.length === 0)
  && (!showIngredients.value || ingredientResults.value.length === 0),
)

// La liste des recettes peut être longue : on n'affiche que les premières et on
// déplie « 10 par 10 » à la demande. Uniquement pour les recettes — les aliments
// restent listés normalement.
const RECIPE_PAGE = 10
const recipeLimit = ref(RECIPE_PAGE)
const visibleRecipes = computed(() => recipeResults.value.slice(0, recipeLimit.value))
const hasMoreRecipes = computed(() => recipeResults.value.length > recipeLimit.value)
const showMoreRecipes = () => {
  recipeLimit.value += RECIPE_PAGE
}
// Toute nouvelle recherche réinitialise la pagination des recettes.
watch(search, () => {
  recipeLimit.value = RECIPE_PAGE
})

const selectedKind = ref<'RECIPE' | 'INGREDIENT' | null>(null)
const selectedRecipe = ref<Recipe | null>(null)
const selectedIngredient = ref<Ingredient | null>(null)
const portions = ref(1)
const quantity = ref(100)

const freeName = ref('')
const freeKcal = ref('')
const freeProtein = ref('')

const freeKcalNum = computed(() => {
  const value = Number(freeKcal.value)
  return Number.isFinite(value) && value > 0 ? value : 0
})

const SLOTS: { value: MealSlot, label: string }[] = [
  { value: 'BREAKFAST', label: 'Petit-déj' },
  { value: 'LUNCH', label: 'Déjeuner' },
  { value: 'DINNER', label: 'Dîner' },
  { value: 'SNACK', label: 'Collation' },
]

const slotLabel = (value: MealSlot) => SLOTS.find(s => s.value === value)?.label ?? 'Repas'

const headTitle = computed(() => {
  if (view.value === 'free') return 'Saisie rapide'
  if (view.value === 'config') return selectedName.value
  return 'Qu\'as-tu mangé ?'
})

const defaultSlotByTime = (): MealSlot => {
  const hour = new Date().getHours()
  if (hour < 11) return 'BREAKFAST'
  if (hour < 15) return 'LUNCH'
  if (hour < 18) return 'SNACK'
  return 'DINNER'
}

const toIso = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const dayOfMonth = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${dayOfMonth}`
}

const logDate = computed(() =>
  day.value === 'today' ? toIso(new Date()) : toIso(new Date(Date.now() - 86_400_000)),
)

const unit = computed(() => (selectedIngredient.value?.unitType === 'VOLUME' ? 'ml' : 'g'))

const selectedName = computed(() =>
  selectedKind.value === 'RECIPE'
    ? selectedRecipe.value?.name ?? ''
    : selectedIngredient.value?.name ?? '',
)

const preview = computed(() => {
  if (selectedKind.value === 'RECIPE' && selectedRecipe.value) {
    const per = selectedRecipe.value.perServing
    const count = portions.value
    return {
      calories: per.calories * count,
      proteinG: per.proteinG * count,
      carbG: per.carbG * count,
      fatG: per.fatG * count,
    }
  }
  if (selectedKind.value === 'INGREDIENT' && selectedIngredient.value) {
    const factor = quantity.value / 100
    const ing = selectedIngredient.value
    return {
      calories: ing.calories * factor,
      proteinG: ing.proteinG * factor,
      carbG: ing.carbG * factor,
      fatG: ing.fatG * factor,
    }
  }
  return { calories: 0, proteinG: 0, carbG: 0, fatG: 0 }
})

const round = (value: number) => Math.round(value)

const formatPortions = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1)

const back = () => {
  view.value = 'list'
}

const pickRecipe = (recipe: Recipe) => {
  selectedKind.value = 'RECIPE'
  selectedRecipe.value = recipe
  portions.value = 1
  view.value = 'config'
}

const pickIngredient = (ingredient: Ingredient) => {
  selectedKind.value = 'INGREDIENT'
  selectedIngredient.value = ingredient
  quantity.value = 100
  view.value = 'config'
}

const pickRecent = (entry: RecentEntry) => {
  if (entry.kind === 'RECIPE') pickRecipe(entry.recipe)
  else pickIngredient(entry.ingredient)
}

const openFree = () => {
  view.value = 'free'
}

const stepPortions = (direction: number) => {
  portions.value = Math.max(0.5, Math.round((portions.value + direction * 0.5) * 2) / 2)
}

const stepQuantity = (direction: number) => {
  const step = (selectedIngredient.value?.calories ?? 0) > 300 ? 5 : 10
  quantity.value = Math.max(step, quantity.value + direction * step)
}

const submit = async (item: LogItemPayload) => {
  busy.value = true
  try {
    await log({ date: logDate.value, slot: slot.value, item })
    toast.success(
      `Ajouté à ${slotLabel(slot.value).toLowerCase()}${day.value === 'yesterday' ? ' (hier)' : ''}.`,
    )
    emit('logged')
    emit('update:modelValue', false)
  }
  catch {
    toast.error('Ajout impossible.')
  }
  finally {
    busy.value = false
  }
}

const confirm = () => {
  if (selectedKind.value === 'RECIPE' && selectedRecipe.value) {
    submit({ kind: 'RECIPE', portions: portions.value, recipe: { id: selectedRecipe.value.id } })
  }
  else if (selectedKind.value === 'INGREDIENT' && selectedIngredient.value) {
    submit({ kind: 'INGREDIENT', quantity: quantity.value, ingredient: { id: selectedIngredient.value.id } })
  }
}

const freeValid = computed(() => freeKcalNum.value > 0)

const confirmFree = () => {
  if (!freeValid.value) return
  const protein = Number(freeProtein.value)
  submit({
    kind: 'FREE',
    name: freeName.value.trim() || 'Repas libre',
    calories: freeKcalNum.value,
    proteinG: Number.isFinite(protein) && protein > 0 ? protein : undefined,
  })
}

// Fresh state on every open.
watch(() => props.modelValue, (open) => {
  if (!open) return
  view.value = 'list'
  kindFilter.value = 'all'
  recipeLimit.value = RECIPE_PAGE
  slot.value = props.defaultSlot ?? defaultSlotByTime()
  day.value = 'today'
  selectedKind.value = null
  selectedRecipe.value = null
  selectedIngredient.value = null
  portions.value = 1
  quantity.value = 100
  freeName.value = ''
  freeKcal.value = ''
  freeProtein.value = ''
  reset()
})
</script>

<style scoped lang="scss">
.log {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 0.25rem 1.1rem 1.4rem;

  &__head {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  &__back {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 0.1rem;
    font-size: 0.8rem;
    font-weight: 700;
    color: rgb(var(--v-theme-on-surface-variant));
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  &__title {
    font-size: 1.2rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  &__ctx {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  &__chips {
    display: flex;
    gap: 0.3rem;

    &--wrap {
      flex-wrap: wrap;
    }

    &--scroll {
      flex-wrap: nowrap;
      overflow-x: auto;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }
    }
  }

  &__chip {
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;
    border-radius: 999px;
    border: 1px solid rgba(var(--v-border-color), calc(var(--v-border-opacity) * 1.6));
    background: transparent;
    color: rgb(var(--v-theme-on-surface-variant));
    padding: 0.3rem 0.65rem;
    transition: all 0.2s var(--app-ease);

    &--on {
      border-color: rgb(var(--v-theme-primary));
      background: rgb(var(--v-theme-primary));
      color: rgb(var(--v-theme-on-primary));
    }
  }

  &__search {
    border-radius: 14px;
  }

  &__segments {
    display: inline-flex;
    align-self: flex-start;
    max-width: 100%;
    gap: 0.2rem;
    padding: 0.2rem;
    border-radius: 999px;
    background: rgba(var(--v-border-color), 0.1);
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__segment {
    flex: 0 0 auto;
    padding: 0.38rem 0.9rem;
    border-radius: 999px;
    border: none;
    background: transparent;
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    white-space: nowrap;
    cursor: pointer;
    color: rgb(var(--v-theme-on-surface-variant));
    transition: color 0.2s var(--app-ease), background 0.2s var(--app-ease);

    &--active {
      color: rgb(var(--v-theme-on-surface));
      background: rgb(var(--v-theme-surface));
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  &__label {
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgb(var(--v-theme-primary));
    margin: 0.3rem 0.2rem 0.1rem;
  }

  &__recent {
    flex: 0 0 auto;
    width: 9rem;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    border-radius: 999px;
    border: 1px solid rgba(var(--v-border-color), calc(var(--v-border-opacity) * 1.6));
    background: rgb(var(--v-theme-surface-variant));
    color: rgb(var(--v-theme-on-surface));
    padding: 0.32rem 0.7rem;

    &:disabled {
      opacity: 0.5;
      cursor: default;
    }

    .v-icon {
      flex: 0 0 auto;
    }
  }

  &__recent-name {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__opt {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    width: 100%;
    padding: 0.55rem 0.5rem;
    border-radius: 12px;
    border: none;
    background: transparent;
    text-align: left;
    cursor: pointer;
    transition: background 0.2s var(--app-ease);

    &:hover {
      background: rgba(var(--v-theme-primary), 0.06);
    }

    &:disabled {
      opacity: 0.5;
      cursor: default;
    }
  }

  &__opt-ico {
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border-radius: 11px;
    background: rgb(var(--v-theme-surface-variant));
    color: rgb(var(--v-theme-on-surface-variant));
    font-size: 1.1rem;

    &--recipe {
      background: rgba(var(--v-theme-primary), 0.12);
      color: rgb(var(--v-theme-primary));
    }
  }

  &__opt-main {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  &__opt-name {
    font-weight: 600;
    font-size: 0.9rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__opt-sub {
    font-size: 0.75rem;
    color: rgb(var(--v-theme-on-surface-variant));
    font-variant-numeric: tabular-nums;
  }

  &__more {
    align-self: center;
    margin-top: 0.2rem;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    border: none;
    background: transparent;
    color: rgb(var(--v-theme-primary));
    padding: 0.4rem 0.9rem;
    border-radius: 999px;
    transition: background 0.2s var(--app-ease);

    &:hover {
      background: rgba(var(--v-theme-primary), 0.08);
    }
  }

  &__free-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    width: 100%;
    padding: 0.7rem 0.6rem;
    border-radius: 14px;
    border: 1px dashed rgba(var(--v-border-color), calc(var(--v-border-opacity) * 1.8));
    background: transparent;
    text-align: left;
    cursor: pointer;

    &:hover {
      border-color: rgb(var(--v-theme-primary));
    }
  }

  &__stepper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
    padding: 0.7rem 0.9rem;
    border-radius: 16px;
    background: rgb(var(--v-theme-surface-variant));
    margin-top: 0.4rem;
  }

  &__stepper-label {
    font-weight: 600;
    font-size: 0.92rem;
  }

  &__stepper-ctrl {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }

  &__stepper-val {
    min-width: 4.5rem;
    text-align: center;
    font-weight: 800;
    font-size: 1.05rem;
    font-variant-numeric: tabular-nums;

    small {
      font-size: 0.72rem;
      font-weight: 600;
      color: rgb(var(--v-theme-on-surface-variant));
    }
  }

  &__preview {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
    padding: 0.9rem 1rem;
    border-radius: 16px;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  }

  &__preview-kcal {
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }

  &__preview-macros {
    display: flex;
    gap: 0.9rem;
    font-size: 0.82rem;
    font-variant-numeric: tabular-nums;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__pm b {
    font-weight: 800;
  }

  &__pm--protein b { color: rgb(var(--v-theme-macro-protein)); }
  &__pm--carb b { color: rgb(var(--v-theme-macro-carb)); }
  &__pm--fat b { color: rgb(var(--v-theme-macro-fat)); }

  &__fields {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin-top: 0.4rem;
  }

  &__fields-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
  }

  &__cta {
    margin-top: 0.4rem;
    border-radius: 14px;
    font-weight: 800;
    letter-spacing: -0.01em;
  }

  &__state {
    padding: 1.4rem;
    text-align: center;
    color: rgb(var(--v-theme-on-surface-variant));
    font-size: 0.88rem;
  }
}
</style>
