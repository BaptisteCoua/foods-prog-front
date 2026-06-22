// Shopping-list feature: an aggregated grocery list over a date range. The whole
// aggregation (sum quantities + cost per ingredient over GET /shopping-list?from&to)
// is done server-side — this layer is read-only display + a client-side period
// selector and local check-off state. Never recompute quantities/cost here.
export default defineNuxtConfig({})
