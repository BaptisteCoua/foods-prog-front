<template>
  <UModal
    v-model:open="open"
    :title="title"
    :description="description"
    :ui="{ footer: 'justify-end' }"
  >
    <template #footer="{ close }">
      <UButton
        label="Annuler"
        color="neutral"
        variant="outline"
        @click="close"
      />
      <UButton
        label="Valider"
        color="neutral"
        @click="valid"
      />
    </template>
  </UModal>
</template>

<script lang="ts" setup>
defineProps<{
  title: string
  description: string
}>()
const emit = defineEmits(['valid'])

const open = ref<boolean>(false)

const stateModal = () => {
  open.value = !open.value
}

const valid = () => {
  emit('valid')
  stateModal()
}

defineExpose({
  stateModal,
})
</script>

<style>

</style>
