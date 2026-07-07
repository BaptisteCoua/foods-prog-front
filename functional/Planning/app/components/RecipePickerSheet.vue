<template>
  <AppSheet
    :model-value="modelValue"
    :max-width="640"
    title="Ajouter une recette"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="picker">
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
            link
            :disabled="busy"
            :aria-label="`Ajouter ${recipe.name}`"
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
        <template
          v-for="group in groups"
          :key="group.key"
        >
          <v-list-subheader class="picker__group-header">
            {{ group.label }}
          </v-list-subheader>
          <v-list-item
            v-for="recipe in group.recipes"
            :key="`${group.key}-${recipe.id}`"
            :disabled="busy"
            class="picker__item"
            @click="emit('pick', recipe)"
          >
            <template #prepend>
              <v-avatar
                rounded="lg"
                size="46"
                class="picker__thumb"
              >
                <v-img
                  v-if="recipe.img"
                  :src="recipe.img"
                  :alt="recipe.name"
                  cover
                />
                <v-icon
                  v-else
                  icon="mdi-silverware-fork-knife"
                  size="22"
                />
              </v-avatar>
            </template>
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
        </template>
      </v-list>
    </div>
  </AppSheet>
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

const { results, groups, pending, search, reset } = useRecipePicker()

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
  padding: 0.25rem 1.1rem 1.4rem;

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

  &__group-header {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: rgb(var(--v-theme-primary));
    opacity: 1;
  }

  &__item-name {
    font-weight: 600;
  }

  &__thumb {
    background: rgb(var(--v-theme-surface-variant));
    color: rgb(var(--v-theme-on-surface-variant));
  }
}
</style>
