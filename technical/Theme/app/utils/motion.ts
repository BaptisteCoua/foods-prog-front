// True when the user asked the OS to reduce motion. Always false on the server.
export const prefersReducedMotion = (): boolean =>
  import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches
