<template>
  <v-card
    class="meal-card"
    elevation="0"
  >
    <div class="meal-card__head">
      <div class="meal-card__slot">
        <v-icon
          :icon="row.meta.icon"
          size="18"
          class="meal-card__slot-icon"
        />
        <span class="meal-card__slot-label">{{ row.meta.label }}</span>
      </div>
      <span
        v-if="row.meal"
        class="meal-card__kcal"
      >{{ formatKcal(row.meal.total.calories) }}</span>
    </div>

    <ul
      v-if="items.length"
      class="meal-card__items"
    >
      <PlanningMealItem
        v-for="item in items"
        :key="item.id"
        :item="item"
        :icon="row.meta.icon"
        :course-name="courseName(item)"
        @open="openItem(item)"
        @remove="emit('remove', item.id)"
      />
    </ul>

    <button
      type="button"
      class="meal-card__add"
      :class="{ 'meal-card__add--empty': !items.length }"
      @click="emit('add')"
    >
      <v-icon
        icon="mdi-plus"
        size="18"
      />
      <span>{{ items.length ? 'Ajouter' : 'Ajouter une recette' }}</span>
    </button>

    <MealItemSheet
      v-model="sheetOpen"
      :item="selectedItem"
      @set-portions="(id, val) => emit('setPortions', id, val)"
      @remove="(id) => { emit('remove', id); sheetOpen = false }"
    />
  </v-card>
</template>

<script setup lang="ts">
import type { SlotRow } from '../composables/usePlanningBoard'
import type { MealItem } from '../types/planning'

const props = defineProps<{ row: SlotRow }>()
const emit = defineEmits<{
  add: []
  remove: [number]
  setPortions: [number, number]
}>()

const items = computed(() => props.row.items)

const sheetOpen = ref(false)
const selectedItemId = ref<number | null>(null)

// Track the open line by its (now stable) item id and read it back from the live
// `items` list, so the sheet shows the recomputed total after a portions change
// and unambiguously targets the right line even if a recipe appears twice.
const selectedItem = computed<MealItem | null>(() =>
  items.value.find(item => item.id === selectedItemId.value) ?? null,
)

const openItem = (item: MealItem) => {
  selectedItemId.value = item.id
  sheetOpen.value = true
}

// If the selected item is gone (removed), close the sheet.
watch(selectedItem, (item) => {
  if (!item) sheetOpen.value = false
})

// First meal-type tag, shown as a faint course label when present.
const courseName = (item: MealItem) => item.recipe.mealTypes?.[0]?.name ?? ''
</script>

<style scoped lang="scss">
.meal-card {
  padding: 0.85rem 1rem;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  &__slot {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }

  &__slot-icon {
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__slot-label {
    font-weight: 700;
    font-size: 0.92rem;
    letter-spacing: -0.01em;
  }

  &__kcal {
    font-weight: 700;
    font-size: 0.85rem;
    font-variant-numeric: tabular-nums;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__items {
    list-style: none;
    padding: 0;
    margin: 0.6rem 0 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  &__add {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin-top: 0.6rem;
    padding: 0.35rem 0;
    font-size: 0.85rem;
    font-weight: 600;
    color: rgb(var(--v-theme-primary));

    &--empty {
      width: 100%;
      justify-content: center;
      padding: 0.7rem 0;
      border: 1px dashed rgba(var(--v-theme-primary), 0.4);
      border-radius: 12px;
      margin-top: 0.2rem;
    }
  }
}
</style>
