<template>
  <div class="landing">
    <!-- Hero -->
    <section class="landing__hero">
      <AppReveal :delay="0">
        <div class="landing__intro">
          <span class="landing__eyebrow">
            <v-icon
              icon="mdi-leaf"
              size="15"
            />
            Nutrition personnelle
          </span>
          <h1 class="landing__title">
            Sais exactement<br>
            <span class="landing__title-accent">quoi manger</span>, chaque jour.
          </h1>
          <p class="landing__lead">
            FoodProg calcule ta cible calorique et tes macros à partir de ton corps,
            ton objectif et ton sport — puis t'aide à gérer recettes, planning et courses.
            Privé, précis, sans prise de tête.
          </p>
          <div class="landing__actions">
            <v-btn
              color="primary"
              flat
              size="large"
              prepend-icon="mdi-arrow-right"
              to="/register"
            >
              Commencer gratuitement
            </v-btn>
            <v-btn
              variant="text"
              size="large"
              to="/login"
            >
              J'ai déjà un compte
            </v-btn>
          </div>
        </div>
      </AppReveal>

      <AppReveal :delay="120">
        <LandingHeroMock />
      </AppReveal>
    </section>

    <!-- Features -->
    <section class="landing__features">
      <AppReveal
        v-for="(feature, index) in features"
        :key="feature.title"
        :delay="index * 90"
      >
        <v-card
          class="landing__feature"
          elevation="0"
        >
          <span
            class="landing__feature-icon"
            :style="{
              color: `rgb(var(--v-theme-${feature.color}))`,
              background: `rgba(var(--v-theme-${feature.color}), 0.12)`,
            }"
          >
            <v-icon
              :icon="feature.icon"
              size="24"
            />
          </span>
          <h2 class="landing__feature-title">
            {{ feature.title }}
          </h2>
          <p class="landing__feature-text">
            {{ feature.text }}
          </p>
        </v-card>
      </AppReveal>
    </section>

    <!-- CTA final -->
    <AppReveal :delay="60">
      <section class="landing__cta">
        <h2 class="landing__cta-title">
          Ta cible t'attend.
        </h2>
        <p class="landing__cta-text">
          Quelques questions sur ton profil, et tu obtiens ta cible du jour.
        </p>
        <v-btn
          color="primary"
          flat
          size="large"
          prepend-icon="mdi-arrow-right"
          to="/register"
        >
          Créer mon compte
        </v-btn>
      </section>
    </AppReveal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })
useHead({ title: 'Ta nutrition, calculée pour toi' })

const features = [
  {
    icon: 'mdi-target',
    color: 'primary',
    title: 'Ta cible, calculée',
    text: 'Calories et macros P/G/L ajustées à ton métabolisme, ton objectif et tes entraînements.',
  },
  {
    icon: 'mdi-book-open-outline',
    color: 'macro-protein',
    title: 'Tes recettes',
    text: 'Compose tes recettes — nutrition et coût par portion calculés automatiquement.',
  },
  {
    icon: 'mdi-calendar-blank-outline',
    color: 'macro-carb',
    title: 'Planning repas',
    text: 'Organise ta semaine et coche ce que tu manges vraiment, pour suivre l\'écart à ta cible.',
  },
  {
    icon: 'mdi-cart-outline',
    color: 'macro-fat',
    title: 'Listes de courses',
    text: 'La liste se construit depuis ton planning — plus rien à oublier au magasin.',
  },
]
</script>

<style scoped lang="scss">
.landing {
  max-width: 1080px;
  margin-inline: auto;
  padding: 2rem 1.25rem 5rem;
  display: flex;
  flex-direction: column;
  gap: 4.5rem;

  &__hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3rem;
    padding-top: 1.5rem;
  }

  &__intro {
    text-align: center;
    max-width: 560px;
  }

  &__eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.74rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgb(var(--v-theme-primary-text));
    background: rgba(var(--v-theme-primary), 0.1);
    padding: 0.4rem 0.8rem;
    border-radius: 999px;
  }

  &__title {
    font-size: clamp(2.2rem, 7vw, 3.4rem);
    font-weight: 800;
    letter-spacing: -0.045em;
    line-height: 1.05;
    margin-top: 1.2rem;
  }

  &__title-accent {
    color: rgb(var(--v-theme-primary-text));
  }

  &__lead {
    margin-top: 1.2rem;
    font-size: 1.02rem;
    line-height: 1.6;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__actions {
    margin-top: 1.8rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.6rem;
  }

  &__features {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  &__feature {
    height: 100%;
    padding: 1.6rem;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    border-radius: 22px;
  }

  &__feature-icon {
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    border-radius: 16px;
    margin-bottom: 1.1rem;
  }

  &__feature-title {
    font-size: 1.15rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  &__feature-text {
    margin-top: 0.5rem;
    font-size: 0.92rem;
    line-height: 1.55;
    color: rgb(var(--v-theme-on-surface-variant));
  }

  &__cta {
    text-align: center;
    padding: 3rem 1.5rem;
    border-radius: 28px;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    background:
      radial-gradient(120% 130% at 50% 0%, rgba(var(--v-theme-primary), 0.12), transparent 60%),
      rgb(var(--v-theme-surface));
  }

  &__cta-title {
    font-size: clamp(1.6rem, 5vw, 2.2rem);
    font-weight: 800;
    letter-spacing: -0.03em;
  }

  &__cta-text {
    margin-top: 0.7rem;
    margin-bottom: 1.6rem;
    color: rgb(var(--v-theme-on-surface-variant));
  }
}

@media (min-width: 768px) {
  .landing__hero {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 2.5rem;
    padding-top: 3rem;
  }

  .landing__intro {
    text-align: start;
    flex: 1;
  }

  .landing__eyebrow,
  .landing__actions {
    justify-content: flex-start;
  }

  .landing__features {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.2rem;
  }
}
</style>
