<template>
  <FormAddFood ref="formAddModal" />
  <div class="flex flex-col flex-1 w-full">
    <div class="flex py-3.5 border-b border-accented">
      <UInput
        :model-value="table?.tableApi?.getColumn('name')?.getFilterValue() as string"
        class="max-w-sm"
        placeholder="Rechercher un aliment"
        @update:model-value="table?.tableApi?.getColumn('name')?.setFilterValue($event)"
      />
    </div>

    <UTable
      ref="table"
      v-model:column-filters="columnFilters"
      :data="foods"
      :columns="columns"
      class="flex-1"
    >
      <template #asGrams-cell="{ row }">
        {{ asGramType2(row.original.asGrams) }}
        <!-- {{ row.original.asGrams }} -->
      </template>
      <template #foodDetail-cell="{ row }">
        <BadgeDetails
          v-if="row.original.foodDetail"
          :food-details="row.original.foodDetail"
        />
      </template>
      <template #foodTypes-cell="{ row }">
        <CardTypes
          v-if="row.original.foodTypes"
          :food-types="row.original.foodTypes"
        />
      </template>
      <template #action-cell="{ row }">
        <UButton
          icon="i-lucide-edit"
          variant="outline"
          color="neutral"
          class="mr-2"
          @click="openEditModal(row.original)"
        />
        <UButton
          icon="i-lucide-trash"
          variant="outline"
          color="neutral"
          @click="openConfirmModal(row.original)"
        />
      </template>
    </UTable>
  </div>

  <ConfirmationPopup
    ref="confirmationPopup"
    title="Confirmation de suppression"
    description="êtes vous sur de vouloir supprimer cet aliment ?"
    @valid="deleteOneFood()"
  />
</template>

<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'
import { useFoods } from '~/composables/useFoods'
import type { IFoods } from '~/models/foods'

const UButton = resolveComponent('UButton')
const { foods, foodForm, deleteFoodInfos, asGramType2 } = useFoods()

const table = useTemplateRef('table')
const domGenerated = ref<boolean>(false)
const confirmationPopup = ref()
const formAddModal = ref()
const foodDeleted = ref<IFoods>()
const columns: TableColumn<IFoods>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'asGrams',
    header: '/kg',
  },
  {
    accessorKey: 'foodTypes',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Types',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      })
    },
    enableSorting: true,

    // ⚠️ Voici la partie importante :
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId)
      const b = rowB.getValue(columnId)

      const idA = a?.[0]?.id ?? 0
      const idB = b?.[0]?.id ?? 0

      return idA - idB
    },
  },
  {
    accessorKey: 'foodDetail',
    header: 'valeur nutritionnelle',
  },
  {
    accessorKey: 'action',
    header: 'Action',
  },
]
const columnFilters = ref([
  {
    id: 'name',
    value: '',
  },
])

const openConfirmModal = (food: IFoods) => {
  foodDeleted.value = food
  confirmationPopup.value.stateModal()
}

const deleteOneFood = async () => {
  if (foodDeleted.value)
    await deleteFoodInfos(foodDeleted.value)
}

const openEditModal = (food: IFoods) => {
  foodForm.value = food
  formAddModal.value.changeStatusModal('edit')
}

onMounted(() => {
  domGenerated.value = true
})
</script>
