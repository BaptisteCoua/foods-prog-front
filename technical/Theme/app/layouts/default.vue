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
          icon="mdi-shield-crown-outline"
          variant="text"
          aria-label="Espace admin"
          to="/admin"
        />
      </v-badge>
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

// Bouton unique vers l'espace admin (`/admin`), visible pour les modérateurs et
// admins. Le badge montre les alertes non lues : compteur + polling léger
// encapsulés dans useAlertsBadge, qui s'appuie sur le store partagé avec
// l'espace admin (mise à jour instantanée quand une alerte y est lue/supprimée).
const { canModerate, unreadCount } = useAlertsBadge()
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
