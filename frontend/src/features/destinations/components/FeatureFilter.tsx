import type { AccessibilityFeature } from '@/types/firestore'
import { cn } from '@/lib/utils'
import { ACCESSIBILITY_FEATURES } from '../constants'

interface FeatureFilterProps {
  selected: AccessibilityFeature[]
  onToggle: (feature: AccessibilityFeature) => void
  onClear: () => void
}

/** Row of toggle chips, one per accessibility feature. */
export function FeatureFilter({ selected, onToggle, onClear }: FeatureFilterProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Filter by accessibility feature"
    >
      {ACCESSIBILITY_FEATURES.map(({ value, label }) => {
        const isOn = selected.includes(value)
        return (
          <button
            key={value}
            type="button"
            aria-pressed={isOn}
            onClick={() => onToggle(value)}
            className={cn(
              'rounded-full border px-3 py-1 text-sm transition-colors',
              isOn
                ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
                : 'border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
            )}
          >
            {label}
          </button>
        )
      })}
      {selected.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-white"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
