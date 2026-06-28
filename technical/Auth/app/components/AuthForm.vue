<template>
  <AppReveal class="auth-form-wrap">
    <v-card
      class="auth-form"
      :class="{ 'auth-form--register': isRegister }"
      elevation="0"
    >
      <div
        class="auth-form__head"
        :class="{ 'auth-form__head--accent': isRegister }"
      >
        <v-icon
          v-if="isRegister"
          class="auth-form__head-icon"
          icon="mdi-sprout-outline"
          size="28"
        />
        <h1 class="auth-form__title">
          {{ isRegister ? 'Rejoins FoodProg' : 'Bon retour' }}
        </h1>
        <p class="auth-form__subtitle">
          {{ isRegister ? 'Crée ton compte en 30 secondes.' : 'Connecte-toi pour continuer.' }}
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

      <template v-if="isGoogleEnabled">
        <div class="auth-form__divider">
          <span class="auth-form__divider-text">ou</span>
        </div>
        <GoogleSignInButton
          :loading="isGoogleLoading"
          @click="signInWithGoogle"
        />
      </template>

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

const {
  isEnabled: isGoogleEnabled,
  isLoading: isGoogleLoading,
  signIn: signInWithGoogle,
} = useGoogleSignIn()

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
  overflow: hidden;

  &--register {
    border-color: rgba(var(--v-theme-primary), 0.35);
  }

  &__head {
    margin-bottom: 1.5rem;

    &--accent {
      margin: -2rem -1.75rem 1.75rem;
      padding: 2rem 1.75rem 1.5rem;
      background:
        radial-gradient(120% 140% at 0% 0%, rgba(var(--v-theme-primary), 0.9), transparent 70%),
        linear-gradient(135deg, rgb(var(--v-theme-primary)), rgba(var(--v-theme-primary), 0.7));

      .auth-form__title,
      .auth-form__subtitle {
        color: #fff;
      }

      .auth-form__subtitle {
        opacity: 0.92;
      }
    }
  }

  &__head-icon {
    color: #fff;
    margin-bottom: 0.6rem;
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

  &__divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 1.25rem 0;
    color: rgb(var(--v-theme-on-surface-variant));
    font-size: 0.85rem;

    &::before,
    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(var(--v-border-color), var(--v-border-opacity));
    }
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
