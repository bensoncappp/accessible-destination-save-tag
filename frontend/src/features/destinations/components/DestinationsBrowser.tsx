'use client'

import { useMemo, useState } from 'react'
import { MapPin } from 'lucide-react'
import type { AccessibilityFeature } from '@/types/firestore'
import { getDestinationsCollection } from '@/lib/firebase/firestore'
import { useCollection } from '@/hooks/useFirestore'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { filterDestinations } from '../filters'
import { FeatureFilter } from './FeatureFilter'
import { DestinationCard } from './DestinationCard'

/**
 * Screen 1 body. Reads `destinations` live with the client SDK
 * (security rules: any signed-in user may read) and filters in the browser.
 */
export function DestinationsBrowser() {
  // useMemo: create the collection reference ONCE. useCollection re-subscribes
  // whenever this reference changes, so a new one every render would loop.
  const destinationsRef = useMemo(() => getDestinationsCollection(), [])
  const { data, loading, error } = useCollection(destinationsRef)

  const [selected, setSelected] = useState<AccessibilityFeature[]>([])

  const toggle = (feature: AccessibilityFeature) =>
    setSelected((current) =>
      current.includes(feature) ? current.filter((f) => f !== feature) : [...current, feature]
    )
  const clear = () => setSelected([])

  const visible = filterDestinations(data, selected)

  // 1A Loading
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    )
  }

  // 1D Load error
  if (error) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
      >
        <p className="font-medium">We couldn&apos;t load destinations.</p>
        <p className="mt-1">Check your connection and try again.</p>
        <button type="button" onClick={() => window.location.reload()} className="mt-3 underline">
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <FeatureFilter selected={selected} onToggle={toggle} onClear={clear} />

      <p className="text-sm text-zinc-500" aria-live="polite">
        Showing {visible.length} of {data.length} destinations
      </p>

      {visible.length === 0 ? (
        // 1C Empty
        <EmptyState
          icon={MapPin}
          title={data.length === 0 ? 'No destinations yet' : 'No destinations match'}
          description={
            data.length === 0
              ? 'Destinations will appear here once they are added.'
              : 'Try removing a filter to see more places.'
          }
          action={
            selected.length > 0 ? (
              <button type="button" onClick={clear} className="text-sm underline">
                Clear filters
              </button>
            ) : undefined
          }
        />
      ) : (
        // 1B Success
        <div className="grid gap-4 md:grid-cols-2">
          {visible.map((destination) => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </div>
      )}
    </div>
  )
}
