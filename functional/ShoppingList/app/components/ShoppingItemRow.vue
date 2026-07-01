<template>
  <button
    type="button"
    class="item"
    :class="{ 'item--covered': covered }"
    :disabled="covered || buying"
    :aria-label="covered ? `${line.name} — en stock` : `${line.name} — marquer comme acheté`"
    @click="emit('buy')"
  >
    <span class="item__check">
      <v-progress-circular
        v-if="buying"
        indeterminate
        size="20"
        width="2"
        color="primary"
      />
      <v-icon
        v-else
        :icon="covered ? 'mdi-checkbox-marked-circle' : 'mdi-cart-plus'"
        :color="covered ? 'primary' : undefined"
        size="22"
      />
    </span>

    <span class="item__body">
      <span class="item__name">{{ line.name }}</span>
      <span class="item__sub">
        <template v-if="line.inStockQuantity > 0">
          en stock {{ formatQuantity(line.inStockQuantity, line.unitType) }} · besoin {{ formatQuantity(line.quantity, line.unitType) }}
        </template>
        <template v-else>
          besoin {{ formatQuantity(line.quantity, line.unitType) }}
        </template>
      </span>
    </span>

    <span class="item__qty">
      <template v-if="covered">
        en stock
      </template>
      <template v-else>
        {{ formatQuantity(line.toBuyQuantity, line.unitType) }}
      </template>
    </span>
  </button>
</template>

<script setup lang="ts">
import type { ShoppingListLine } from '../types/shoppingList'
import { formatQuantity } from '../utils/shoppingFormat'

defineProps<{ line: ShoppingListLine, covered: boolean, buying: boolean }>()

const emit = defineEmits<{ buy: [] }>()
</script>

<style scoped lang="scss">
.item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  width: 100%;
  padding: 0.6rem 0.9rem;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 14px;
  background: rgb(var(--v-theme-surface));
  text-align: left;
  cursor: pointer;
  transition: opacity 0.25s var(--app-ease), background 0.2s var(--app-ease);

  &:disabled {
    cursor: default;
  }

  &__check {
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
  }

  &__body {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    min-width: 0;
  }

  &__name {
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__sub {
    font-size: 0.78rem;
    color: rgb(var(--v-theme-on-surface-variant));
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__qty {
    flex: 0 0 auto;
    min-width: 4.2rem;
    text-align: right;
    font-size: 0.95rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  &--covered {
    opacity: 0.5;

    .item__name {
      text-decoration: line-through;
    }

    .item__qty {
      font-size: 0.8rem;
      font-weight: 600;
      color: rgb(var(--v-theme-on-surface-variant));
    }
  }
}
</style>
