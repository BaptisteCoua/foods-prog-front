<template>
  <AppSheet
    :model-value="modelValue"
    :max-width="520"
    :title="kind === 'role' ? 'Changer le rôle' : 'Changer l\'abonnement'"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div
      v-if="user && kind && nextValue"
      class="change"
    >
      <header class="change__head">
        <h2 class="change__title">
          {{ kind === 'role' ? 'Changer le rôle' : 'Changer l\'abonnement' }}
        </h2>
        <p class="change__subtitle">
          Vérifie bien avant de confirmer — ce changement est immédiat.
        </p>
      </header>

      <div class="change__user">
        <span class="change__user-name">{{ userDisplayName(user.displayName) }}</span>
        <span class="change__user-email">{{ user.email }}</span>
        <span class="change__user-id">ID #{{ user.id }}</span>
      </div>

      <div class="change__transition">
        <div class="change__slot">
          <span class="change__slot-label">Actuel</span>
          <v-chip
            size="small"
            variant="flat"
            :color="meta[currentValue].color"
            :prepend-icon="meta[currentValue].icon"
          >
            {{ meta[currentValue].label }}
          </v-chip>
        </div>

        <v-icon
          icon="mdi-arrow-right"
          size="20"
          class="change__arrow"
        />

        <div class="change__slot">
          <span class="change__slot-label">Nouveau</span>
          <v-chip
            size="small"
            variant="flat"
            :color="meta[nextValue].color"
            :prepend-icon="meta[nextValue].icon"
          >
            {{ meta[nextValue].label }}
          </v-chip>
        </div>
      </div>

      <p class="change__note">
        <v-icon
          icon="mdi-information-outline"
          size="16"
        />
        L'utilisateur devra se reconnecter pour que son nouveau
        {{ kind === 'role' ? 'rôle' : 'abonnement' }} prenne effet.
      </p>

      <div class="change__actions">
        <v-btn
          variant="text"
          :disabled="busy"
          @click="emit('update:modelValue', false)"
        >
          Annuler
        </v-btn>
        <v-btn
          color="primary"
          flat
          :loading="busy"
          @click="emit('confirm')"
        >
          Confirmer
        </v-btn>
      </div>
    </div>
  </AppSheet>
</template>

<script setup lang="ts">
import type { SubscriptionPlan, UserRole } from '../../../Profile/app/types/me'
import type { AdminUser } from '../types/admin-user'

// Popup de confirmation pour tout changement de rôle ou d'abonnement : récapitule
// l'identité du compte et oppose la valeur actuelle à la nouvelle, pour éviter
// toute fausse manœuvre. Générique sur les deux axes via `kind`.
const props = defineProps<{
  modelValue: boolean
  user: AdminUser | null
  kind: 'role' | 'plan' | null
  nextValue: UserRole | SubscriptionPlan | null
  busy: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
  'confirm': []
}>()

// Sélectionne le jeu de métadonnées (label/couleur/icône) selon l'axe édité.
const meta = computed<Record<string, { label: string, color: string, icon: string }>>(
  () => (props.kind === 'role' ? ROLE_META : PLAN_META),
)

// Valeur actuelle du compte sur l'axe édité (le « depuis » de la transition).
const currentValue = computed(() =>
  (props.kind === 'role' ? props.user?.role : props.user?.plan) ?? '',
)
</script>

<style scoped lang="scss">
.change {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.25rem 1.1rem 1.4rem;

  &__title {
    font-size: 1.15rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  &__subtitle {
    font-size: 0.82rem;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-top: 0.1rem;
  }

  &__user {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    padding: 0.75rem 0.9rem;
    border-radius: 14px;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    background: rgb(var(--v-theme-surface-variant), 0.04);
  }

  &__user-name {
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  &__user-email {
    font-size: 0.85rem;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__user-id {
    font-size: 0.78rem;
    color: rgb(var(--v-theme-on-surface-variant));
    font-variant-numeric: tabular-nums;
  }

  &__transition {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 1rem;
  }

  &__slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
  }

  &__slot-label {
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__arrow {
    color: rgb(var(--v-theme-on-surface-variant));
    margin-bottom: 0.15rem;
  }

  &__note {
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;
    font-size: 0.8rem;
    line-height: 1.45;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
  }
}
</style>
