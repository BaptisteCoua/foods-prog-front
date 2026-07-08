<template>
  <div class="recipes">
    <header class="recipes__head">
      <div>
        <h1 class="recipes__title">
          Recettes
        </h1>
        <p class="recipes__count">
          {{ total }} recette{{ total > 1 ? 's' : '' }}
        </p>
      </div>
      <div class="recipes__head-actions">
        <v-btn
          icon
          variant="text"
          density="comfortable"
          aria-label="Mes ingrédients"
          to="/ingredients"
        >
          <v-icon icon="mdi-food-apple-outline" />
          <v-tooltip
            activator="parent"
            location="bottom"
          >
            Mes ingrédients
          </v-tooltip>
        </v-btn>
        <v-btn
          icon
          variant="text"
          density="comfortable"
          aria-label="Filtrer"
          @click="filterSheetOpen = true"
        >
          <v-badge
            :model-value="activeFilterCount > 0"
            :content="activeFilterCount"
            color="primary"
            offset-x="-2"
            offset-y="-2"
          >
            <v-icon icon="mdi-filter-variant" />
          </v-badge>
          <v-tooltip
            activator="parent"
            location="bottom"
          >
            Filtrer
          </v-tooltip>
        </v-btn>
        <v-btn
          icon
          variant="text"
          density="comfortable"
          aria-label="Trier"
          @click="sortSheetOpen = true"
        >
          <v-badge
            :model-value="sorts.length > 0"
            :content="sorts.length"
            color="primary"
            offset-x="-2"
            offset-y="-2"
          >
            <v-icon icon="mdi-sort" />
          </v-badge>
          <v-tooltip
            activator="parent"
            location="bottom"
          >
            Trier
          </v-tooltip>
        </v-btn>
        <v-btn
          icon
          variant="text"
          density="comfortable"
          :aria-label="detailed ? 'Affichage compact' : 'Affichage détaillé'"
          @click="toggleView"
        >
          <v-icon :icon="detailed ? 'mdi-view-list-outline' : 'mdi-view-agenda-outline'" />
          <v-tooltip
            activator="parent"
            location="bottom"
          >
            {{ detailed ? 'Affichage compact' : 'Affichage détaillé' }}
          </v-tooltip>
        </v-btn>
        <v-btn
          color="primary"
          flat
          prepend-icon="mdi-plus"
          @click="openCreate"
        >
          Créer
        </v-btn>
      </div>
    </header>

    <div
      class="recipes__segments"
      role="group"
      aria-label="Filtrer les recettes"
    >
      <button
        type="button"
        :aria-pressed="scope === 'mine'"
        class="recipes__segment"
        :class="{ 'recipes__segment--active': scope === 'mine' }"
        @click="scope = 'mine'"
      >
        Mes recettes
      </button>
      <button
        type="button"
        :aria-pressed="scope === 'catalog'"
        class="recipes__segment"
        :class="{ 'recipes__segment--active': scope === 'catalog' }"
        @click="scope = 'catalog'"
      >
        Bibliothèque
      </button>
      <button
        type="button"
        :aria-pressed="scope === 'shared'"
        class="recipes__segment"
        :class="{ 'recipes__segment--active': scope === 'shared' }"
        @click="scope = 'shared'"
      >
        Partagées
      </button>
    </div>

    <v-text-field
      v-model="search"
      placeholder="Rechercher une recette"
      aria-label="Rechercher une recette"
      prepend-inner-icon="mdi-magnify"
      density="comfortable"
      hide-details
      clearable
      class="recipes__search"
    />

    <AppActiveFilters
      :groups="filterGroups"
      @remove="onFilterRemove"
    />

    <!-- Loading -->
    <div
      v-if="pending"
      class="recipes__list"
    >
      <v-skeleton-loader
        v-for="n in 4"
        :key="n"
        type="article"
        class="recipes__skeleton"
      />
    </div>

    <!-- Error -->
    <v-card
      v-else-if="error"
      class="recipes__state"
      elevation="0"
    >
      <v-icon
        icon="mdi-wifi-off"
        size="26"
        color="error"
      />
      <p>Impossible de charger tes recettes.</p>
      <v-btn
        variant="tonal"
        prepend-icon="mdi-refresh"
        @click="refresh"
      >
        Réessayer
      </v-btn>
    </v-card>

    <!-- Empty -->
    <v-card
      v-else-if="!items.length"
      class="recipes__state"
      elevation="0"
    >
      <span class="recipes__state-icon">
        <v-icon
          :icon="emptyIcon"
          size="26"
        />
      </span>
      <p v-if="scope === 'shared'">
        {{ hasActiveFilter ? 'Aucune recette partagée ne correspond.' : 'Aucune recette partagée pour l\'instant.' }}
      </p>
      <p v-else-if="scope === 'catalog'">
        {{ hasActiveFilter ? 'Aucune recette de la bibliothèque ne correspond.' : 'La bibliothèque est vide pour l\'instant.' }}
      </p>
      <p v-else>
        {{ hasActiveFilter ? 'Aucune recette ne correspond.' : 'Aucune recette pour l\'instant.' }}
      </p>
      <v-btn
        v-if="scope === 'mine' && !hasActiveFilter"
        color="primary"
        flat
        prepend-icon="mdi-plus"
        @click="openCreate"
      >
        Créer ma première recette
      </v-btn>
    </v-card>

    <!-- List -->
    <div
      v-else
      class="recipes__list"
    >
      <AppReveal
        v-for="(recipe, index) in items"
        :key="recipe.id"
        :delay="Math.min((index % 15) * 40, 240)"
      >
        <RecipeCard
          :recipe
          :detailed
          :cloning="isCloning === recipe.id"
          @open="goToRecipe"
          @edit="openEdit"
          @delete="askDelete"
          @clone="cloneToMine"
          @unclone="uncloneFromMine"
        />
      </AppReveal>

      <!-- Reveals the next 15 cards when scrolled near. -->
      <div
        v-if="hasMore"
        v-intersect="{ handler: loadMore, options: { rootMargin: '300px' } }"
        class="recipes__sentinel"
      >
        <v-progress-circular
          indeterminate
          size="24"
          width="2"
          color="primary"
        />
      </div>
    </div>

    <AppFilterSheet
      v-model="filterSheetOpen"
      :groups="filterGroups"
      @update:group="onFilterChange"
    />

    <AppSortSheet
      v-model="sortSheetOpen"
      v-model:sorts="sorts"
      :options="sortOptions"
    />

    <RecipeFormDialog
      ref="formDialog"
      @saved="reload"
    />

    <AppSheet
      :model-value="confirmTarget !== null"
      :max-width="400"
      title="Supprimer la recette ?"
      @update:model-value="cancelDelete"
    >
      <div class="recipes__confirm">
        <header class="recipes__confirm-title">
          Supprimer ?
        </header>
        <p class="recipes__confirm-text">
          Supprimer « {{ confirmTarget?.name }} » ? Cette action est définitive.
        </p>
        <div class="recipes__confirm-actions">
          <v-btn
            variant="text"
            @click="cancelDelete"
          >
            Annuler
          </v-btn>
          <v-btn
            color="error"
            flat
            :loading="isDeleting"
            @click="confirmDelete"
          >
            Supprimer
          </v-btn>
        </div>
      </div>
    </AppSheet>
  </div>
