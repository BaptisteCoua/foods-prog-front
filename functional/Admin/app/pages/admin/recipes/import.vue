<template>
  <div class="recipe-import">
    <header class="recipe-import__head">
      <h1 class="recipe-import__title">
        Import de recettes
      </h1>
      <p class="recipe-import__desc">
        Colle des adresses de recettes (Marmiton, CuisineAZ, 750g, Ptitchef),
        vérifie les recettes trouvées, puis ajoute-les au catalogue global.
      </p>
    </header>

    <!-- Indicateur d'étapes -->
    <ol class="recipe-import__steps">
      <li
        v-for="(label, index) in stepLabels"
        :key="label"
        class="recipe-import__step"
        :class="{
          'recipe-import__step--active': step === index + 1,
          'recipe-import__step--done': step > index + 1,
        }"
      >
        <span class="recipe-import__step-num">
          <v-icon
            v-if="step > index + 1"
            icon="mdi-check"
            size="14"
          />
          <template v-else>{{ index + 1 }}</template>
        </span>
        <span class="recipe-import__step-label">{{ label }}</span>
      </li>
    </ol>

    <v-window
      v-model="step"
      class="recipe-import__window"
    >
      <!-- Étape 1 : URLs -->
      <v-window-item :value="1">
        <div class="recipe-import__pane">
          <v-textarea
            v-model="urlsText"
            label="Adresses des recettes (une par ligne)"
            placeholder="https://www.marmiton.org/recettes/recette_..._12345.aspx"
            variant="outlined"
            rows="7"
            auto-grow
          />
          <div class="recipe-import__row">
            <v-switch
              v-model="perServing"
              color="primary"
              density="compact"
              hide-details
              label="Enregistrer 1 portion par recette (quantités au prorata)"
            />
            <span
              class="recipe-import__counter"
              :class="{ 'recipe-import__counter--over': parsedUrls.length > maxUrls }"
            >
              {{ parsedUrls.length }} / {{ maxUrls }}
            </span>
          </div>
          <v-btn
            color="primary"
            flat
            block
            :loading="isLoading"
            :disabled="parsedUrls.length === 0"
            append-icon="mdi-arrow-right"
            @click="preview"
          >
            Vérifier les recettes
          </v-btn>
        </div>
      </v-window-item>

      <!-- Étape 2 : aperçu -->
      <v-window-item :value="2">
        <div class="recipe-import__pane">
          <p class="recipe-import__found-title">
            {{ previewRecipes.length }} recette(s) trouvée(s)
          </p>
          <ul class="recipe-import__found">
            <li
              v-for="recipe in previewRecipes"
              :key="recipe.url"
              class="recipe-import__found-item"
            >
              <v-icon
                icon="mdi-silverware-fork-knife"
                size="16"
                color="primary"
              />
              <span class="recipe-import__found-name">{{ recipe.name }}</span>
            </li>
          </ul>

          <div
            v-if="previewFailures.length"
            class="recipe-import__detail"
          >
            <p class="recipe-import__detail-title">
              <v-icon
                icon="mdi-link-off"
                size="16"
                color="error"
              />
              {{ previewFailures.length }} adresse(s) ignorée(s)
            </p>
            <ul class="recipe-import__detail-list">
              <li
                v-for="(failure, index) in previewFailures"
                :key="index"
              >
                {{ failure.url }} — {{ failure.reason }}
              </li>
            </ul>
          </div>

          <div class="recipe-import__actions">
            <v-btn
              variant="text"
              prepend-icon="mdi-arrow-left"
              :disabled="isLoading"
              @click="backToUrls"
            >
              Retour
            </v-btn>
            <v-btn
              color="primary"
              flat
              :loading="isLoading"
              prepend-icon="mdi-plus"
              @click="confirmImport"
            >
              Ajouter ces {{ previewRecipes.length }} recette(s)
            </v-btn>
          </div>
        </div>
      </v-window-item>

      <!-- Étape 3 : résultat -->
      <v-window-item :value="3">
        <div
          v-if="summary"
          class="recipe-import__pane"
        >
          <div class="recipe-import__stats">
            <div class="recipe-import__stat">
              <span class="recipe-import__stat-value">{{ summary.importedRecipes.length }}</span>
              <span class="recipe-import__stat-label">ajoutées</span>
            </div>
            <div class="recipe-import__stat">
              <span class="recipe-import__stat-value">{{ summary.skippedExisting.length }}</span>
              <span class="recipe-import__stat-label">déjà présentes</span>
            </div>
            <div class="recipe-import__stat">
              <span class="recipe-import__stat-value">{{ summary.createdIngredients.length }}</span>
              <span class="recipe-import__stat-label">ingrédients créés</span>
            </div>
          </div>

          <div
            v-if="summary.missingIngredients.length"
            class="recipe-import__detail"
          >
            <p class="recipe-import__detail-title">
              <v-icon
                icon="mdi-alert-outline"
                size="16"
                color="warning"
              />
              Ingrédients introuvables (lignes ignorées)
            </p>
            <ul class="recipe-import__detail-list">
              <li
                v-for="(item, index) in summary.missingIngredients"
                :key="index"
              >
                {{ item }}
              </li>
            </ul>
          </div>

          <div
            v-if="importFailures.length"
            class="recipe-import__detail"
          >
            <p class="recipe-import__detail-title">
              <v-icon
                icon="mdi-link-off"
                size="16"
                color="error"
              />
              URLs en échec
            </p>
            <ul class="recipe-import__detail-list">
              <li
                v-for="(failure, index) in importFailures"
                :key="index"
              >
                {{ failure.url }} — {{ failure.reason }}
              </li>
            </ul>
          </div>

          <v-btn
            variant="tonal"
            block
            prepend-icon="mdi-refresh"
            @click="restart"
          >
            Nouvel import
          </v-btn>
        </div>
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })
useHead({ title: 'Import de recettes · Admin' })

