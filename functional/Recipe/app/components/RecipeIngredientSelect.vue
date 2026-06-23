<template>
  <v-autocomplete
    :model-value="modelValue"
    :items="displayItems"
    :loading="loading"
    :no-filter="true"
    item-title="name"
    item-value="id"
    label="Ingrédient"
    density="comfortable"
    hide-details
    auto-select-first
    :no-data-text="search.trim() ? 'Aucun ingrédient trouvé' : 'Tape pour rechercher…'"
    class="recipe-ingredient-select"
    @update:model-value="onSelect"
    @update:search="onSearch"
  />
</template>

<script setup lang="ts">
import type { Ingredient } from '../../../Ingredient/app/types/ingredient'

const props = defineProps<{
  modelValue: number | null
  selected: Ingredient | null
}>()

const emit = defineEmits<{
  'update:modelValue': [number | null]
  'select': [Ingredient | null]
}>()

const { search, results, loading } = useIngredientSearch()

// The autocomplete only renders the label for the selected id if that item is
// in :items. Server-side search returns a moving window that may not contain
// the current selection (notably in edit mode), so we always merge it in.
const displayItems = computed<Ingredient[]>(() => {
  const items = [...results.value]
  if (props.selected && !items.some(item => item.id === props.selected!.id)) {
    items.unshift(props.selected)
  }
  return items
})

const onSearch = (term: string) => {
  search.value = term
}

const onSelect = (id: number | null) => {
  emit('update:modelValue', id)
  emit('select', displayItems.value.find(item => item.id === id) ?? null)
}
</script>

<style scoped lang="scss">
.recipe-ingredient-select {
  flex: 1 1 auto;
}
</style>