</template>

<script setup lang="ts">
import type { Recipe } from '../../types/recipe'
import type { RecipeScope } from '../../composables/useRecipeList'

useHead({ title: 'Recettes' })

const formDialog = useTemplateRef('formDialog')
const sortSheetOpen = ref(false)
const filterSheetOpen = ref(false)

// Segmented view: my recipes vs the global catalog vs the community's shared
// ones. Persisted (keyed 'recipes') so leaving for a detail page and coming
// back lands on the tab you left, instead of resetting to "Mes recettes".
const scopeStore = useListScopeStore()
const scope = computed<RecipeScope>({
  get: () => (scopeStore.get('recipes') as RecipeScope | undefined) ?? 'mine',
  set: value => scopeStore.set('recipes', value),
})

const {
  items,
  total,
  hasMore,
  hasActiveFilter,
  loadMore,
  mealTypes,
  selectedMealTypeIds,
  dietaryRegimes,
  selectedDietaryRegimeIds,
  pending,
  error,
  refresh,
  reload,
  search,
  detailed,
  toggleView,
  sorts,
  sortOptions,
  confirmTarget,
  isDeleting,
  askDelete,
  cancelDelete,
  confirmDelete,
  isCloning,
  cloneToMine,
  uncloneFromMine,
} = useRecipeList(scope)

