// Minimal typings for the Google Identity Services client (loaded at runtime
// from https://accounts.google.com/gsi/client). We use the OAuth 2.0
// authorization-code flow (`oauth2.initCodeClient`): the popup returns a code
// that our backend exchanges for tokens + People API data. We only declare
// what we use.
export interface GoogleCodeResponse {
  code?: string
  scope?: string
  error?: string
  error_description?: string
}

export interface GoogleCodeClientConfig {
  client_id: string
  scope: string
  ux_mode?: 'popup' | 'redirect'
  callback: (response: GoogleCodeResponse) => void
  error_callback?: (error: { type: string, message?: string }) => void
}

export interface GoogleCodeClient {
  requestCode: () => void
}

export interface GoogleOauth2 {
  initCodeClient: (config: GoogleCodeClientConfig) => GoogleCodeClient
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: GoogleOauth2
      }
    }
  }
}

export {}
