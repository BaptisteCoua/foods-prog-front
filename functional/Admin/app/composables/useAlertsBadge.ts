// Compteur d'alertes non lues + polling léger (pas de websocket). Source unique
// partagée — le bouton de l'espace admin (layout default) et la nav de l'espace
// admin lisent le même store Pinia, donc le badge reste cohérent partout et se
// met à jour instantanément quand un modérateur lit/supprime une alerte.
//
// Le polling ne démarre que pour les modérateurs (MODERATOR+) ; il s'arrête à la
// démonte du composant consommateur (changement de layout, déconnexion).
export const useAlertsBadge = () => {
  const { canModerate } = usePermissions()
  const alertsStore = useAdminAlertsStore()
  const { unreadCount } = storeToRefs(alertsStore)

  let pollTimer: ReturnType<typeof setInterval> | null = null

  const stop = () => {
    if (!pollTimer) return
    clearInterval(pollTimer)
    pollTimer = null
  }

  const start = () => {
    if (pollTimer) return
    alertsStore.fetch().catch(() => {})
    pollTimer = setInterval(() => alertsStore.fetch().catch(() => {}), 60_000)
  }

  watch(canModerate, (moderator) => {
    if (moderator) start()
    else stop()
  }, { immediate: true })

  onBeforeUnmount(stop)

  return { unreadCount, canModerate }
}
