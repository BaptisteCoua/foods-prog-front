<template>
  <AuthForm mode="login" />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth', pageTransition: { name: 'auth-page', mode: 'out-in' } })
useHead({ title: 'Connexion' })
</script>
