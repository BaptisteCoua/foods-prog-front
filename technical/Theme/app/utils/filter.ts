// Multi-group facet filtering shared across the data lists (ingredients,
// recipes…). Each group is one independent multi-select facet (meal types,
// dietary regimes, food types…). The selected ids drive both the picker sheet
// (AppFilterSheet) and the compact active-chips row (AppActiveFilters), so the
// full set of chosen filters never has to live inline on the page.
export interface FilterOption {
  value: number
  label: string
}

export interface FilterGroup {
  key: string
  label: string
  selected: number[]
  options: FilterOption[]
  // Visual tuning, mirrored between the sheet chips and the active row.
  color?: string
  icon?: string
  variant?: 'outlined' | 'tonal'
}

// Total number of selected filters across every group — drives the header badge.
export const countActiveFilters = (groups: FilterGroup[]): number =>
  groups.reduce((sum, group) => sum + group.selected.length, 0)
