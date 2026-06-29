<template>
  <v-main class="landing-layout">
    <header class="landing-layout__bar">
      <AppLogo />
      <div class="landing-layout__actions">
        <ThemeToggle />
        <v-btn
          variant="text"
          to="/login"
        >
          Se connecter
        </v-btn>
        <v-btn
          color="primary"
          flat
          class="landing-layout__cta"
          to="/register"
        >
          Commencer
        </v-btn>
      </div>
    </header>

    <div class="landing-layout__content">
      <slot />
    </div>

    <footer class="landing-layout__footer">
      <span class="landing-layout__copy">© FoodProg</span>
      <NuxtLink
        to="/privacy"
        class="landing-layout__link"
      >
        Confidentialité
      </NuxtLink>
      <NuxtLink
        to="/terms"
        class="landing-layout__link"
      >
        CGU
      </NuxtLink>
    </footer>
  </v-main>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.landing-layout {
  min-height: 100dvh;
  background:
    radial-gradient(130% 80% at 50% -20%, rgba(var(--v-theme-primary), 0.14), transparent 55%),
    rgb(var(--v-theme-background));

  &__bar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.85rem 1.25rem;
    background: rgba(var(--v-theme-background), 0.65);
    backdrop-filter: blur(14px);
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  // Le « Se connecter » texte encombre sur très petit écran : on le masque,
  // le CTA principal suffit (le login reste accessible depuis l'écran register).
  &__content {
    padding: 0;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1.2rem;
    padding: 2rem 1.25rem calc(2rem + env(safe-area-inset-bottom));
    font-size: 0.82rem;
  }

  &__copy {
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__link {
    color: rgb(var(--v-theme-on-surface-variant));
    text-decoration: none;
    font-weight: 600;

    &:hover {
      color: rgb(var(--v-theme-primary));
    }
  }
}

@media (max-width: 420px) {
  .landing-layout__actions .v-btn[href="/login"] {
    display: none;
  }
}
</style>
