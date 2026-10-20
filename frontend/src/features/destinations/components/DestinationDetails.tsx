import type { Destination } from '@/types/firestore'
import { featureLabel } from '../constants'

/**
 * The detail part of a destination (feature badges, notes, save count).
 * Shared by the Destinations card and the Shortlist item so both show the same info.
 */
export function DestinationDetails({ destination }: { destination: Destination }) {
  const { name, accessibilityFeatures, accessibilityNotes, saveCount } = destination

  return (
    <>
      <ul className="flex flex-wrap gap-2" aria-label={`Accessibility features in ${name}`}>
        {accessibilityFeatures.map((feature) => (
          <li
            key={feature}
            className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            {featureLabel(feature)}
          </li>
        ))}
      </ul>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">{accessibilityNotes}</p>

      <p className="text-xs text-zinc-500">
        Saved by {saveCount} {saveCount === 1 ? 'traveller' : 'travellers'}
      </p>
    </>
  )
}
