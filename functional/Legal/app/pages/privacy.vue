<template>
  <LegalDocument
    title="Politique de confidentialité"
    last-updated="28 juin 2026"
  >
    <p>
      FoodProg (« l'application », « nous ») est une application de nutrition
      personnelle. Cette politique explique quelles données nous collectons,
      comment nous les utilisons et les protégeons. Pour toute question :
      <a href="mailto:b.couavoux@hookto.fr">b.couavoux@hookto.fr</a>.
    </p>

    <h2>Données que vous nous fournissez</h2>
    <p>
      Pour calculer votre cible nutritionnelle et faire fonctionner
      l'application, nous traitons les données que vous saisissez :
    </p>
    <ul>
      <li>Profil corporel : sexe, date de naissance, taille, poids, niveau d'activité.</li>
      <li>Objectif (perte / maintien / prise) et données d'entraînement.</li>
      <li>Vos ingrédients, recettes, plannings de repas et listes de courses.</li>
      <li>Adresse e-mail et mot de passe (chiffré) si vous créez un compte classique.</li>
    </ul>

    <h2>Connexion via Google (données Google)</h2>
    <p>
      Si vous choisissez « Se connecter avec Google », nous accédons — avec
      votre consentement explicite sur l'écran Google — aux informations
      suivantes de votre compte Google, dans le seul but de créer votre compte
      et de <strong>pré-remplir votre profil</strong> :
    </p>
    <ul>
      <li><strong>Adresse e-mail et profil de base</strong> (nom, photo) : identification de votre compte.</li>
      <li><strong>Date de naissance et sexe</strong> : nécessaires au calcul du métabolisme de base (équation de Mifflin-St Jeor) et donc de votre cible calorique.</li>
      <li><strong>Adresse postale et numéro de téléphone</strong> : pré-remplissage facultatif de votre profil.</li>
    </ul>
    <p>
      Ces informations sont récupérées <strong>une seule fois à la connexion</strong>
      pour initialiser votre profil. Vous pouvez les modifier ou les supprimer à
      tout moment depuis l'application. L'usage des données reçues de Google est
      conforme à la
      <a
        href="https://developers.google.com/terms/api-services-user-data-policy"
        target="_blank"
        rel="noopener"
      >Google API Services User Data Policy</a>,
      y compris ses exigences d'usage limité (Limited Use).
    </p>

    <h2>Comment nous utilisons vos données</h2>
    <ul>
      <li>Calculer votre cible quotidienne (calories et macros P/G/L).</li>
      <li>Gérer vos ingrédients, recettes, plannings et listes de courses.</li>
      <li>Vous authentifier et sécuriser votre compte.</li>
    </ul>
    <p>
      Vos données nutritionnelles sont <strong>privées par utilisateur</strong>.
      Nous ne vendons, ne louons et ne partageons vos données personnelles
      avec aucun tiers à des fins publicitaires.
    </p>

    <h2>Conservation et suppression</h2>
    <p>
      Vos données sont conservées tant que votre compte est actif. Vous pouvez
      demander la suppression de votre compte et de l'ensemble de vos données en
      nous écrivant à
      <a href="mailto:b.couavoux@hookto.fr">b.couavoux@hookto.fr</a> ;
      elles seront alors définitivement effacées.
    </p>

    <h2>Sécurité</h2>
    <p>
      Les échanges avec le serveur sont chiffrés (HTTPS) et les mots de passe
      sont stockés sous forme de hachage. L'accès à l'application est protégé par
      authentification (jetons JWT à durée limitée).
    </p>

    <h2>Vos droits</h2>
    <p>
      Conformément au RGPD, vous disposez d'un droit d'accès, de rectification,
      d'effacement et de portabilité de vos données. Pour les exercer, contactez
      <a href="mailto:b.couavoux@hookto.fr">b.couavoux@hookto.fr</a>.
    </p>

    <h2>Modifications</h2>
    <p>
      Cette politique peut évoluer. La date de dernière mise à jour en haut de
      cette page indique la version en vigueur.
    </p>
  </LegalDocument>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })
useHead({ title: 'Politique de confidentialité' })
</script>
