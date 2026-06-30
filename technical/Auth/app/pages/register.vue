<template>
  <AuthForm mode="register" />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth', pageTransition: { name: 'auth-page', mode: 'out-in' } })
useHead({ title: 'Créer un compte' })
</script>
