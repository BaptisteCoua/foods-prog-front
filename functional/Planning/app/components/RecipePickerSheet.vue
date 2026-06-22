<template>
  <v-bottom-sheet
    :model-value="modelValue"
    max-width="640"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="picker">
      <header class="picker__head">
        <div>
          <h2 class="picker__title">
            Ajouter une recette
          </h2>
          <p
            v-if="slotLabel"
            class="picker__subtitle"
          >
            {{ slotLabel }}
          </p>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          aria-label="Fermer"
          @click="emit('update:modelValue', false)"
        />
      </header>

      <v-text-field
        v-model="search"
        placeholder="Rechercher une recette"
        prepend-inner-icon="mdi-magnify"
        density="comfortable"
        hide-details
        clearable
        autofocus
        class="picker__search"
      />

      <div
        v-if="!search && recents.length"
        class="picker__recents"
      >
        <span class="picker__section">Récentes</span>
        <div class="picker__chips">
          <v-chip
            v-for="recipe in recents"
            :key="recipe.id"
            size="small"
            variant="tonal"
            :disabled="busy"
            @click="emit('pick', recipe)"
          >
            {{ recipe.name }}
          </v-chip>
        </div>
      </div>

      <div
        v-if="pending"
        class="picker__state"
      >
        <v-progress-circular
          indeterminate
          size="22"
          color="primary"
        />
      </div>

      <p
        v-else-if="!results.length"
        class="picker__state"
      >
        {{ search ? 'Aucune recette ne correspond.' : 'Aucune recette. Créez-en dans l\'onglet Recettes.' }}
      </p>

      <v-list
        v-else
        class="picker__list"
        density="comfortable"
      >
        <v-list-item
          v-for="recipe in results"
          :key="recipe.id"
          :disabled="busy"
          class="picker__item"
          @click="emit('pick', recipe)"
        >
          <template #title>
            <span class="picker__item-name">{{ recipe.name }}</span>
          </template>
          <template #subtitle>
            {{ formatKcal(recipe.perServing.calories) }} / portion
          </template>
          <template #append>
            <v-icon
              icon="mdi-plus-circle-outline"
              color="primary"
            />
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </v-bottom-sheet>
</template>

<script setup lang="ts">
import type { Recipe } from '../../../Recipe/app/types/recipe'

const props = defineProps<{
  modelValue: boolean
  slotLabel: string
  recents: Recipe[]
  busy: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
  'pick': [Recipe]
}>()

const { results, pending, search, reset } = useRecipePicker()

// Clear the query each time the sheet closes so it reopens fresh.
watch(() => props.modelValue, (open) => {
  if (!open) reset()
})
</script>

<style scoped lang="scss">
.picker {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1.1rem 1.1rem 1.4rem;
  max-height: 78vh;

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
  }

  &__title {
    font-size: 1.15rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  &__subtitle {
    font-size: 0.82rem;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-top: 0.1rem;
  }

  &__recents {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }

  &__section {
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  &__state {
    padding: 1.6rem;
    text-align: center;
    color: rgb(var(--v-theme-on-surface-variant));
    font-size: 0.88rem;
  }

  &__list {
    overflow-y: auto;
    background: transparent;
  }

  &__item-name {
    font-weight: 600;
  }
}
</style>
