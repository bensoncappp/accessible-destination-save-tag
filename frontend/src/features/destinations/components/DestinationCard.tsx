import type { Destination } from '@/types/firestore'
import { DestinationDetails } from './DestinationDetails'

interface DestinationCardProps {
  destination: Destination
  isSaved: boolean
  isPending: boolean
  onSaveToggle: () => void
}

/** One destination: name, country, details, and the Save button. */
export function DestinationCard({
  destination,
  isSaved,
  isPending,
  onSaveToggle,
}: DestinationCardProps) {
  const { name, country } = destination

  // Button text follows the wireframe: Save → Saving… → Saved ✓
  let buttonText = isSaved ? 'Saved ✓' : 'Save'
  if (isPending) buttonText = isSaved ? 'Removing…' : 'Saving…'

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <h2 className="text-lg font-semibold">{name}</h2>
        <p className="text-sm text-zinc-500">{country}</p>
      </div>

      <DestinationDetails destination={destination} />

      <div className="mt-auto flex items-center justify-end gap-3">
        {isSaved && !isPending && (
          <button
            type="button"
            onClick={onSaveToggle}
            className="text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-white"
            aria-label={`Remove ${name} from shortlist`}
          >
            Remove
          </button>
        )}
        <button
          type="button"
          onClick={isSaved ? undefined : onSaveToggle}
          disabled={isPending || isSaved}
          aria-label={isSaved ? `${name} is saved` : `Save ${name} to shortlist`}
          className={
            isSaved
              ? 'rounded-md border border-green-600 px-3 py-1.5 text-sm font-medium text-green-700 dark:text-green-400'
              : 'rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-white dark:text-zinc-900'
          }
        >
          {buttonText}
        </button>
      </div>
    </article>
  )
}
