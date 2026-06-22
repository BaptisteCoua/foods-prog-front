<template>
  <div class="recipes">
    <header class="recipes__head">
      <div>
        <h1 class="recipes__title">
          Recettes
        </h1>
        <p class="recipes__count">
          {{ items.length }} recette{{ items.length > 1 ? 's' : '' }}
        </p>
      </div>
      <v-btn
        color="primary"
        flat
        prepend-icon="mdi-plus"
        @click="openCreate"
      >
        Créer
      </v-btn>
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
      v-else-if="!filteredItems.length"
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
        v-for="(recipe, index) in filteredItems"
        :key="recipe.id"
        :delay="Math.min(index * 40, 240)"
      >
        <RecipeCard
          :recipe
          @open="goToRecipe"
          @edit="openEdit"
          @delete="askDelete"
        />
      </AppReveal>
    </div>

    <RecipeFormDialog ref="formDialog" />

    <v-dialog
      :model-value="confirmTarget !== null"
      max-width="400"
      @update:model-value="cancelDelete"
    >
      <v-card class="recipes__confirm">
        <v-card-title>Supprimer ?</v-card-title>
        <v-card-text>
          Supprimer « {{ confirmTarget?.name }} » ? Cette action est définitive.
        </v-card-text>
        <v-card-actions class="recipes__confirm-actions">
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
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { Recipe } from '../../types/recipe'

useHead({ title: 'Recettes' })

const formDialog = useTemplateRef('formDialog')

const {
  items,
  filteredItems,
  mealTypes,
  selectedMealTypeIds,
  dietaryRegimes,
  selectedDietaryRegimeIds,
  pending,
  error,
  refresh,
  search,
  confirmTarget,
  isDeleting,
  askDelete,
  cancelDelete,
  confirmDelete,
} = useRecipeList()

const hasActiveFilter = computed(() =>
  Boolean(search.value)
  || selectedMealTypeIds.value.length > 0
  || selectedDietaryRegimeIds.value.length > 0)

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

  &__confirm-actions {
    justify-content: flex-end;
    padding: 0.5rem 1rem 1rem;
  }
}
</style>
