<template>
  <div>
    <UButton
      icon="i-lucide:plus"
      @click="changeStatusModal()"
    >
      Ajouter un repas
    </UButton>
    <UModal
      v-model:open="modalOpened"
      title="Ajouter un aliment"
      :ui="{ footer: 'justify-end' }"
      @after:leave=""
    >
      <template #body>
        {{ mealForm }}
        <UPageCard
          variant="subtle"
          :ui="{ container: 'divide-y divide-default' }"
        >
          <UFormField
            name="name"
            label="Nom"
            description="Exemple : Poteau FEUUUU"
            class="flex items-center justify-between not-last:pb-4 gap-2"
          >
            <UInput
              v-model="mealForm.name"
            />
          </UFormField>
          <UFormField
            name="unite"
            label="Url de l'image"
            description="Entrez l'url de l'image dans le champ"
            class="flex items-center justify-between not-last:pb-4 gap-2"
          >
            <UInput
              v-model="mealForm.img"
            />
          </UFormField>
        </UPageCard>
        <UPageCard
          variant="outline"
          class="mt-2"
        >
          <div class="flex place-items-center flex-col">
            <span>Valeur nutritionnel total</span>
            <BadgeDetails
              :food-details="mealForm.totalFoodsDetails"
            />
          </div>
        </UPageCard>
        <UPageCard
          variant="outline"
          class="mt-2"
          :ui="{ container: 'divide-y divide-default' }"
        >
          <UFormField
            name="name"
            label="Nom"
            class=""
          >
            <template #description>
              <div
                v-for="(value, i) in mealForm.mealDetails"
                :key="i"
              >
                <div
                  class="flex justify-between"
                >
                  <USelectMenu
                    v-model="value.food"
                    :items="foods"
                    label-key="name"
                    class="w-80"
                  />
                  <UFieldGroup>
                    <UInput
                      v-model="value.quantity"
                      class="w-13 pl-0"
                      placeholder="Quantité"
                    />
                    <UInput
                      class="w-7"
                      disabled
                      placeholder="g"
                    />
                  </UFieldGroup>
                </div>
                <BadgeDetails
                  v-if="value.food.foodDetail"
                  price
                  :food-details="quantityCalculTotalFoodDetail(value).value"
                />
              </div>
            </template>
          </UFormField>
          <UFormField
            name="unite"
            label="Url de l'image"
            description="Entrez l'url de l'image dans le champ"
            class="flex items-center justify-between not-last:pb-4 gap-2"
          >
            <UInput
              v-model="mealForm.img"
            />
          </UFormField>
        </UPageCard>
      </template>

      <template #footer>
        <UButton
          label="Annuler"
          color="neutral"
          variant="outline"
          @click="changeStatusModal()"
        />
        <UButton
          label="Ajouter"
          color="neutral"
          @click="validateForm()"
        />
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
import type { IFoodsDetails } from '~/models/foods'
import type { IMealDetails } from '~/models/meals'

const modalOpened = ref<boolean>(false)
const { mealForm } = useMeals()
const { foods } = useFoods()

const validateForm = () => {

}

const changeStatusModal = () => {
  modalOpened.value = !modalOpened.value
}

const quantityCalculTotalFoodDetail = (param: IMealDetails) => computed((): IFoodsDetails => {
  let result: IFoodsDetails = param.food.foodDetail

  if (param.food.foodDetail)
    result = Object.fromEntries(
      Object.entries(param.food.foodDetail).map(([key, value]) => {
        return [key, value * (param.quantity / 100)]
      }),
    ) as IFoodsDetails | any

  return result
})

defineExpose({
  changeStatusModal,
})
</script>

<style>

</style>
