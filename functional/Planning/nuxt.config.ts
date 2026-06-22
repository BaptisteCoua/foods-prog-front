// Planning feature: weekly meal planning. GET /meals?from&to returns each day
// pre-joined with its nutrition total, target and gap — never recompute here.
// "Courses" (entrée/plat/dessert) are not a backend concept: they are MealTypes
// tags on recipes, surfaced as a lenient ordering only (see utils/planningMeta).
export default defineNuxtConfig({})
