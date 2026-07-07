<template>
  <article class="legal-doc">
    <header class="legal-doc__head">
      <NuxtLink
        to="/"
        class="legal-doc__back"
      >
        <v-icon
          icon="mdi-arrow-left"
          size="16"
        />
        FoodProg
      </NuxtLink>
      <h1 class="legal-doc__title">
        {{ title }}
      </h1>
      <p class="legal-doc__meta">
        Dernière mise à jour : {{ lastUpdated }}
      </p>
    </header>

    <div class="legal-doc__body">
      <slot />
    </div>
  </article>
</template>

<script setup lang="ts">
// Présentationnel : enveloppe typographique des pages légales (titre + corps).
// Le contenu (sections, listes) est passé via le slot par défaut.
defineProps<{
  title: string
  lastUpdated: string
}>()
</script>

<style scoped lang="scss">
.legal-doc {
  max-width: 720px;
  margin-inline: auto;
  padding: 1.5rem 1.25rem 5rem;

  &__head {
    margin-bottom: 2rem;
  }

  &__back {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.82rem;
    font-weight: 700;
    text-decoration: none;
    color: rgb(var(--v-theme-primary-text));
  }

  &__title {
    margin-top: 1rem;
    font-size: clamp(1.8rem, 5vw, 2.4rem);
    font-weight: 800;
    letter-spacing: -0.035em;
    line-height: 1.1;
  }

  &__meta {
    margin-top: 0.6rem;
    font-size: 0.85rem;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    line-height: 1.65;

    :deep(h2) {
      font-size: 1.2rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-top: 1rem;
    }

    :deep(p) {
      color: rgb(var(--v-theme-on-surface-variant));
      font-size: 0.96rem;
    }

    :deep(ul) {
      margin: 0.2rem 0 0 1.3rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      color: rgb(var(--v-theme-on-surface-variant));
      font-size: 0.96rem;
    }

    :deep(a) {
      color: rgb(var(--v-theme-primary-text));
      font-weight: 600;
    }

    :deep(strong) {
      color: rgb(var(--v-theme-on-surface));
      font-weight: 700;
    }
  }
}
</style>
