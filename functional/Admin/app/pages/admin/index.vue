<template>
  <div class="admin-dash">
    <header class="admin-dash__head">
      <h1 class="admin-dash__title">
        Tableau de bord
      </h1>
      <p class="admin-dash__subtitle">
        {{ greeting }}
      </p>
    </header>

    <!-- Indicateurs -->
    <section class="admin-dash__stats">
      <AppReveal v-if="isAdmin">
        <v-card
          class="admin-dash__stat"
          elevation="0"
        >
          <span class="admin-dash__stat-icon admin-dash__stat-icon--users">
            <v-icon
              icon="mdi-account-group-outline"
              size="22"
            />
          </span>
          <div class="admin-dash__stat-body">
            <span class="admin-dash__stat-value">
              <v-progress-circular
                v-if="pending"
                indeterminate
                size="20"
                width="2"
              />
              <template v-else>{{ usersTotal ?? '—' }}</template>
            </span>
            <span class="admin-dash__stat-label">Utilisateurs inscrits</span>
          </div>
        </v-card>
      </AppReveal>

      <AppReveal :delay="60">
        <v-card
          class="admin-dash__stat"
          elevation="0"
        >
          <span class="admin-dash__stat-icon admin-dash__stat-icon--alerts">
            <v-icon
              icon="mdi-bell-outline"
              size="22"
            />
          </span>
          <div class="admin-dash__stat-body">
            <span class="admin-dash__stat-value">{{ unreadCount }}</span>
            <span class="admin-dash__stat-label">Alertes non lues</span>
          </div>
        </v-card>
      </AppReveal>
    </section>

    <!-- Raccourcis vers les sections -->
    <section class="admin-dash__section">
      <h2 class="admin-dash__section-title">
        Accès rapide
      </h2>
      <div class="admin-dash__shortcuts">
        <AppReveal
          v-for="(item, index) in shortcuts"
          :key="item.value"
          :delay="Math.min(index * 50, 200)"
        >
          <v-card
            :to="item.to"
            class="admin-dash__shortcut"
            elevation="0"
            hover
          >
            <span class="admin-dash__shortcut-icon">
              <v-icon
                :icon="item.icon"
                size="24"
              />
            </span>
            <div class="admin-dash__shortcut-body">
              <span class="admin-dash__shortcut-label">{{ item.label }}</span>
              <span class="admin-dash__shortcut-desc">{{ descriptions[item.value] }}</span>
            </div>
            <v-badge
              v-if="item.badge && unreadCount"
              inline
              color="error"
              :content="unreadCount"
              :max="99"
            />
            <v-icon
              icon="mdi-chevron-right"
              class="admin-dash__shortcut-chevron"
            />
          </v-card>
        </AppReveal>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'moderator', layout: 'admin' })
useHead({ title: 'Tableau de bord · Admin' })

const { items } = useAdminNav()
const { me, isAdmin, usersTotal, unreadCount, pending, loadUsersTotal } = useAdminDashboard()

onMounted(loadUsersTotal)

// Raccourcis = entrées de nav hormis le tableau de bord lui-même.
const shortcuts = computed(() => items.value.filter(item => item.value !== 'dashboard'))

const descriptions: Record<string, string> = {
  users: 'Consulter les comptes, rôles et abonnements',
  recipes: 'Importer des recettes dans le catalogue global',
  alerts: 'Nouveaux avis et suggestions à modérer',
}

const greeting = computed(() => {
  const name = me.value?.displayName?.trim() || me.value?.email
  return name ? `Bienvenue, ${name}` : 'Espace d\'administration'
})
</script>

<style scoped lang="scss">
.admin-dash {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;

  &__head {
    padding: 0.25rem 0;
  }

  &__title {
    font-size: 1.9rem;
    font-weight: 800;
    letter-spacing: -0.03em;
  }

  &__subtitle {
    font-size: 0.9rem;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-top: 0.2rem;
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
  }

  &__stat {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.1rem 1.25rem;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  }

  &__stat-icon {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    border-radius: 14px;
    flex-shrink: 0;

    &--users {
      color: #6366f1;
      background: rgba(99, 102, 241, 0.12);
    }

    &--alerts {
      color: rgb(var(--v-theme-primary-text));
      background: rgba(var(--v-theme-primary), 0.12);
    }
  }

  &__stat-body {
    display: flex;
    flex-direction: column;
  }

  &__stat-value {
    font-size: 1.6rem;
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.02em;
  }

  &__stat-label {
    font-size: 0.8rem;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__section-title {
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-bottom: 0.75rem;
  }

  &__shortcuts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 0.85rem;
  }

  &__shortcut {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    padding: 1rem 1.1rem;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  }

  &__shortcut-icon {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    flex-shrink: 0;
    color: rgb(var(--v-theme-primary-text));
    background: rgba(var(--v-theme-primary), 0.1);
  }

  &__shortcut-body {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  &__shortcut-label {
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  &__shortcut-desc {
    font-size: 0.78rem;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__shortcut-chevron {
    color: rgb(var(--v-theme-on-surface-variant));
    opacity: 0.6;
  }
}
</style>
