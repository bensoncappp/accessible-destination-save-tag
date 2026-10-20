import type { AccessibilityFeature, Destination, SavedDestination } from '@/types/firestore'

/**
 * Keeps only destinations that have EVERY selected feature (AND logic).
 * No features selected → every destination is shown.
 * Results are sorted A–Z by name. The input array is never changed.
 */
export function filterDestinations(
  destinations: Destination[],
  selected: AccessibilityFeature[]
): Destination[] {
  return destinations
    .filter((d) => selected.every((feature) => d.accessibilityFeatures.includes(feature)))
    .sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Shortlist filter: keeps saved items whose destination has EVERY selected
 * feature AND whose tags include EVERY selected tag. Sorted A–Z by name.
 * `destinationsById` supplies the features, which live on the destination doc.
 */
export function filterShortlist(
  items: SavedDestination[],
  destinationsById: Map<string, Destination>,
  features: AccessibilityFeature[],
  tags: string[]
): SavedDestination[] {
  return items
    .filter((item) => {
      const destination = destinationsById.get(item.destinationId)
      const hasFeatures = features.every(
        (f) => destination?.accessibilityFeatures.includes(f) ?? false
      )
      const hasTags = tags.every((t) => item.tags.includes(t))
      return hasFeatures && hasTags
    })
    .sort((a, b) => a.destinationName.localeCompare(b.destinationName))
}
