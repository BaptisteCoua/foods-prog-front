// Réponses des endpoints admin d'import de recettes (backend foods-prog-api).

export interface RecipeImportSummary {
  importedRecipes: string[]
  // Recettes globales déjà présentes (même nom) → non réimportées.
  skippedExisting: string[]
  createdIngredients: string[]
  // « recette : ingrédient » dont le nom est introuvable au catalogue.
  missingIngredients: string[]
}

export interface ScrapeFailure {
  url: string
  reason: string
}

// Aperçu d'une recette (nom scrapé) avant import.
export interface RecipePreviewItem {
  url: string
  name: string
}

// Réponse de POST /admin/recipes/preview-urls.
export interface RecipePreviewResult {
  recipes: RecipePreviewItem[]
  failures: ScrapeFailure[]
}

// Réponse de POST /admin/recipes/import-urls (scrape + import).
export interface ImportUrlsResult {
  summary: RecipeImportSummary
  failures: ScrapeFailure[]
}
