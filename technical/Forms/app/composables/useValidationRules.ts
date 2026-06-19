type ValidationRule = (value: unknown) => true | string

// Single source of truth for Vuetify `:rules`. Don't redeclare these inline in
// form components. Messages are plain French for now — when an i18n layer is
// added, swap the strings for `t(...)` here only.
export const useValidationRules = () => {
  const required: ValidationRule = value =>
    (value !== null && value !== undefined && value !== '') || 'Ce champ est requis.'

  const email: ValidationRule = value =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? '')) || 'Adresse e-mail invalide.'

  const minLength = (min: number): ValidationRule => value =>
    String(value ?? '').length >= min || `Au moins ${min} caractères.`

  return { required, email, minLength }
}
