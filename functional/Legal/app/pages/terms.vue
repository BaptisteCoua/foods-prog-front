<template>
  <LegalDocument
    title="Conditions générales d'utilisation"
    last-updated="28 juin 2026"
  >
    <p>
      En utilisant FoodProg (« l'application »), vous acceptez les présentes
      conditions. Si vous ne les acceptez pas, n'utilisez pas l'application.
    </p>

    <h2>1. Service</h2>
    <p>
      FoodProg est une application de nutrition personnelle : elle calcule une
      cible quotidienne (calories et macros) à partir de votre profil et de votre
      objectif, et vous aide à gérer ingrédients, recettes, plannings de repas et
      listes de courses.
    </p>

    <h2>2. Avertissement santé</h2>
    <p>
      Les calculs (métabolisme, cible calorique, macros) sont fournis à titre
      <strong>informatif uniquement</strong> et ne constituent pas un avis médical
      ou diététique. Consultez un professionnel de santé avant toute modification
      importante de votre alimentation, en particulier en cas de pathologie,
      grossesse ou traitement.
    </p>

    <h2>3. Votre compte</h2>
    <ul>
      <li>Vous êtes responsable de l'exactitude des informations de votre profil.</li>
      <li>Vous êtes responsable de la confidentialité de vos identifiants.</li>
      <li>Un compte est personnel ; vos données nutritionnelles sont privées.</li>
    </ul>

    <h2>4. Utilisation acceptable</h2>
    <p>
      Vous vous engagez à ne pas détourner l'application, tenter d'accéder aux
      données d'autres utilisateurs, ni perturber le fonctionnement du service.
    </p>

    <h2>5. Données personnelles</h2>
    <p>
      Le traitement de vos données est décrit dans notre
      <NuxtLink to="/privacy">politique de confidentialité</NuxtLink>.
    </p>

    <h2>6. Disponibilité et responsabilité</h2>
    <p>
      L'application est fournie « en l'état », sans garantie de disponibilité
      continue. Dans les limites permises par la loi, nous ne saurions être tenus
      responsables des conséquences de décisions prises sur la base des
      informations fournies par l'application.
    </p>

    <h2>7. Modifications</h2>
    <p>
      Ces conditions peuvent évoluer. La date de dernière mise à jour en haut de
      cette page indique la version en vigueur. L'usage continu de l'application
      vaut acceptation des conditions mises à jour.
    </p>

    <h2>8. Contact</h2>
    <p>
      Pour toute question :
      <a href="mailto:b.couavoux@hookto.fr">b.couavoux@hookto.fr</a>.
    </p>
  </LegalDocument>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })
useHead({ title: 'Conditions générales d\'utilisation' })
</script>
