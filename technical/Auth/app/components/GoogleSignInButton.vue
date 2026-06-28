<template>
  <button
    type="button"
    class="google-btn"
    :class="{ 'google-btn--dark': isDark, 'google-btn--loading': loading }"
    :disabled="loading"
    @click="$emit('click')"
  >
    <span
      v-if="loading"
      class="google-btn__spinner"
      aria-hidden="true"
    />
    <svg
      v-else
      class="google-btn__logo"
      viewBox="0 0 48 48"
      width="18"
      height="18"
      aria-hidden="true"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
    <span class="google-btn__label">Continuer avec Google</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{ loading?: boolean }>()
defineEmits<{ click: [] }>()

// Use the Theme layer's bridge — components never call Vuetify's useTheme()
// directly (it isn't auto-imported, hence the "useTheme is not defined").
const { isDark } = useAppTheme()
</script>

<style scoped lang="scss">
// Bouton conforme aux Google Identity branding guidelines :
// conteneur blanc (#fff) / sombre (#131314), bordure dédiée, logo « G »
// officiel, texte Roboto Medium 14px. Pas de Vuetify ici → maîtrise pixel.
.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  width: 100%;
  height: 44px;
  padding: 0 0.75rem;
  border: 1px solid #747775;
  border-radius: 9999px;
  background: #fff;
  color: #1f1f1f;
  font-family: 'Roboto', 'Inter', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    box-shadow 0.18s ease;

  &:hover:not(:disabled) {
    background: #f7f8f8;
    box-shadow: 0 1px 3px rgba(60, 64, 67, 0.2);
  }

  &:active:not(:disabled) {
    background: #ececed;
  }

  &:disabled {
    cursor: default;
    opacity: 0.7;
  }

  &--dark {
    border-color: #8e918f;
    background: #131314;
    color: #e3e3e3;

    &:hover:not(:disabled) {
      background: #1e1f20;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    }

    &:active:not(:disabled) {
      background: #272829;
    }

    .google-btn__spinner {
      border-color: rgba(227, 227, 227, 0.35);
      border-top-color: #e3e3e3;
    }
  }

  &__logo {
    flex: 0 0 auto;
  }

  &__label {
    line-height: 1;
  }

  &__spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(31, 31, 31, 0.25);
    border-top-color: #1f1f1f;
    border-radius: 50%;
    animation: google-btn-spin 0.7s linear infinite;
  }
}

@keyframes google-btn-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .google-btn__spinner {
    animation-duration: 1.4s;
  }
}
</style>
