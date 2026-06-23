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

    <v-text-field
      v-model="search"
      placeholder="Rechercher une recette"
      prepend-inner-icon="mdi-magnify"
      density="comfortable"
      hide-details
      clearable
      class="recipes__search"
    />

    <v-chip-group
      v-if="mealTypes.length"
      v-model="selectedMealTypeIds"
      multiple
      column
      class="recipes__filters"
    >
      <v-chip
        v-for="type in mealTypes"
        :key="type.id"
        :value="type.id"
        size="small"
        filter
        variant="outlined"
      >
        {{ type.name }}
      </v-chip>
    </v-chip-group>

    <v-chip-group
      v-if="dietaryRegimes.length"
      v-model="selectedDietaryRegimeIds"
      multiple
      column
      class="recipes__filters"
    >
      <v-chip
        v-for="regime in dietaryRegimes"
        :key="regime.id"
        :value="regime.id"
        size="small"
        filter
        variant="outlined"
        color="primary"
        prepend-icon="mdi-leaf"
      >
        {{ regime.name }}
      </v-chip>
    </v-chip-group>

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
          icon="mdi-book-open-outline"
          size="26"
        />
      </span>
      <p>{{ hasActiveFilter ? 'Aucune recette ne correspond.' : 'Aucune recette pour l\'instant.' }}</p>
      <v-btn
        v-if="!hasActiveFilter"
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
          @open="goToRecipe"
          @edit="openEdit"
          @delete="askDelete"
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

    <RecipeFormDialog
      ref="formDialog"
      @saved="reload"
    />

    <AppSheet
      :model-value="confirmTarget !== null"
      :max-width="400"
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

useHead({ title: 'Recettes' })

const formDialog = useTemplateRef('formDialog')

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
  confirmTarget,
  isDeleting,
  askDelete,
  cancelDelete,
  confirmDelete,
} = useRecipeList()

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

  &__filters {
    margin-top: -0.25rem;
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
