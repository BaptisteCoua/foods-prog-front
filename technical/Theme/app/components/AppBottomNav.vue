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

        <span
          v-if="item.value === 'profile' && showAvatar"
          class="app-bottom-nav__avatar app-bottom-nav__icon"
        >
          <img
            v-if="showPhoto"
            :src="me!.picture!"
            :alt="item.label"
            class="app-bottom-nav__avatar-photo"
            referrerpolicy="no-referrer"
            @error="photoFailed = true"
          >
          <template v-else>{{ initials }}</template>
        </span>
        <v-icon
          v-else
          :icon="item.icon"
          size="22"
          class="app-bottom-nav__icon"
        />
        <span class="app-bottom-nav__label">{{ item.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
const { items, active } = useMainNav()

// Avatar utilisateur sur l'entrée « Profil » : photo Google → initiales.
// `me` partage le cache useAsyncData('me') → pas de requête supplémentaire.
const { me } = useMe()
const photoFailed = ref(false)

const showPhoto = computed(() => Boolean(me.value?.picture) && !photoFailed.value)
const showAvatar = computed(() => Boolean(me.value))
const initials = computed(() => {
  const source = me.value?.displayName?.trim() || me.value?.email || '?'
  return source.slice(0, 2).toUpperCase()
})
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
  padding: 0 16px calc(21px + env(safe-area-inset-bottom));
  pointer-events: none;

  &__pill {
    pointer-events: auto;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-around;
    gap: 4px;
    width: 100%;
    max-width: 280px;
    padding: 6px;
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
    // Bordure liée au thème : hairline sombre sur fond clair (où le liseré blanc
    // était invisible), liseré clair en thème sombre — la pilule reste définie
    // dans les deux modes.
    border: 1px solid rgba(var(--v-border-color), 0.16);
    // Profondeur portée douce + reflet de bord interne (effet goutte d'eau).
    box-shadow:
      0 10px 40px rgba(0, 0, 0, 0.16),
      0 1px 1px rgba(255, 255, 255, 0.4) inset,
      0 -1px 1px rgba(255, 255, 255, 0.1) inset;
  }

  &__item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    width: 66px;
    height: 52px;
    border-radius: 999px;
    color: rgba(var(--v-theme-on-surface), 0.65);
    text-decoration: none;
    transition: color 0.3s var(--app-ease);

    &--active {
      color: rgb(var(--v-theme-primary-text));
    }
  }

  &__label {
    position: relative;
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    line-height: 1;
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

  &__avatar {
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border-radius: 999px;
    overflow: hidden;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: currentcolor;
    background: rgba(var(--v-theme-on-surface), 0.1);
    box-shadow: 0 0 0 1.5px rgba(255, 255, 255, 0.25);
  }

  &__item--active &__avatar {
    color: rgb(var(--v-theme-primary-text));
    background: rgba(var(--v-theme-primary), 0.16);
    box-shadow: 0 0 0 1.5px rgba(var(--v-theme-primary), 0.45);
  }

  &__avatar-photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-bottom-nav__halo,
  .app-bottom-nav__icon {
    transition: none;
  }
}
</style>
