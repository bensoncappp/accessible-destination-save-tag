import type { AccessibilityFeature } from '@/types/firestore'

/**
 * The 5 accessibility features a destination can have.
 * `value` is what is stored in Firestore; `label` is what the user sees.
 * Order here = order of the filter chips on screen.
 */
export const ACCESSIBILITY_FEATURES: { value: AccessibilityFeature; label: string }[] = [
  { value: 'step-free-transport', label: 'Step-free transport' },
  { value: 'accessible-stays', label: 'Accessible stays' },
  { value: 'wheelchair-attractions', label: 'Wheelchair-friendly attractions' },
  { value: 'accessible-toilets', label: 'Accessible toilets' },
  { value: 'quiet-spaces', label: 'Quiet spaces' },
]

/** Turns a stored value like 'quiet-spaces' into its label 'Quiet spaces'. */
export function featureLabel(value: AccessibilityFeature): string {
  return ACCESSIBILITY_FEATURES.find((f) => f.value === value)?.label ?? value
}
