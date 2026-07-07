<template>
  <div class="app-date-field">
    <v-text-field
      :model-value="displayValue"
      :label="label"
      :placeholder="placeholder"
      :hide-details="hideDetails"
      readonly
      variant="outlined"
      append-inner-icon="mdi-calendar"
      class="app-date-field__trigger"
      role="button"
      :aria-label="label"
      @click="open = true"
      @click:append-inner="open = true"
      @keydown.enter.prevent="open = true"
      @keydown.space.prevent="open = true"
    />

    <AppSheet
      v-model="open"
      :max-width="380"
      :title="label"
    >
      <div class="app-date-field__sheet">
        <v-date-picker
          :model-value="pickedDate"
          color="primary"
          :max="maxDate"
          :min="minDate"
          show-adjacent-months
          hide-header
          class="app-date-field__picker"
          @update:model-value="onPick"
        />
      </div>
    </AppSheet>
  </div>
</template>

<script setup lang="ts">
// Mobile-first date field: a Vuetify-styled trigger (calendar icon on the right)
// that opens Vuetify's own calendar inside the app's bottom-sheet — no external
// overlay, so it renders and dismisses reliably on touch. The bound value is an
// ISO `yyyy-MM-dd` string so it drops straight into form/API payloads.
const props = withDefaults(defineProps<{
  label: string
  placeholder?: string
  hideDetails?: boolean
  // ISO `yyyy-MM-dd` bounds.
  min?: string
  max?: string
}>(), {
  placeholder: 'Choisir une date',
  hideDetails: false,
})

const model = defineModel<string | null | undefined>({ default: '' })

const open = ref(false)

// ISO string <-> local Date, anchored at local midnight to avoid timezone drift.
const toIso = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const toDate = (iso?: string | null): Date | undefined => {
  if (!iso) return undefined
  const date = new Date(`${iso}T00:00:00`)
  return Number.isNaN(date.getTime()) ? undefined : date
}

const pickedDate = computed(() => toDate(model.value))
const minDate = computed(() => toDate(props.min))
const maxDate = computed(() => toDate(props.max))

const displayValue = computed(() => {
  const date = pickedDate.value
  if (!date) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
})

// A day tap fires once; write it back and close the sheet.
const onPick = (value: unknown) => {
  if (value instanceof Date) {
    model.value = toIso(value)
    open.value = false
  }
}
</script>

<style scoped lang="scss">
.app-date-field {
  &__trigger {
    cursor: pointer;

    :deep(input) {
      cursor: pointer;
    }
  }

  &__sheet {
    display: flex;
    justify-content: center;
    padding: 0.25rem 0.5rem 1.25rem;
  }

  // Let the calendar breathe full-width and drop its own card chrome — it sits
  // inside the sheet, which already provides the surface.
  &__picker {
    width: 100%;
    box-shadow: none;
    background: transparent;

    :deep(.v-picker__body) {
      width: 100%;
    }

    :deep(.v-date-picker-month) {
      width: 100%;
    }
  }
}
</style>
