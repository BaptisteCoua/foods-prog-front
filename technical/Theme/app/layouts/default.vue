<template>
  <div>
    <v-app-bar
      flat
      height="64"
      class="app-bar"
    >
      <template #prepend>
        <AppLogo class="ms-3" />
      </template>
      <v-spacer />
      <v-badge
        v-if="canModerate"
        :model-value="unreadCount > 0"
        :content="unreadCount"
        :max="99"
        color="error"
        offset-x="8"
        offset-y="8"
      >
        <v-btn
          icon="mdi-bell-outline"
          variant="text"
          aria-label="Alertes"
          to="/admin/alerts"
        />
      </v-badge>
      <v-btn
        v-if="isAdmin"
        icon="mdi-account-group-outline"
        variant="text"
        aria-label="Utilisateurs"
        to="/admin/users"
      />
      <v-btn
        v-if="isAdmin"
        icon="mdi-shield-account-outline"
        variant="text"
        aria-label="Administration"
        to="/admin/recipes/import"
      />
      <ThemeToggle />
      <v-btn
        v-if="isLoggedIn"
        icon="mdi-logout-variant"
        variant="text"
        aria-label="Se déconnecter"
        @click="logout"
      />
    </v-app-bar>

    <v-main class="app-main">
      <v-container class="app-main__container">
        <div class="app-main__page">
          <slot />
        </div>
      </v-container>
    </v-main>

    <AppBottomNav />
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const { isLoggedIn } = storeToRefs(authStore)
const { logout } = authStore

// Liens staff discrets (rôle/abonnement viennent du cache useAsyncData('me')
// partagé via usePermissions). Alertes = modération (MODERATOR+) ; import
// catalogue = admin strict.
const { isAdmin, canModerate } = usePermissions()

// Badge d'alertes admin : on récupère le compteur au passage en zone admin puis
// on le rafraîchit périodiquement (pas de websocket → léger polling). Source de
// vérité partagée avec la page /admin/alerts (store Pinia), donc le badge se met
// à jour instantanément quand l'admin lit / supprime des alertes là-bas.
const alertsStore = useAdminAlertsStore()
const { unreadCount } = storeToRefs(alertsStore)

let pollTimer: ReturnType<typeof setInterval> | null = null

const stopAlertsPolling = () => {
  if (!pollTimer) return
  clearInterval(pollTimer)
  pollTimer = null
}

const startAlertsPolling = () => {
  if (pollTimer) return
  alertsStore.fetch().catch(() => {})
  pollTimer = setInterval(() => alertsStore.fetch().catch(() => {}), 60_000)
}

watch(canModerate, (moderator) => {
  if (moderator) startAlertsPolling()
  else stopAlertsPolling()
}, { immediate: true })

onBeforeUnmount(stopAlertsPolling)
</script>

<style scoped lang="scss">
.app-bar {
  background: rgba(var(--v-theme-background), 0.7) !important;
  backdrop-filter: blur(14px);
}

.app-main {
  min-height: 100dvh;

  &__container {
    max-width: 560px;
    // Laisse respirer la bottom nav flottante (pilule + safe-area).
    padding: 12px 16px calc(104px + env(safe-area-inset-bottom));
  }

  // `relative` = bloc de référence pour la page sortante (absolute) pendant
  // le fondu enchaîné entre pages.
  &__page {
    position: relative;
  }
}
</style>
