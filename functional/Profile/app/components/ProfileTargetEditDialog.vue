<template>
  <AppSheet
    v-model="open"
    :max-width="460"
    title="Modifier la cible"
  >
    <div class="target-edit">
      <header class="target-edit__title">
        Modifier la cible
      </header>

      <div class="target-edit__content">
        <p class="target-edit__hint">
          Les valeurs saisies remplacent la cible automatique calculée depuis ton profil.
        </p>
        <v-form
          ref="formRef"
          @submit.prevent="submit"
        >
          <v-text-field
            v-model.number="form.calories"
            type="number"
            label="Calories"
            suffix="kcal"
            variant="outlined"
            density="comfortable"
            :rules="rules"
          />
          <v-text-field
            v-model.number="form.proteinG"
            type="number"
            label="Protéines"
            suffix="g"
            variant="outlined"
            density="comfortable"
            :rules="rules"
          />
          <v-text-field
            v-model.number="form.carbG"
            type="number"
            label="Glucides"
            suffix="g"
            variant="outlined"
            density="comfortable"
            :rules="rules"
          />
          <v-text-field
            v-model.number="form.fatG"
            type="number"
            label="Lipides"
            suffix="g"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            :rules="rules"
          />
        </v-form>
      </div>

      <div class="target-edit__actions">
        <v-btn
          variant="text"
          :disabled="saving"
          @click="open = false"
        >
          Annuler
        </v-btn>
        <v-btn
          color="primary"
          :loading="saving"
          @click="submit"
        >
          Enregistrer
        </v-btn>
      </div>
    </div>
  </AppSheet>
</template>

<script setup lang="ts">
import type {
  NutritionTarget,
  NutritionTargetPayload,
} from '../types/target'

const props = defineProps<{
  target: NutritionTarget | null
  saving: boolean
}>()

const emit = defineEmits<{ submit: [payload: NutritionTargetPayload] }>()

const open = ref(false)
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)

const form = reactive<NutritionTargetPayload>({
  calories: 0,
  proteinG: 0,
  carbG: 0,
  fatG: 0,
})

const rules = [
  (value: number) => (typeof value === 'number' && !Number.isNaN(value)) || 'Valeur requise',
  (value: number) => value >= 0 || 'Doit être positif',
]

const openDialog = () => {
  if (props.target) {
    form.calories = Math.round(props.target.calories)
    form.proteinG = Math.round(props.target.proteinG)
    form.carbG = Math.round(props.target.carbG)
    form.fatG = Math.round(props.target.fatG)
  }
  open.value = true
}

const submit = async () => {
  const result = await formRef.value?.validate()
  if (!result?.valid) return
  emit('submit', { ...form })
}

defineExpose({
  open: openDialog,
  close: () => { open.value = false },
})
</script>

<style scoped lang="scss">
.target-edit {
  &__title {
    font-size: 1.2rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    padding: 0.25rem 1.25rem 0.75rem;
  }

  &__content {
    padding: 0 1.25rem;
  }

  &__hint {
    font-size: 0.82rem;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-bottom: 1rem;
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 1rem 1.25rem 1.4rem;
  }
}
</style>
