<template>
  <div
    v-if="chips.length"
    class="active-filters"
  >
    <v-chip
      v-for="chip in chips"
      :key="chip.id"
      size="small"
      :variant="chip.variant ?? 'tonal'"
      :color="chip.color"
      :prepend-icon="chip.icon"
      closable
      close-icon="mdi-close"
      class="active-filters__chip"
      @click:close="emit('remove', chip.groupKey, chip.value)"
    >
      {{ chip.label }}
    </v-chip>
  </div>
</template>

<script setup lang="ts">
// Compact, single-line scrollable row of the currently-applied filters. Renders
// nothing when no filter is active, so the page reclaims the vertical space the
// inline chip groups used to take. Each chip removes its own facet value.
const props = defineProps<{
  groups: FilterGroup[]
}>()

const emit = defineEmits<{
  remove: [key: string, value: number]
}>()

// Flatten every selected option across groups into one renderable list, keeping
// each chip's group styling (color / icon) so it reads the same as the sheet.
const chips = computed(() =>
  props.groups.flatMap(group =>
    group.selected
      .map(value => group.options.find(option => option.value === value))
      .filter((option): option is FilterOption => option !== undefined)
      .map(option => ({
        id: `${group.key}:${option.value}`,
        groupKey: group.key,
        value: option.value,
        label: option.label,
        color: group.color,
        icon: group.icon,
        variant: group.variant,
      })),
  ),
)
</script>

<style scoped lang="scss">
.active-filters {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.4rem;
  margin-top: -0.25rem;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  &__chip {
    flex: 0 0 auto;
  }
}
</style>
