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
      <li
        v-for="item in items"
        :key="item.id"
        class="meal-card__item"
      >
        <button
          type="button"
          class="meal-card__item-btn"
          @click="openItem(item)"
        >
          <v-avatar
            class="meal-card__item-thumb"
            size="36"
            rounded="lg"
          >
            <v-img
              v-if="item.recipe.img"
              :src="item.recipe.img"
              cover
              :alt="item.recipe.name"
            />
            <v-icon
              v-else
              :icon="row.meta.icon"
              size="18"
              color="on-surface-variant"
            />
          </v-avatar>

          <div class="meal-card__item-main">
            <span class="meal-card__item-name">{{ item.recipe.name }}</span>
            <span
              v-if="courseName(item) || item.portions !== 1"
              class="meal-card__item-meta"
            >
              <span
                v-if="courseName(item)"
                class="meal-card__course"
              >{{ courseName(item) }}</span>
              <span
                v-if="item.portions !== 1"
                class="meal-card__item-kcal"
              >×{{ formatPortionValue(item.portions) }} portions</span>
            </span>
          </div>

          <v-icon
            icon="mdi-chevron-right"
            size="18"
            class="meal-card__item-chevron"
          />
        </button>
      </li>
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

const formatPortionValue = (portions: number) =>
  Number.isInteger(portions) ? String(portions) : portions.toFixed(1)
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

  &__item-btn {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    width: 100%;
    padding: 0.5rem 0.55rem;
    text-align: left;
    cursor: pointer;
    border-radius: 12px;
    background: rgb(var(--v-theme-surface-variant));
    border: 1px solid rgba(var(--v-border-color), calc(var(--v-border-opacity) * 0.6));
    transition: background 0.15s var(--app-ease, ease), border-color 0.15s var(--app-ease, ease);

    &:hover {
      border-color: rgba(var(--v-border-color), var(--v-border-opacity));
    }
  }

  &__item-chevron {
    flex: 0 0 auto;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__item-thumb {
    flex: 0 0 auto;
    border: 1px solid rgba(var(--v-border-color), calc(var(--v-border-opacity) * 0.8));
  }

  &__item-main {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-width: 0;
    gap: 0.1rem;
  }

  &__item-name {
    font-size: 0.9rem;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__item-meta {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.74rem;
    color: rgb(var(--v-theme-on-surface-variant));
    font-variant-numeric: tabular-nums;
  }

  &__course {
    text-transform: uppercase;
    letter-spacing: 0.03em;
    font-weight: 600;
    color: rgb(var(--v-theme-primary));
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
