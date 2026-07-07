import type { ThemeDefinition } from 'vuetify'

// Project branding: "minimal premium" — near-neutral base, lots of air, a single
// emerald accent, and a curated macro palette (protein / carb / fat) for data
// legibility. Custom colour keys are exposed by Vuetify as rgb(var(--v-theme-<key>)).

export const THEME_LIGHT = 'foodLight'
export const THEME_DARK = 'foodDark'
export const DEFAULT_THEME = THEME_LIGHT

const foodLight: ThemeDefinition = {
  dark: false,
  colors: {
    'background': '#FBFBFA',
    'surface': '#FFFFFF',
    'surface-variant': '#F5F5F3',
    // Secondary text: #8A8A93 was 3.4:1 on white (fails WCAG AA 4.5:1). Darkened
    // to reach 5.1:1 while staying a soft grey.
    'on-surface-variant': '#6B6B73',
    'primary': '#10B981',
    // Text/icons ON a primary-filled surface (buttons, badges). White on #10B981
    // was 2.5:1 (fails); near-black-emerald hits 6.6:1 — same approach the dark
    // theme already uses. Keeps the bright brand green as the fill.
    'on-primary': '#04231A',
    // Emerald tuned for use AS TEXT on light backgrounds (links, accents, tonal
    // buttons). The brand #10B981 is only 2.5:1 as text; this is 5.5:1.
    'primary-text': '#047857',
    'secondary': '#18181B',
    'on-secondary': '#FFFFFF',
    'on-background': '#18181B',
    'on-surface': '#18181B',
    'error': '#E5484D',
    'success': '#10B981',
    'warning': '#F59E0B',
    'info': '#6366F1',
    'macro-protein': '#6366F1',
    'macro-carb': '#F59E0B',
    'macro-fat': '#FB7185',
  },
  variables: {
    'border-color': '#18181B',
    'border-opacity': 0.08,
    'theme-faint': '#B5B5BC',
  },
}

const foodDark: ThemeDefinition = {
  dark: true,
  colors: {
    'background': '#0B0B0C',
    'surface': '#151517',
    'surface-variant': '#1D1D20',
    'on-surface-variant': '#9A9AA3',
    'primary': '#34D399',
    'on-primary': '#04231A',
    // Emerald-as-text token (see light theme). On dark surfaces the bright brand
    // green is already high-contrast, so it doubles as the text tone.
    'primary-text': '#34D399',
    'secondary': '#FAFAFA',
    'on-secondary': '#18181B',
    'on-background': '#FAFAFA',
    'on-surface': '#FAFAFA',
    'error': '#FF6369',
    'success': '#34D399',
    'warning': '#FBBF24',
    'info': '#818CF8',
    'macro-protein': '#818CF8',
    'macro-carb': '#FBBF24',
    'macro-fat': '#FB7185',
  },
  variables: {
    'border-color': '#FFFFFF',
    'border-opacity': 0.1,
    'theme-faint': '#5A5A62',
  },
}

export const appThemes = {
  [THEME_LIGHT]: foodLight,
  [THEME_DARK]: foodDark,
}