const stepLabels = ['Adresses', 'Recettes trouvées', 'Résultat']

const {
  step,
  urlsText,
  perServing,
  isLoading,
  parsedUrls,
  maxUrls,
  previewRecipes,
  previewFailures,
  summary,
  importFailures,
  preview,
  confirmImport,
  backToUrls,
  restart,
} = useRecipeImport()
</script>

<style scoped lang="scss">
.recipe-import {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__head {
    padding: 0.5rem 0.25rem 0;
  }

  &__title {
    font-size: 1.7rem;
    font-weight: 800;
    letter-spacing: -0.03em;
  }

  &__desc {
    font-size: 0.85rem;
    color: rgb(var(--v-theme-on-surface-variant));
    margin-top: 0.25rem;
  }

  &__steps {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  &__step {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: rgb(var(--v-theme-on-surface-variant));
    opacity: 0.6;

    &:not(:last-child)::after {
      content: '';
      width: 18px;
      height: 1.5px;
      margin-left: 0.5rem;
      background: rgba(var(--v-border-color), 0.4);
    }

    &--active,
    &--done {
      opacity: 1;
    }

    &--active {
      color: rgb(var(--v-theme-primary-text));
    }
  }

  &__step-num {
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border-radius: 999px;
    font-size: 0.75rem;
    background: rgba(var(--v-border-color), 0.15);
    color: rgb(var(--v-theme-on-surface));
  }

  &__step--active &__step-num {
    background: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary));
  }

  &__step--done &__step-num {
    background: rgba(var(--v-theme-primary), 0.16);
    color: rgb(var(--v-theme-primary-text));
  }

  &__pane {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-top: 1.25rem;
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  &__counter {
    font-size: 0.8rem;
    font-weight: 600;
    color: rgb(var(--v-theme-on-surface-variant));

    &--over {
      color: rgb(var(--v-theme-error));
    }
  }

  &__found-title {
    font-size: 0.95rem;
    font-weight: 700;
  }

  &__found {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  &__found-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 0.8rem;
    border-radius: 12px;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  }

  &__found-name {
    font-size: 0.9rem;
    font-weight: 600;
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  &__stats {
    display: flex;
    gap: 1.5rem;
  }

  &__stat {
    display: flex;
    flex-direction: column;
  }

  &__stat-value {
    font-size: 1.5rem;
    font-weight: 800;
    color: rgb(var(--v-theme-primary-text));
  }

  &__stat-label {
    font-size: 0.78rem;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__detail-title {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 0.35rem;
  }

  &__detail-list {
    margin: 0;
    padding-left: 1.1rem;
    font-size: 0.8rem;
    color: rgb(var(--v-theme-on-surface-variant));

    li {
      margin-bottom: 0.15rem;
      word-break: break-word;
    }
  }
}
</style>
