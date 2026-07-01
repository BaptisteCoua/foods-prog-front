<template>
  <div
    class="item"
    :class="{ 'item--short': line.availableQuantity < 0 }"
  >
    <span class="item__name">{{ line.name }}</span>
    <span class="item__qty">
      <template v-if="line.availableQuantity < 0">
        manque {{ formatQuantity(-line.availableQuantity, line.unitType) }}
      </template>
      <template v-else>
        {{ formatQuantity(line.availableQuantity, line.unitType) }}
      </template>
    </span>
    <span class="item__actions">
      <v-btn
        icon="mdi-pencil-outline"
        variant="text"
        size="small"
        aria-label="Modifier la quantité"
        @click="emit('edit')"
      />
      <v-btn
        icon="mdi-close"
        variant="text"
        size="small"
        aria-label="Retirer du garde-manger"
        @click="emit('remove')"
      />
    </span>
  </div>
</template>

<script setup lang="ts">
import type { PantryLine } from '../types/pantry'
import { formatQuantity } from '../utils/pantryFormat'

defineProps<{ line: PantryLine }>()

const emit = defineEmits<{ edit: [], remove: [] }>()
</script>

<style scoped lang="scss">
.item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  width: 100%;
  padding: 0.5rem 0.6rem 0.5rem 0.9rem;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 14px;
  background: rgb(var(--v-theme-surface));

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

  &__qty {
    flex: 0 0 auto;
    font-size: 0.95rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    text-align: right;
  }

  &__actions {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &--short {
    border-color: rgba(var(--v-theme-error), 0.5);

    .item__qty {
      color: rgb(var(--v-theme-error));
    }
  }
}
</style>
