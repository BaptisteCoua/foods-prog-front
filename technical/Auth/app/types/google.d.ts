// Minimal typings for the Google Identity Services client (loaded at runtime
// from https://accounts.google.com/gsi/client). We only declare what we use.
export interface GoogleCredentialResponse {
  credential: string
}

export interface GoogleIdConfiguration {
  client_id: string
  callback: (response: GoogleCredentialResponse) => void
}

export interface GoogleButtonOptions {
  type?: 'standard' | 'icon'
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'small' | 'medium' | 'large'
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  width?: number
  locale?: string
}

export interface GoogleAccountsId {
  initialize: (config: GoogleIdConfiguration) => void
  renderButton: (parent: HTMLElement, options: GoogleButtonOptions) => void
  prompt: () => void
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId
      }
    }
  }
}

export {}
