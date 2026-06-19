// API client layer: base URL of the NestJS backend. Override in any environment
// with NUXT_PUBLIC_API_BASE_URL. The backend runs on :3001 with no global prefix.
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBaseURL: 'http://localhost:3001',
    },
  },
})
