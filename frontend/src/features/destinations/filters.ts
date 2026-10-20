import type { AccessibilityFeature, Destination } from '@/types/firestore'

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
