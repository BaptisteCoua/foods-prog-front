<template>
  <div class="alerts">
    <header class="alerts__head">
      <div>
        <h1 class="alerts__title">
          Alertes
        </h1>
        <p class="alerts__count">
          {{ headline }}
        </p>
      </div>
    </header>

    <div
      v-if="alerts.length"
      class="alerts__actions"
    >
      <v-btn
        variant="text"
        size="small"
        prepend-icon="mdi-check-all"
        :disabled="!unreadCount"
        @click="markAllRead"
      >
        Tout marquer comme lu
      </v-btn>
      <v-btn
        variant="text"
        size="small"
        color="error"
        prepend-icon="mdi-trash-can-outline"
        @click="clearAll"
      >
        Tout effacer
      </v-btn>
    </div>

    <!-- Loading -->
    <div
      v-if="pending && !loaded"
      class="alerts__list"
    >
      <v-skeleton-loader
        v-for="n in 4"
        :key="n"
        type="list-item-avatar-two-line"
        class="alerts__skeleton"
      />
    </div>

    <!-- Empty -->
    <v-card
      v-else-if="!alerts.length"
      class="alerts__state"
      elevation="0"
    >
      <span class="alerts__state-icon">
        <v-icon
          icon="mdi-bell-check-outline"
          size="26"
        />
      </span>
      <p>Aucune alerte. Tout est à jour&nbsp;!</p>
    </v-card>

    <!-- List -->
    <ul
      v-else
      class="alerts__list"
    >
      <AppReveal
        v-for="(alert, index) in alerts"
        :key="alert.id"
        :delay="Math.min(index * 35, 210)"
      >
        <AdminAlertCard
          :alert
          @open="onOpen"
          @read="onRead"
          @delete="onDelete"
        />
      </AppReveal>
    </ul>

    <p
      v-if="alerts.length"
      class="alerts__hint"
    >
      Glissez une alerte vers la gauche pour la supprimer.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { AdminAlert } from '../../types/admin-alert'

definePageMeta({ middleware: 'moderator', layout: 'admin' })
useHead({ title: 'Alertes · Admin' })

const store = useAdminAlertsStore()
const { alerts, pending, loaded, unreadCount } = storeToRefs(store)
const { fetch, markRead, markAllRead, remove, clearAll } = store

onMounted(() => fetch().catch(() => {}))

const headline = computed(() => {
  if (!alerts.value.length) return 'Vous serez prévenu des nouveaux avis ici'
  if (!unreadCount.value) return `${alerts.value.length} alerte(s) · toutes lues`
  return `${unreadCount.value} non lue(s) · ${alerts.value.length} au total`
})

const onOpen = async (alert: AdminAlert) => {
  await markRead(alert.id)
  if (alert.feedbackId) await navigateTo(`/feedback/${alert.feedbackId}`)
}

const onRead = (alert: AdminAlert) => markRead(alert.id)
const onDelete = (alert: AdminAlert) => remove(alert.id)
</script>

<style scoped lang="scss">
.alerts {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.5rem 0.25rem 0;
  }

  &__title {
    font-size: 1.7rem;
    font-weight: 800;
    letter-spacing: -0.03em;
  }

  &__count {
    font-size: 0.82rem;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-top: 0.2rem;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin: 0.25rem 0 0;
    padding: 0;
  }

  &__skeleton {
    border-radius: 16px;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  }

  &__state {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.7rem;
    padding: 2.5rem 1.5rem;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__state-icon {
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    border-radius: 16px;
    color: rgb(var(--v-theme-primary-text));
    background: rgba(var(--v-theme-primary), 0.12);
  }

  &__hint {
    text-align: center;
    font-size: 0.74rem;
    color: rgb(var(--v-theme-on-surface-variant));
    opacity: 0.8;
    margin-top: 0.25rem;
  }
}
</style>
