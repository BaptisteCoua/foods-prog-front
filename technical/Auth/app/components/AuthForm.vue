<template>
  <AppReveal class="auth-form-wrap">
    <v-card
      class="auth-form"
      elevation="0"
    >
      <div class="auth-form__head">
        <h1 class="auth-form__title">
          {{ isRegister ? 'Créer un compte' : 'Bon retour' }}
        </h1>
        <p class="auth-form__subtitle">
          {{ isRegister ? 'Quelques secondes pour démarrer.' : 'Connecte-toi pour continuer.' }}
        </p>
      </div>

      <v-form
        ref="formRef"
        @submit.prevent="submit"
      >
        <v-text-field
          v-model="email"
          label="E-mail"
          type="email"
          autocomplete="email"
          prepend-inner-icon="mdi-email-outline"
          :rules="[required, emailRule]"
        />
        <v-text-field
          v-model="password"
          label="Mot de passe"
          type="password"
          :autocomplete="isRegister ? 'new-password' : 'current-password'"
          prepend-inner-icon="mdi-lock-outline"
          :rules="passwordRules"
        />

        <v-btn
          type="submit"
          color="primary"
          size="large"
          block
          flat
          :loading="isSubmitting"
          class="auth-form__submit"
        >
          {{ isRegister ? 'Créer mon compte' : 'Se connecter' }}
        </v-btn>
      </v-form>

      <p class="auth-form__switch">
        {{ isRegister ? 'Déjà un compte ?' : 'Pas encore de compte ?' }}
        <NuxtLink
          :to="isRegister ? '/login' : '/register'"
          class="auth-form__link"
        >
          {{ isRegister ? 'Se connecter' : 'Créer un compte' }}
        </NuxtLink>
      </p>
    </v-card>
  </AppReveal>
</template>

<script setup lang="ts">
import type { AuthMode } from '../types/auth'

const props = defineProps<{ mode: AuthMode }>()

const { required, email: emailRule, minLength } = useValidationRules()
const { formRef, email, password, isSubmitting, submit } = useAuthForm(props.mode)

const isRegister = computed(() => props.mode === 'register')
const passwordRules = computed(() => (isRegister.value ? [required, minLength(8)] : [required]))
</script>

<style scoped lang="scss">
.auth-form-wrap {
  width: 100%;
  max-width: 400px;
}

.auth-form {
  width: 100%;
  padding: 2rem 1.75rem;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

  &__head {
    margin-bottom: 1.5rem;
  }

  &__title {
    font-size: 1.75rem;
    font-weight: 800;
    letter-spacing: -0.03em;
  }

  &__subtitle {
    color: rgb(var(--v-theme-on-surface-variant));
    margin-top: 0.35rem;
    font-size: 0.95rem;
  }

  &__submit {
    margin-top: 0.5rem;
    font-weight: 700;
  }

  &__switch {
    margin-top: 1.5rem;
    text-align: center;
    color: rgb(var(--v-theme-on-surface-variant));
    font-size: 0.9rem;
  }

  &__link {
    color: rgb(var(--v-theme-primary));
    font-weight: 700;
    text-decoration: none;
  }
}
</style>
