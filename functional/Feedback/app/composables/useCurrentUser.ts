// Identité + permissions de l'utilisateur courant pour le board de feedback.
// Délègue à usePermissions (Profile) — source unique, cache 'me' partagé — pour
// ne pas dupliquer la logique de rôle. Sert aux actions owner-only (edit/delete)
// et à la modération (statut) ouverte aux modérateurs/admins.
export const useCurrentUser = () => {
  const { me, userId, isAdmin, canModerate } = usePermissions()

  return { me, userId, isAdmin, canModerate }
}
