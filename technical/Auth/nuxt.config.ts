// Authentication scaffolding: token store, route guard, login/register screens.
// googleClientId feeds the Google Identity Services button — override per env
// with NUXT_PUBLIC_GOOGLE_CLIENT_ID. Empty by default → the button stays hidden.
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      googleClientId: '',
    },
  },
})
