<template>
  <div
    class="ingredients"
    :class="{ 'ingredients--padded': padded }"
  >
    <header class="ingredients__head">
      <div>
        <h1 class="ingredients__title">
          Ingrédients
        </h1>
        <p class="ingredients__count">
          {{ total }} ingrédient{{ total > 1 ? 's' : '' }}
        </p>
      </div>
      <div class="ingredients__head-actions">
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
          Ajouter
        </v-btn>
      </div>
    </header>

    <v-text-field
      v-model="search"
      placeholder="Rechercher un ingrédient"
      prepend-inner-icon="mdi-magnify"
      density="comfortable"
      hide-details
      clearable
      class="ingredients__search"
    />

    <AppActiveFilters
      :groups="filterGroups"
      @remove="onFilterRemove"
    />

    <!-- Loading -->
    <div
      v-if="pending"
      class="ingredients__list"
    >
      <v-skeleton-loader
        v-for="n in 4"
        :key="n"
        type="list-item-two-line"
        class="ingredients__skeleton"
      />
    </div>

    <!-- Error -->
    <v-card
      v-else-if="error"
      class="ingredients__state"
      elevation="0"
    >
      <v-icon
        icon="mdi-wifi-off"
        size="26"
        color="error"
      />
      <p>Impossible de charger tes ingrédients.</p>
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
      class="ingredients__state"
      elevation="0"
    >
      <span class="ingredients__state-icon">
        <v-icon
          icon="mdi-basket-outline"
          size="26"
        />
      </span>
      <p>{{ hasActiveFilter ? 'Aucun ingrédient ne correspond.' : 'Ta bibliothèque est vide.' }}</p>
      <v-btn
        v-if="!hasActiveFilter"
        color="primary"
        flat
        prepend-icon="mdi-plus"
        @click="openCreate"
      >
        Ajouter mon premier ingrédient
      </v-btn>
    </v-card>

    <!-- List -->
    <div
      v-else
      class="ingredients__list"
    >
      <AppReveal
        v-for="(ingredient, index) in items"
        :key="ingredient.id"
        :delay="Math.min((index % 15) * 40, 240)"
      >
        <IngredientCard
          :ingredient
          :detailed
          @edit="openEdit"
          @delete="askDelete"
        />
      </AppReveal>

      <!-- Loads the next 15 ingredients from the API when scrolled near. -->
      <div
        v-if="hasMore"
        v-intersect="{ handler: loadMore, options: { rootMargin: '300px' } }"
        class="ingredients__sentinel"
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

    <IngredientFormDialog
      ref="formDialog"
      @saved="reload"
    />

    <AppSheet
      :model-value="confirmTarget !== null"
      :max-width="400"
      @update:model-value="cancelDelete"
    >
      <div class="ingredients__confirm">
        <header class="ingredients__confirm-title">
          Supprimer ?
        </header>
        <p class="ingredients__confirm-text">
          Supprimer « {{ confirmTarget?.name }} » de ta bibliothèque ? Cette action est définitive.
        </p>
        <div class="ingredients__confirm-actions">
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
// Body of the ingredients screen, reusable both as the standalone page and as a
// popup (see Planning). `padded` adds the inset the page layout normally provides
// but a bottom-sheet does not.
defineProps<{
  padded?: boolean
}>()

const formDialog = useTemplateRef('formDialog')
const sortSheetOpen = ref(false)
const filterSheetOpen = ref(false)

const { foodTypes } = useFoodTypes()
const {
  items,
  total,
  pending,
  error,
  hasMore,
  hasActiveFilter,
  loadMore,
  refresh,
  reload,
  search,
  selectedFoodTypeIds,
  detailed,
  toggleView,
  sorts,
  sortOptions,
  confirmTarget,
  isDeleting,
  askDelete,
  cancelDelete,
  confirmDelete,
} = useIngredientList()

// Food-type facet lives in AppFilterSheet; only active ones surface inline via
// AppActiveFilters, keeping the list visible above the fold.
const filterGroups = computed<FilterGroup[]>(() => [
  {
    key: 'foodTypes',
    label: 'Types d\'aliment',
    selected: selectedFoodTypeIds.value,
    options: foodTypes.value.map(type => ({ value: type.id, label: type.types })),
    variant: 'tonal',
  },
].filter(group => group.options.length))

const activeFilterCount = computed(() => countActiveFilters(filterGroups.value))

const onFilterChange = (key: string, ids: number[]) => {
  if (key === 'foodTypes') selectedFoodTypeIds.value = ids
}

const onFilterRemove = (key: string, value: number) => {
  if (key === 'foodTypes') {
    selectedFoodTypeIds.value = selectedFoodTypeIds.value.filter(id => id !== value)
  }
}

const openCreate = () => formDialog.value?.openCreate()
const openEdit = (ingredient: typeof items.value[number]) => formDialog.value?.openEdit(ingredient)
</script>

<style scoped lang="scss">
.ingredients {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &--padded {
    padding: 0.25rem 1rem 1.5rem;
  }

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
    color: rgb(var(--v-theme-primary));
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
