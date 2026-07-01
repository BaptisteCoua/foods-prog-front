// Pantry (garde-manger) feature: a server-persisted stock per ingredient. Stock
// rises when grocery lines are checked off (bought) and falls as planned meals
// are marked eaten; the available quantity (= purchased − consumed) is derived
// server-side (GET /pantry). This layer is display + edit only — never recompute
// stock here.
export default defineNuxtConfig({})
