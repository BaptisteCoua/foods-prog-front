import type { ThemeDefinition } from 'vuetify'

// Project branding: "chaleureux & appétissant" — warm cream backgrounds,
// terracotta primary, herb green + warm yellow accents. These are the only
// project-specific values; the generic Vuetify wiring lives in the Vuetify layer.

export const THEME_LIGHT = 'foodLight'
export const THEME_DARK = 'foodDark'
export const DEFAULT_THEME = THEME_LIGHT

const foodLight: ThemeDefinition = {
  dark: false,
  colors: {
    'background': '#FBF6EE',
    'surface': '#FFFFFF',
    'surface-variant': '#F3E9DA',
    'on-surface-variant': '#6F5D4F',
    'primary': '#E2683C',
    'on-primary': '#FFFFFF',
    'secondary': '#6F8E5A',
    'on-secondary': '#FFFFFF',
    'tertiary': '#F2B441',
    'on-tertiary': '#3A2E22',
    'on-background': '#3A2E28',
    'on-surface': '#3A2E28',
    'error': '#C8463C',
    'success': '#5E9C5A',
    'warning': '#E8A53B',
    'info': '#5B8AA6',
  },
}

const foodDark: ThemeDefinition = {
  dark: true,
  colors: {
    'background': '#1C1714',
    'surface': '#261F1A',
    'surface-variant': '#352B24',
    'on-surface-variant': '#C7B5A6',
    'primary': '#F0824E',
    'on-primary': '#2A150C',
    'secondary': '#90B47C',
    'on-secondary': '#16210F',
    'tertiary': '#F4C25E',
    'on-tertiary': '#332714',
    'on-background': '#F2E9E0',
    'on-surface': '#F2E9E0',
    'error': '#F0857A',
    'success': '#88C083',
    'warning': '#F2C063',
    'info': '#8FBAD4',
  },
}

export const appThemes = {
  [THEME_LIGHT]: foodLight,
  [THEME_DARK]: foodDark,
}
