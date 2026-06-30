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
        <template #[`item.displayName`]="{ item }">
          {{ userDisplayName(item.displayName) }}
        </template>

        <template #[`item.role`]="{ item }">
          <v-chip
            size="small"
            variant="flat"
            :color="ROLE_META[item.role].color"
            :prepend-icon="ROLE_META[item.role].icon"
          >
            {{ ROLE_META[item.role].label }}
          </v-chip>
        </template>

        <template #[`item.plan`]="{ item }">
          <v-chip
            size="small"
            variant="tonal"
            :color="PLAN_META[item.plan].color"
            :prepend-icon="PLAN_META[item.plan].icon"
          >
            {{ PLAN_META[item.plan].label }}
          </v-chip>
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
useHead({ title: 'Utilisateurs · Admin' })

const { items, total, page, pending, error, pageSize, loadPage } = useAdminUsersList()

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
}
</style>
