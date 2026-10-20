import type { Destination } from '@/types/firestore'
import { featureLabel } from '../constants'

interface DestinationCardProps {
  destination: Destination
}

/** One destination: name, country, feature badges, notes, save count. */
export function DestinationCard({ destination }: DestinationCardProps) {
  const { name, country, accessibilityFeatures, accessibilityNotes, saveCount } = destination

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <h2 className="text-lg font-semibold">{name}</h2>
        <p className="text-sm text-zinc-500">{country}</p>
      </div>

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

      <p className="mt-auto text-xs text-zinc-500">
        Saved by {saveCount} {saveCount === 1 ? 'traveller' : 'travellers'}
      </p>
    </article>
  )
}