// Facet filters (meal types + dietary regimes) live in AppFilterSheet; only the
// active ones surface inline via AppActiveFilters. Empty groups are dropped.
const filterGroups = computed<FilterGroup[]>(() => [
  {
    key: 'mealTypes',
    label: 'Types de repas',
    selected: selectedMealTypeIds.value,
    options: mealTypes.value.map(type => ({ value: type.id, label: type.name })),
  },
  {
    key: 'regimes',
    label: 'Régimes',
    selected: selectedDietaryRegimeIds.value,
    options: dietaryRegimes.value.map(regime => ({ value: regime.id, label: regime.name })),
    color: 'primary',
    icon: 'mdi-leaf',
  },
].filter(group => group.options.length))

const activeFilterCount = computed(() => countActiveFilters(filterGroups.value))

const onFilterChange = (key: string, ids: number[]) => {
  if (key === 'mealTypes') selectedMealTypeIds.value = ids
  else if (key === 'regimes') selectedDietaryRegimeIds.value = ids
}

const onFilterRemove = (key: string, value: number) => {
  if (key === 'mealTypes') {
    selectedMealTypeIds.value = selectedMealTypeIds.value.filter(id => id !== value)
  }
  else if (key === 'regimes') {
    selectedDietaryRegimeIds.value = selectedDietaryRegimeIds.value.filter(id => id !== value)
  }
}

const emptyIcon = computed(() => {
  if (scope.value === 'shared') return 'mdi-share-variant-outline'
  if (scope.value === 'catalog') return 'mdi-bookshelf'
  return 'mdi-book-open-outline'
})

const openCreate = () => formDialog.value?.openCreate()
const openEdit = (recipe: Recipe) => formDialog.value?.openEdit(recipe)
const goToRecipe = (recipe: Recipe) => navigateTo(`/recipes/${recipe.id}`)
</script>

<style scoped lang="scss">
.recipes {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.5rem 0.25rem 0;
  }

  &__head-actions {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  &__title {
    font-size: 1.7rem;
    font-weight: 800;
    letter-spacing: -0.03em;
  }

  &__count {
    font-size: 0.82rem;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-top: 0.2rem;
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
    padding: 0.4rem 0.95rem;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    white-space: nowrap;
    color: rgb(var(--v-theme-on-surface-variant));
    transition: color 0.2s var(--app-ease), background 0.2s var(--app-ease);

    &--active {
      color: rgb(var(--v-theme-on-surface));
      background: rgb(var(--v-theme-surface));
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  &__sentinel {
    display: flex;
    justify-content: center;
    padding: 1rem 0 0.5rem;
  }

  &__skeleton {
    border-radius: 18px;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  }

  &__state {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.7rem;
    padding: 2.5rem 1.5rem;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__state-icon {
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    border-radius: 16px;
    color: rgb(var(--v-theme-primary-text));
    background: rgba(var(--v-theme-primary), 0.12);
  }

  &__confirm-title {
    padding: 0.25rem 1.25rem 0.5rem;
    font-size: 1.2rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  &__confirm-text {
    padding: 0 1.25rem;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__confirm-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 1rem 1.25rem 1.4rem;
  }
}
</style>
