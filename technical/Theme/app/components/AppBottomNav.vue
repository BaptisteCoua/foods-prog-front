<template>
  <nav
    class="app-bottom-nav"
    aria-label="Navigation principale"
  >
    <div class="app-bottom-nav__pill">
      <NuxtLink
        v-for="item in items"
        :key="item.value"
        :to="item.to"
        :aria-label="item.label"
        :aria-current="item.value === active ? 'page' : undefined"
        class="app-bottom-nav__item"
        :class="{ 'app-bottom-nav__item--active': item.value === active }"
      >
        <span class="app-bottom-nav__halo" />
        <v-icon
          :icon="item.icon"
          size="24"
          class="app-bottom-nav__icon"
        />
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
const { items, active } = useMainNav()
</script>

<style scoped lang="scss">
.app-bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1006;
  display: flex;
  justify-content: center;
  padding: 0 16px calc(16px + env(safe-area-inset-bottom));
  pointer-events: none;

  &__pill {
    pointer-events: auto;
    position: relative;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px;
    border-radius: 999px;
    // Verre liquide quasi transparent : on laisse passer le fond,
    // léger dégradé de réfraction (plus lumineux en haut) + fort flou.
    background:
      linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0.08),
        rgba(255, 255, 255, 0)
      );
    backdrop-filter: blur(12px) saturate(180%);
    -webkit-backdrop-filter: blur(12px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.25);
    // Profondeur portée douce + reflet de bord interne (effet goutte d'eau).
    box-shadow:
      0 10px 40px rgba(0, 0, 0, 0.16),
      0 1px 1px rgba(255, 255, 255, 0.4) inset,
      0 -1px 1px rgba(255, 255, 255, 0.1) inset;
  }

  &__item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    border-radius: 999px;
    color: rgba(var(--v-theme-on-surface), 0.55);
    text-decoration: none;
    transition: color 0.3s var(--app-ease);

    &--active {
      color: rgb(var(--v-theme-primary));
    }
  }

  &__halo {
    position: absolute;
    inset: 0;
    border-radius: 999px;
    background: rgb(var(--v-theme-primary));
    opacity: 0;
    transform: scale(0.6);
    transition:
      opacity 0.32s var(--app-ease),
      transform 0.32s var(--app-ease);
  }

  &__item--active &__halo {
    opacity: 0.14;
    transform: scale(1);
  }

  &__icon {
    position: relative;
    transition: transform 0.32s var(--app-ease);
  }

  &__item--active &__icon {
    transform: translateY(-1px) scale(1.06);
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-bottom-nav__halo,
  .app-bottom-nav__icon {
    transition: none;
  }
}
</style>
