<template>
  <ShoppingListPanel />
</template>

<script setup lang="ts">
// Standalone page; the screen body lives in ShoppingListPanel so it can also be
// shown as a popup from the Planning page. Period is seeded from the route query
// (?preset&from&to) by the panel's composable.
useHead({ title: 'Liste de courses' })
</script>
