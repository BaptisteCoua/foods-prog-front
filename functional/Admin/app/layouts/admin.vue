<template>
  <div class="admin-shell">
    <v-app-bar
      flat
      height="64"
      class="admin-shell__bar"
    >
      <template #prepend>
        <AppLogo class="ms-3" />
      </template>

      <v-chip
        size="small"
        variant="tonal"
        color="primary"
        class="admin-shell__badge ms-2"
        prepend-icon="mdi-shield-crown-outline"
      >
        Admin
      </v-chip>

      <v-spacer />

      <ThemeToggle />
      <v-btn
        icon="mdi-exit-to-app"
        variant="text"
        aria-label="Retour à l'application"
        to="/dashboard"
      />
      <v-btn
        v-if="isLoggedIn"
        icon="mdi-logout-variant"
        variant="text"
        aria-label="Se déconnecter"
        @click="logout"
      />
    </v-app-bar>

    <!-- Desktop : barre latérale fixe (pleine hauteur), contenu pleine largeur -->
    <v-navigation-drawer
      v-if="mdAndUp"
      permanent
      :width="252"
      class="admin-shell__drawer"
    >
      <v-list
        nav
        density="comfortable"
        class="admin-shell__nav"
      >
        <v-list-item
          v-for="item in items"
          :key="item.value"
          :to="item.to"
          :active="isActive(item)"
          :prepend-icon="item.icon"
          :title="item.label"
          rounded="lg"
          color="primary"
        >
          <template
            v-if="item.badge && unreadCount"
            #append
          >
            <v-badge
              inline
              color="error"
              :content="unreadCount"
              :max="99"
            />
          </template>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main class="admin-shell__main">
      <!-- Mobile : onglets horizontaux en haut -->
      <v-tabs
        v-if="!mdAndUp"
        :model-value="activeValue"
        class="admin-shell__tabs"
        align-tabs="center"
        density="comfortable"
        show-arrows
      >
        <v-tab
          v-for="item in items"
          :key="item.value"
          :value="item.value"
          :to="item.to"
        >
          <v-icon
            :icon="item.icon"
            size="18"
            start
          />
          {{ item.label }}
          <v-badge
            v-if="item.badge && unreadCount"
            inline
            color="error"
            :content="unreadCount"
            :max="99"
            class="ms-1"
          />
        </v-tab>
      </v-tabs>

      <div class="admin-shell__content">
        <slot />
      </div>
    </v-main>
  </div>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'

const { mdAndUp } = useDisplay()

const authStore = useAuthStore()
const { isLoggedIn } = storeToRefs(authStore)
const { logout } = authStore

const { items, isActive, activeValue } = useAdminNav()
// Démarre le polling des alertes + expose le compteur non lu pour le badge de
// nav (le store est partagé avec le bouton du header de l'app principale).
const { unreadCount } = useAlertsBadge()
</script>

<style scoped lang="scss">
.admin-shell {
  &__bar {
    background: rgba(var(--v-theme-background), 0.7) !important;
    backdrop-filter: blur(14px);
  }

  &__badge {
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  &__drawer {
    border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    background: rgb(var(--v-theme-background));
  }

  &__nav {
    padding: 0.75rem 0.6rem;
  }

  &__main {
    min-height: 100dvh;
  }

  &__tabs {
    border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  }

  // Pleine largeur sur ordinateur (la zone admin n'est pas bridée comme l'app
  // mobile à 560px) ; marges confortables et plafond large pour rester lisible
  // sur très grands écrans.
  &__content {
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;
    padding: 1.5rem clamp(1rem, 3vw, 2.5rem) 3rem;
  }
}
</style>
