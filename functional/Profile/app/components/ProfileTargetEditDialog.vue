<template>
  <v-dialog
    v-model="open"
    max-width="460"
  >
    <v-card class="target-edit">
      <v-card-title class="target-edit__title">
        Modifier la cible
      </v-card-title>

      <v-card-text>
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
      </v-card-text>

      <v-card-actions>
        <v-spacer />
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
      </v-card-actions>
    </v-card>
  </v-dialog>
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
    font-size: 1.15rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    padding-top: 1.1rem;
  }

  &__hint {
    font-size: 0.82rem;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-bottom: 1rem;
  }
}
</style>
