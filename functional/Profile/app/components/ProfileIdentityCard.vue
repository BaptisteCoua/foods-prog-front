<template>
  <v-card
    class="identity"
    elevation="0"
  >
    <div class="identity__avatar">
      {{ initials }}
    </div>

    <div class="identity__body">
      <template v-if="editing">
        <v-text-field
          v-model="draft"
          autofocus
          hide-details
          density="comfortable"
          variant="outlined"
          maxlength="80"
          placeholder="Ton prénom ou pseudo"
          class="identity__input"
          @keyup.enter="commit"
          @keyup.esc="cancel"
        />
        <div class="identity__actions">
          <v-btn
            size="small"
            variant="text"
            :disabled="saving"
            @click="cancel"
          >
            Annuler
          </v-btn>
          <v-btn
            size="small"
            color="primary"
            :loading="saving"
            @click="commit"
          >
            Enregistrer
          </v-btn>
        </div>
      </template>

      <template v-else>
        <button
          type="button"
          class="identity__name"
          :class="{ 'identity__name--empty': !me?.displayName }"
          @click="startEdit"
        >
          {{ nameLabel }}
          <v-icon
            icon="mdi-pencil-outline"
            size="15"
          />
        </button>
        <span class="identity__email">{{ me?.email }}</span>
        <span
          v-if="joinedLabel"
          class="identity__joined"
        >Membre depuis {{ joinedLabel }}</span>
      </template>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import type { Me } from '../types/me'

const props = defineProps<{
  me: Me | null
  saving: boolean
}>()

const emit = defineEmits<{ saveName: [name: string] }>()

const editing = ref(false)
const draft = ref('')

const nameLabel = computed(() => props.me?.displayName || 'Ajouter un pseudo')

const initials = computed(() => {
  const source = props.me?.displayName?.trim() || props.me?.email || '?'
  return source.slice(0, 2).toUpperCase()
})

const joinedLabel = computed(() => {
  if (!props.me?.createdAt) return ''
  return new Date(props.me.createdAt).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  })
})

const startEdit = () => {
  draft.value = props.me?.displayName ?? ''
  editing.value = true
}

const cancel = () => {
  editing.value = false
}

const commit = () => {
  emit('saveName', draft.value.trim())
}

// Referme l'édition une fois la sauvegarde terminée.
watch(() => props.saving, (now, before) => {
  if (before && !now) editing.value = false
})
</script>

<style scoped lang="scss">
.identity {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.15rem 1.25rem;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

  &__avatar {
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    width: 56px;
    height: 56px;
    border-radius: 18px;
    font-size: 1.2rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), 0.12);
  }

  &__body {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  &__name {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    align-self: flex-start;
    font-size: 1.15rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: rgb(var(--v-theme-on-surface));
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;

    .v-icon {
      color: rgb(var(--v-theme-on-surface-variant));
      transition: color 0.2s var(--app-ease);
    }

    &:hover .v-icon {
      color: rgb(var(--v-theme-primary));
    }

    &--empty {
      color: rgb(var(--v-theme-on-surface-variant));
      font-weight: 600;
    }
  }

  &__email {
    font-size: 0.85rem;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__joined {
    font-size: 0.75rem;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.4rem;
    margin-top: 0.5rem;
  }
}
</style>
