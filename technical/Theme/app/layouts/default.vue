<template>
  <div>
    <v-app-bar
      flat
      density="comfortable"
      class="app-bar"
    >
      <template #prepend>
        <AppLogo class="ms-2" />
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
      <v-container class="py-4">
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
  background: rgba(var(--v-theme-surface), 0.85);
  backdrop-filter: blur(8px);
}

.app-main {
  min-height: 100dvh;
}
</style>
