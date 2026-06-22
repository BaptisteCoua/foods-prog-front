<template>
  <button
    type="button"
    class="item"
    :class="{ 'item--checked': checked }"
    @click="emit('toggle')"
  >
    <v-icon
      class="item__check"
      :icon="checked ? 'mdi-checkbox-marked-circle' : 'mdi-checkbox-blank-circle-outline'"
      :color="checked ? 'primary' : undefined"
      size="22"
    />
    <span class="item__name">{{ line.name }}</span>
    <span class="item__quantity">{{ formatQuantity(line.quantity, line.unitType) }}</span>
    <span class="item__cost">{{ formatTotalPrice(line.costCents) }}</span>
  </button>
</template>

<script setup lang="ts">
import type { ShoppingListLine } from '../types/shoppingList'
import { formatQuantity, formatTotalPrice } from '../utils/shoppingFormat'

defineProps<{ line: ShoppingListLine, checked: boolean }>()

const emit = defineEmits<{ toggle: [] }>()
</script>

<style scoped lang="scss">
.item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 14px;
  background: rgb(var(--v-theme-surface));
  text-align: left;
  cursor: pointer;
  transition: opacity 0.25s var(--app-ease), background 0.2s var(--app-ease);

  &__check {
    flex: 0 0 auto;
  }

  &__name {
    flex: 1 1 auto;
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__quantity {
    flex: 0 0 auto;
    font-size: 0.85rem;
    color: rgb(var(--v-theme-on-surface-variant));
    font-variant-numeric: tabular-nums;
  }

  &__cost {
    flex: 0 0 auto;
    min-width: 4.2rem;
    text-align: right;
    font-size: 0.85rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  &--checked {
    opacity: 0.5;

    .item__name {
      text-decoration: line-through;
    }
  }
}
</style>
