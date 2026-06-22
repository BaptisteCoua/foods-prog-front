<template>
  <div class="profile">
    <header class="profile__head">
      <h1 class="profile__title">
        Mon profil
      </h1>
    </header>

    <template v-if="pending">
      <v-skeleton-loader
        type="list-item-avatar-two-line"
        class="profile__skeleton"
      />
      <v-skeleton-loader
        type="image"
        class="profile__skeleton"
      />
    </template>

    <v-card
      v-else-if="hasError"
      class="profile__state"
      elevation="0"
    >
      <div class="profile__state-icon">
        <v-icon
          icon="mdi-alert-circle-outline"
          size="26"
        />
      </div>
      <p class="profile__state-text">
        Impossible de charger ton profil.
      </p>
      <v-btn
        variant="tonal"
        color="primary"
        @click="reload"
      >
        Réessayer
      </v-btn>
    </v-card>

    <template v-else>
      <AppReveal :delay="0">
        <ProfileIdentityCard
          :me="me ?? null"
          :saving="savingName"
          @save-name="onSaveName"
        />
      </AppReveal>

      <AppReveal
        v-if="target"
        :delay="90"
      >
        <ProfileTargetCard
          :target="target"
          :proposal="proposal"
          :is-custom="isCustom"
          :proposal-differs="proposalDiffers"
          :saving="saving"
          @edit="openTargetEdit"
          @apply="applyProposal"
        />
      </AppReveal>

      <AppReveal :delay="180">
        <ProfileAccountCard @logout="onLogout" />
      </AppReveal>
    </template>

    <ProfileTargetEditDialog
      ref="targetDialog"
      :target="target"
      :saving="saving"
      @submit="onSaveTarget"
    />
  </div>
</template>

<script setup lang="ts">
import type { NutritionTargetPayload } from '../types/target'

useHead({ title: 'Profil' })

const authStore = useAuthStore()

const { me, pending: mePending, error: meError, savingName, updateDisplayName } = useMe()
const {
  target,
  proposal,
  isCustom,
  proposalDiffers,
  pending: targetPending,
  saving,
  saveTarget,
  applyProposal,
} = useNutritionTarget()

const targetDialog = useTemplateRef('targetDialog')

const pending = computed(() => mePending.value || targetPending.value)
const hasError = computed(() => Boolean(meError.value))

const reload = () => {
  reloadNuxtApp({ path: '/profile' })
}

const onSaveName = (name: string) => {
  void updateDisplayName(name)
}

const openTargetEdit = () => {
  targetDialog.value?.open()
}

const onSaveTarget = async (payload: NutritionTargetPayload) => {
  const ok = await saveTarget(payload)
  if (ok) targetDialog.value?.close()
}

const onLogout = async () => {
  await authStore.logout()
}
</script>

<style scoped lang="scss">
.profile {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__head {
    padding: 0.5rem 0.25rem 0;
  }

  &__title {
    font-size: 1.7rem;
    font-weight: 800;
    letter-spacing: -0.03em;
  }

  &__skeleton {
    border-radius: 18px;
  }

  &__state {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.8rem;
    padding: 2.5rem 1.5rem;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  }

  &__state-icon {
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    border-radius: 16px;
    color: rgb(var(--v-theme-error));
    background: rgba(var(--v-theme-error), 0.12);
  }

  &__state-text {
    font-size: 0.95rem;
    color: rgb(var(--v-theme-on-surface-variant));
  }
}
</style>
