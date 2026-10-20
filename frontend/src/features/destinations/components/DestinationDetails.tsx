import { Plane } from 'lucide-react'
import type { Destination } from '@/types/firestore'
import { featureLabel } from '../constants'

/**
 * The detail part of a destination: where it is (region, country, arrival airport),
 * each accessibility feature with its researched detail and source, notes, save count.
 * Shared by the Destinations card and the Shortlist item so both show the same info.
 */
export function DestinationDetails({ destination }: { destination: Destination }) {
  const {
    name,
    region,
    country,
    airportCode,
    airportName,
    accessibilityFeatures,
    featureDetails,
    accessibilityNotes,
    saveCount,
  } = destination

  return (
    <>
      <div className="space-y-1 text-sm text-zinc-500">
        <p>
          {region}, {country}
        </p>
        <p className="flex items-center gap-1.5">
          <Plane className="h-3.5 w-3.5" aria-hidden="true" />
          <span>
            Arrive at <abbr title={airportName}>{airportCode}</abbr> · {airportName}
          </span>
        </p>
      </div>

      <ul className="space-y-2" aria-label={`Accessibility features in ${name}`}>
        {accessibilityFeatures.map((feature) => {
          const detail = featureDetails?.[feature]
          return (
            <li key={feature} className="text-sm">
              <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {featureLabel(feature)}
              </span>
              {detail && (
                <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                  {detail.text}{' '}
                  <a
                    href={detail.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs whitespace-nowrap underline"
                  >
                    Source
                    <span className="sr-only">
                      {' '}
                      for {featureLabel(feature)} (opens in a new tab)
                    </span>
                  </a>
                </p>
              )}
            </li>
          )
        })}
      </ul>

      <p className="text-xs text-zinc-500 italic">{accessibilityNotes}</p>

      <p className="text-xs text-zinc-500">
        Saved by {saveCount} {saveCount === 1 ? 'traveller' : 'travellers'}
      </p>
    </>
  )
}
