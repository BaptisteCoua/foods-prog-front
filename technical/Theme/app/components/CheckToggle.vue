<template>
  <component
    :is="interactive ? 'button' : 'span'"
    :type="interactive ? 'button' : undefined"
    :role="interactive ? 'checkbox' : undefined"
    class="check-toggle"
    :class="{ 'check-toggle--checked': modelValue, 'check-toggle--static': !interactive }"
    :aria-checked="interactive ? modelValue : undefined"
    :aria-label="interactive ? label : undefined"
    :aria-hidden="interactive ? undefined : 'true'"
    @click="interactive && emit('update:modelValue', !modelValue)"
  >
    <span
      class="check-toggle__burst"
      aria-hidden="true"
    />
    <svg
      class="check-toggle__icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        class="check-toggle__path"
        d="M5 12.5 L10 17.5 L19 7"
      />
    </svg>
  </component>
</template>

<script setup lang="ts">
// Premium tick control: an empty emerald ring that springs into a filled disc with
// a drawn-in checkmark and a soft pulse. v-model compatible. Falls back to an
// instant fill when the user prefers reduced motion.
withDefaults(defineProps<{
  modelValue: boolean
  label?: string
  // When false, renders as a non-interactive indicator — the parent owns the click.
  interactive?: boolean
}>(), {
  interactive: true,
})

const emit = defineEmits<{ 'update:modelValue': [boolean] }>()
</script>

<style scoped lang="scss">
.check-toggle {
  position: relative;
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 2px solid rgba(var(--v-border-color), 0.55);
  background: transparent;
  cursor: pointer;
  transition:
    border-color 0.2s var(--app-ease),
    background 0.25s var(--app-ease),
    transform 0.12s var(--app-ease);

  &:hover {
    border-color: rgb(var(--v-theme-primary));
  }

  &:active {
    transform: scale(0.86);
  }

  // Indicator mode: the parent row handles the click and hover affordance.
  &--static {
    cursor: inherit;
  }

  &:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
  }

  &--checked {
    border-color: rgb(var(--v-theme-primary));
    background: rgb(var(--v-theme-primary));
    animation: check-pop 0.4s var(--app-ease);
    box-shadow: 0 3px 10px rgba(var(--v-theme-primary), 0.4);
  }

  &__icon {
    width: 16px;
    height: 16px;
    display: block;
  }

  &__path {
    fill: none;
    stroke: #fff;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 24;
    stroke-dashoffset: 24;
  }

  &--checked &__path {
    animation: check-draw 0.3s 0.06s var(--app-ease) forwards;
  }

  // Pulse ring that expands once on validation.
  &__burst {
    position: absolute;
    inset: -2px;
    border-radius: 50%;
    border: 2px solid rgb(var(--v-theme-primary));
    opacity: 0;
    pointer-events: none;
  }

  &--checked &__burst {
    animation: check-burst 0.5s var(--app-ease);
  }
}

@keyframes check-pop {
  0% { transform: scale(0.7); }
  55% { transform: scale(1.14); }
  100% { transform: scale(1); }
}

@keyframes check-draw {
  to { stroke-dashoffset: 0; }
}

@keyframes check-burst {
  0% { opacity: 0.5; transform: scale(0.8); }
  100% { opacity: 0; transform: scale(1.8); }
}

@media (prefers-reduced-motion: reduce) {
  .check-toggle,
  .check-toggle--checked {
    transition: none;
    animation: none;
  }

  .check-toggle__path {
    transition: none;
  }

  .check-toggle--checked .check-toggle__path {
    animation: none;
    stroke-dashoffset: 0;
  }

  .check-toggle--checked .check-toggle__burst {
    animation: none;
  }
}
</style>
