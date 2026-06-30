<template>
  <div class="admin-users">
    <header class="admin-users__head">
      <div>
        <h1 class="admin-users__title">
          Utilisateurs
        </h1>
        <p class="admin-users__count">
          {{ headline }}
        </p>
      </div>
    </header>

    <v-card
      class="admin-users__card"
      elevation="0"
    >
      <v-data-table-server
        :headers="headers"
        :items="items"
        :items-length="total"
        :loading="pending"
        :page="page"
        :items-per-page="pageSize"
        :items-per-page-options="itemsPerPageOptions"
        hover
        @update:options="onOptions"
      >
        <template #[`header.role`]="{ column }">
          <div class="admin-users__th">
            <button
              type="button"
              class="admin-users__sort"
              :class="{ 'admin-users__sort--active': sortBy === 'role' }"
              @click="toggleSort('role')"
            >
              <span>{{ column.title }}</span>
              <v-icon
                :icon="sortIcon('role')"
                size="15"
              />
            </button>
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  :icon="roleFilter ? 'mdi-filter' : 'mdi-filter-variant'"
                  :color="roleFilter ? 'primary' : undefined"
                  size="x-small"
                  variant="text"
                  aria-label="Filtrer par rôle"
                />
              </template>
              <v-list density="compact">
                <v-list-item
                  :active="!roleFilter"
                  @click="setRoleFilter(null)"
                >
                  <v-list-item-title>Tous les rôles</v-list-item-title>
                </v-list-item>
                <v-list-item
                  v-for="role in roleOptions"
                  :key="role"
                  :active="roleFilter === role"
                  @click="setRoleFilter(role)"
                >
                  <template #prepend>
                    <v-icon
                      :icon="ROLE_META[role].icon"
                      :color="ROLE_META[role].color"
                      size="18"
                    />
                  </template>
                  <v-list-item-title>{{ ROLE_META[role].label }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>

        <template #[`header.plan`]="{ column }">
          <div class="admin-users__th">
            <button
              type="button"
              class="admin-users__sort"
              :class="{ 'admin-users__sort--active': sortBy === 'plan' }"
              @click="toggleSort('plan')"
            >
              <span>{{ column.title }}</span>
              <v-icon
                :icon="sortIcon('plan')"
                size="15"
              />
            </button>
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  :icon="planFilter ? 'mdi-filter' : 'mdi-filter-variant'"
                  :color="planFilter ? 'primary' : undefined"
                  size="x-small"
                  variant="text"
                  aria-label="Filtrer par abonnement"
                />
              </template>
              <v-list density="compact">
                <v-list-item
                  :active="!planFilter"
                  @click="setPlanFilter(null)"
                >
                  <v-list-item-title>Tous les abonnements</v-list-item-title>
                </v-list-item>
                <v-list-item
                  v-for="plan in planOptions"
                  :key="plan"
                  :active="planFilter === plan"
                  @click="setPlanFilter(plan)"
                >
                  <template #prepend>
                    <v-icon
                      :icon="PLAN_META[plan].icon"
                      :color="PLAN_META[plan].color"
                      size="18"
                    />
                  </template>
                  <v-list-item-title>{{ PLAN_META[plan].label }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>

        <template #[`header.createdAt`]="{ column }">
          <button
            type="button"
            class="admin-users__sort"
            :class="{ 'admin-users__sort--active': sortBy === 'createdAt' }"
            @click="toggleSort('createdAt')"
          >
            <span>{{ column.title }}</span>
            <v-icon
              :icon="sortIcon('createdAt')"
              size="15"
            />
          </button>
        </template>

        <template #[`item.displayName`]="{ item }">
          {{ userDisplayName(item.displayName) }}
        </template>

        <template #[`item.role`]="{ item }">
          <!-- Édition inline du rôle, sauf sur sa propre ligne (l'admin ne peut
               pas se rétrograder lui-même — l'API le refuse aussi). -->
          <v-menu v-if="item.id !== currentUserId">
            <template #activator="{ props }">
              <v-chip
                v-bind="props"
                size="small"
                variant="flat"
                link
                :color="ROLE_META[item.role].color"
                :prepend-icon="ROLE_META[item.role].icon"
                append-icon="mdi-menu-down"
              >
                {{ ROLE_META[item.role].label }}
              </v-chip>
            </template>
            <v-list density="compact">
              <v-list-item
                v-for="role in roleOptions"
                :key="role"
                :active="role === item.role"
                @click="requestChange(item, 'role', role)"
              >
                <template #prepend>
                  <v-icon
                    :icon="ROLE_META[role].icon"
                    :color="ROLE_META[role].color"
                    size="18"
                  />
                </template>
                <v-list-item-title>{{ ROLE_META[role].label }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-chip
            v-else
            size="small"
            variant="flat"
            :color="ROLE_META[item.role].color"
            :prepend-icon="ROLE_META[item.role].icon"
          >
            {{ ROLE_META[item.role].label }}
          </v-chip>
        </template>

        <template #[`item.plan`]="{ item }">
          <v-menu>
            <template #activator="{ props }">
              <v-chip
                v-bind="props"
                size="small"
                variant="tonal"
                link
                :color="PLAN_META[item.plan].color"
                :prepend-icon="PLAN_META[item.plan].icon"
                append-icon="mdi-menu-down"
              >
                {{ PLAN_META[item.plan].label }}
              </v-chip>
            </template>
            <v-list density="compact">
              <v-list-item
                v-for="plan in planOptions"
                :key="plan"
                :active="plan === item.plan"
                @click="requestChange(item, 'plan', plan)"
              >
                <template #prepend>
                  <v-icon
                    :icon="PLAN_META[plan].icon"
                    :color="PLAN_META[plan].color"
                    size="18"
                  />
                </template>
                <v-list-item-title>{{ PLAN_META[plan].label }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>

        <template #[`item.createdAt`]="{ item }">
          {{ formatUserDate(item.createdAt) }}
        </template>

        <template #no-data>
          <p class="admin-users__empty">
            {{ error ? 'Impossible de charger les utilisateurs.' : 'Aucun utilisateur.' }}
          </p>
        </template>
      </v-data-table-server>
    </v-card>

    <AdminUserChangeSheet
      v-model="confirmOpen"
      :user="pendingUser"
      :kind="pendingKind"
      :next-value="pendingValue"
      :busy="saving"
      @confirm="confirmChange"
    />
  </div>
</template>

<script setup lang="ts">
import type { SubscriptionPlan, UserRole } from '../../../../Profile/app/types/me'
import type { AdminUser } from '../../types/admin-user'

definePageMeta({ middleware: 'admin', layout: 'admin' })
useHead({ title: 'Utilisateurs · Admin' })

const {
  items,
  total,
  page,
  pending,
  error,
  pageSize,
  sortBy,
  sortDir,
  roleFilter,
  planFilter,
  loadPage,
  updateUser,
  toggleSort,
  setRoleFilter,
  setPlanFilter,
} = useAdminUsersList()

// Icône de l'en-tête triable : flèche selon le sens si la colonne est active,
// sinon une double-flèche neutre invitant au tri.
const sortIcon = (field: 'createdAt' | 'role' | 'plan'): string => {
  if (sortBy.value !== field) return 'mdi-unfold-more-horizontal'
  return sortDir.value === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down'
}

// Tout changement de rôle/abonnement passe par une popup de confirmation : on
// met la mutation « en attente » jusqu'à validation explicite (anti-fausse-manip).
const confirmOpen = ref(false)
const pendingUser = ref<AdminUser | null>(null)
const pendingKind = ref<'role' | 'plan' | null>(null)
const pendingValue = ref<UserRole | SubscriptionPlan | null>(null)
const saving = ref(false)

// Ouvre la confirmation. No-op si la valeur choisie est déjà celle du compte.
const requestChange = (
  user: AdminUser,
  kind: 'role' | 'plan',
  value: UserRole | SubscriptionPlan,
) => {
  if ((kind === 'role' ? user.role : user.plan) === value) return
  pendingUser.value = user
  pendingKind.value = kind
  pendingValue.value = value
  confirmOpen.value = true
}

// Applique la mutation confirmée puis referme la popup.
const confirmChange = async () => {
  if (!pendingUser.value || !pendingKind.value || !pendingValue.value) return
  saving.value = true
  try {
    const payload = pendingKind.value === 'role'
      ? { role: pendingValue.value as UserRole }
      : { plan: pendingValue.value as SubscriptionPlan }
    await updateUser(pendingUser.value.id, payload)
  }
  finally {
    saving.value = false
    confirmOpen.value = false
  }
}

// Identité courante : on ne propose pas l'édition de rôle sur sa propre ligne.
const { userId: currentUserId } = usePermissions()

// Options des sélecteurs inline (dérivées des métadonnées d'affichage).
const roleOptions = Object.keys(ROLE_META) as UserRole[]
const planOptions = Object.keys(PLAN_META) as SubscriptionPlan[]

// Pagination figée à 10/page (demandé) : une seule option dans le sélecteur.
const itemsPerPageOptions = [{ value: pageSize, title: String(pageSize) }]

// Colonnes du tableau. sortable désactivé : seule la pagination est gérée
// côté serveur (pas de tri serveur), on évite un tri client trompeur.
const headers = [
  { title: 'ID', key: 'id', sortable: false },
  { title: 'Email', key: 'email', sortable: false },
  { title: 'Pseudo', key: 'displayName', sortable: false },
  { title: 'Rôle', key: 'role', sortable: false },
  { title: 'Abonnement', key: 'plan', sortable: false },
  { title: 'Inscrit le', key: 'createdAt', sortable: false },
] as const

// v-data-table-server émet update:options au montage ET à chaque changement de
// page → on (re)charge la page demandée. itemsPerPage est figé.
const onOptions = ({ page: nextPage }: { page: number }) => {
  loadPage(nextPage)
}

const headline = computed(() => {
  if (error.value) return 'Erreur de chargement'
  if (!total.value) return 'Aucun compte enregistré'
  return `${total.value} compte(s) · ${pageSize} par page`
})
</script>

<style scoped lang="scss">
.admin-users {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.5rem 0.25rem 0;
  }

  &__title {
    font-size: 1.7rem;
    font-weight: 800;
    letter-spacing: -0.03em;
  }

  &__count {
    font-size: 0.82rem;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-top: 0.2rem;
  }

  &__card {
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    overflow: hidden;
  }

  &__empty {
    padding: 2rem 1rem;
    text-align: center;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__th {
    display: flex;
    align-items: center;
    gap: 0.15rem;
    margin-left: -0.25rem;
  }

  &__sort {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.15rem 0.25rem;
    border: none;
    border-radius: 8px;
    background: none;
    color: inherit;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.18s var(--app-ease);

    &:hover {
      color: rgb(var(--v-theme-primary));
    }

    &--active {
      color: rgb(var(--v-theme-primary));
    }
  }
}
</style>
