<template>
  <div class="step">
    <v-text-field
      v-model="form.pseudo"
      label="Ton pseudo"
      placeholder="Capitaine Brocoli, Reine du Quinoa…"
      prepend-inner-icon="mdi-emoticon-happy-outline"
      counter="80"
      maxlength="80"
      autofocus
      @keyup.enter="surprise"
    />

    <div class="step__dice">
      <v-btn
        variant="text"
        size="small"
        prepend-icon="mdi-dice-5-outline"
        class="step__dice-btn"
        @click="surprise"
      >
        Surprends-moi
      </v-btn>
    </div>

    <OnboardingExplainer title="Pourquoi un pseudo ?">
      <p>
        Parce que <strong>« Utilisateur #4172 »</strong>, ça manque cruellement
        de panache.
      </p>
      <p>
        C'est le petit nom qu'on affichera sur ton tableau de bord et au-dessus
        de tes recettes. Choisis-le avec soin… ou pas du tout — il restera
        <strong>modifiable</strong> depuis ton profil quand l'inspiration
        frappera.
      </p>
    </OnboardingExplainer>
  </div>
</template>

<script setup lang="ts">
const { form } = useOnboardingStore()

// Petite pincée d'absurde : un pseudo gastronomique au hasard pour les
// indécis. Rien de figé — l'utilisateur l'écrase quand il veut.
const FUN_PSEUDOS = [
  'Capitaine Brocoli',
  'Reine du Quinoa',
  'Sir Avocado',
  'Lord des Lentilles',
  'Maître Gigot',
  'Pharaon du Houmous',
  'Comte de Courgette',
  'Baron de la Banane',
  'Duchesse du Tofu',
  'Sultan de la Patate Douce',
]

const surprise = () => {
  const index = Math.floor(Math.random() * FUN_PSEUDOS.length)
  form.pseudo = FUN_PSEUDOS[index]!
}
</script>

<style scoped lang="scss">
.step {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &__dice {
    display: flex;
    justify-content: flex-end;
    margin-top: -0.5rem;
  }

  &__dice-btn {
    color: rgb(var(--v-theme-on-surface-variant));
    letter-spacing: -0.01em;
  }
}
</style>
