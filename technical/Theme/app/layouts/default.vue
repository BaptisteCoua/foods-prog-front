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
        <div
          class="app-main__swipe"
          :class="{ 'app-main__swipe--dragging': dragging }"
          :style="{ transform: `translateX(${offset}px)` }"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerCancel"
        >
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

// Swipe left/right to move between top-level sections (mobile-app feel).
const {
  offset,
  dragging,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
} = useSwipeNavigation()
</script>

<style scoped lang="scss">
.app-bar {
  background: rgba(var(--v-theme-background), 0.7) !important;
  backdrop-filter: blur(14px);
}

.app-main {
  min-height: 100dvh;
  // Le drag horizontal et les transitions slide ne doivent jamais révéler
  // de scrollbar latérale.
  overflow-x: clip;

  &__container {
    max-width: 560px;
    // Laisse respirer la bottom nav flottante (pilule + safe-area).
    padding: 12px 16px calc(104px + env(safe-area-inset-bottom));
  }

  // Surface de swipe inter-pages : suit le doigt à l'horizontale,
  // laisse le scroll vertical natif (pan-y), revient en place au relâcher.
  // `relative` = bloc de référence pour la page sortante (absolute) pendant
  // la transition slide.
  &__swipe {
    position: relative;
    touch-action: pan-y;
    transition: transform 0.32s var(--app-ease);

    &--dragging {
      transition: none;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-main__swipe {
    transition: none;
  }
}
</style>
