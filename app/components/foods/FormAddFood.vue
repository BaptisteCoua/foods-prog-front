<template>
  <UButton
    icon="i-lucide:plus"
    @click="changeStatusModal('new')"
  >
    Ajouter un aliment
  </UButton>

  <UModal
    v-model:open="modalOpened"
    title="Ajouter un aliment"
    :ui="{ footer: 'justify-end' }"
    @after:leave="resetValueFoodForm()"
  >
    <template #body>
      <UPageCard
        variant="subtle"
        :ui="{ container: 'divide-y divide-default' }"
      >
        <UFormField
          name="name"
          label="Nom"
          description="Exemple : Filet de poulet"
          class="flex items-center justify-between not-last:pb-4 gap-2"
        >
          <UInput
            v-model="foodForm.name"
          />
        </UFormField>
        <UFormField
          name="unite"
          :label="asGramType"
          description="Au poids ou à l’unité ?"
          class="flex items-center justify-between not-last:pb-4 gap-2"
        >
          <USwitch
            v-model="foodForm.asGrams"
          />
        </UFormField>
      </UPageCard>

      <UPageCard
        class="mt-5"
        :ui="{ container: 'divide-y divide-default' }"
      >
        <UFormField
          name="types"
          label="Ajouter un type d'aliment"
          class="flex items-center justify-between not-last:pb-4 gap-2"
        >
          <template #description>
            <UBadge
              v-for="(item, i) in foodForm.foodTypes"
              :key="i"
              variant="subtle"
              class="rounded-full mr-1 mt-2"
            >
              {{ item.types }}
            </UBadge>
          </template>
          <USelectMenu
            v-model="foodForm.foodTypes"
            multiple
            :items="foodTypes"
            label-key="types"
            class="w-48"
          />
        </UFormField>
      </UPageCard>
      <UPageCard
        class="mt-5"
        :ui="{ container: 'divide-y divide-default' }"
      >
        <UFormField
          v-for="(value, key) in foodForm.foodDetail"
          :key="key"
          :label="key"
          :description="`${value} ${foodDetailIndo.foodDetail![key]}`"

          class="flex items-center justify-between not-last:pb-4 gap-2"
        >
          <UInputNumber
            v-model="foodForm.foodDetail![key]"
            class="w-30"
            :step="0.1"
            :min="0"
            :format-options="{

            }"
          />
        </UFormField>
      </UPageCard>
    </template>

    <template #footer>
      <UButton
        label="Annuler"
        color="neutral"
        variant="outline"
        @click="changeStatusModal('new')"
      />
      <UButton
        label="Ajouter"
        color="neutral"
        @click="validateForm()"
      />
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const { createFoodInfos, resetValueFoodForm, refreshFoods, updateFoodInfos, asGramType, asGramTypeValue, foodForm } = useFoods()
const { foodTypes } = useFoodTypes()
const toast = useToast()

const modalOpened = ref<boolean>(false)
const choiceForm = ref<'edit' | 'new'>('new')

const changeStatusModal = (choice: 'edit' | 'new') => {
  choiceForm.value = choice
  modalOpened.value = !modalOpened.value
}

const validateForm = async () => {
  if (choiceForm.value === 'edit')
    await updateFoodInfos(foodForm.value)
  await createFoodInfos()
  refreshFoods()
  changeStatusModal('new')

  toast.add({
    title: 'Aliment ajouté',
    icon: 'i-lucide:book-plus',
  })
}

const foodDetailIndo = computed<any>(() => {
  return {
    name: '',
    asGrams: '',
    foodDetail: {
      kcal: 'kcal /100g',
      glucide: 'g /100g',
      protein: 'g /100g',
      lipid: 'g /100g',
      price: '€' + asGramTypeValue.value,
    },
  }
})

defineExpose({
  changeStatusModal,
})
</script>
