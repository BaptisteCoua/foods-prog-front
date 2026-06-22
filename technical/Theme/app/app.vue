<template>
  <v-app>
    <NuxtLayout>
      <NuxtPage :transition="transition" />
    </NuxtLayout>
  </v-app>
</template>

<script setup lang="ts">
// Single Vuetify root for the whole app. Layouts provide the app bar / nav;
// pages render inside the active layout.
useHead({
  titleTemplate: title => (title ? `${title} · FoodProg` : 'FoodProg'),
})

// Page transition follows the direction of travel through the nav (set by the
// nav-direction plugin): forward slides left, backward slides right, anything
// off the nav keeps the neutral vertical fade.
//
// The directional slides run *simultaneously* (no `mode`): the leaving page is
// pulled out of flow (see app.scss) so both pages glide across together, tiled
// — that's what makes it feel continuous, like a native phone swipe. The
// neutral fade keeps `out-in` since there is no spatial relationship to honour.
const direction = useState<'forward' | 'backward' | 'none'>('navDirection', () => 'none')
const transition = computed(() => {
  if (direction.value === 'none') {
    return { name: 'page', mode: 'out-in' as const }
  }
  return { name: direction.value === 'forward' ? 'slide-left' : 'slide-right' }
})
</script>
