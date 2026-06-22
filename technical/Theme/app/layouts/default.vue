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
        <slot />
      </v-container>
    </v-main>

    <AppBottomNav />
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const { isLoggedIn } = storeToRefs(authStore)
const { logout } = authStore
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
}
</style>
