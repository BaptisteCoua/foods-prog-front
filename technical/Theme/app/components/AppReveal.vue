<template>
  <div
    class="app-reveal"
    :class="{ 'app-reveal--in': isVisible }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ delay?: number }>(), { delay: 0 })

const { isVisible } = useReveal(props.delay)
</script>

<style scoped lang="scss">
.app-reveal {
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 0.6s var(--app-ease), transform 0.6s var(--app-ease);

  &--in {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
