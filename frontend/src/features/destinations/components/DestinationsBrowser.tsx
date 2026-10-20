'use client'

import { useMemo, useState } from 'react'
import { where } from 'firebase/firestore'
import { MapPin } from 'lucide-react'
import { toast } from 'sonner'
import type { AccessibilityFeature, Destination } from '@/types/firestore'
import { getDestinationsCollection, getSavedDestinationsCollection } from '@/lib/firebase/firestore'
import { useAuth } from '@/hooks/useAuth'
import { useCollection } from '@/hooks/useFirestore'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { filterDestinations } from '../filters'
import { callAction } from '../callAction'
import { removeDestination, saveDestination } from '../actions/destinations.actions'
import { FeatureFilter } from './FeatureFilter'
import { DestinationCard } from './DestinationCard'

/**
 * Screen 1 body. Waits until we know who is signed in, then shows the list.
 */
export function DestinationsBrowser() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return <p className="text-sm text-zinc-500">Please sign in again to see destinations.</p>
  }

  // key={uid}: if a different user signs in, React starts this component fresh
  return <DestinationsView key={user.uid} uid={user.uid} />
}

function DestinationsView({ uid }: { uid: string }) {
  // Read 1: all destinations (rule: any signed-in user may read).
  // useMemo: create each collection reference ONCE. useCollection re-subscribes
  // whenever its reference changes, so a new one every render would loop.
  const destinationsRef = useMemo(() => getDestinationsCollection(), [])
  const { data, loading, error } = useCollection(destinationsRef)

  // Read 2: MY saves that aren't removed. The where() clauses repeat the
  // security rule (own uid, deletedAt == null) — rules are not filters, so a
  // query that could return someone else's docs would be denied outright.
  const savedRef = useMemo(() => getSavedDestinationsCollection(), [])
  const { data: mySaves } = useCollection(
    savedRef,
    where('uid', '==', uid),
    where('deletedAt', '==', null)
  )
  const savedIds = new Set(mySaves.map((s) => s.destinationId))

  const [selected, setSelected] = useState<AccessibilityFeature[]>([])
  const [pendingId, setPendingId] = useState<string | null>(null)

  const toggle = (feature: AccessibilityFeature) =>
    setSelected((current) =>
      current.includes(feature) ? current.filter((f) => f !== feature) : [...current, feature]
    )
  const clear = () => setSelected([])

  // Save or remove → Server Action → Firestore. The live listeners above then
  // pick up the new saved doc and saveCount by themselves; no manual refresh.
  async function handleSaveToggle(destination: Destination) {
    setPendingId(destination.id)
    const isSaved = savedIds.has(destination.id)
    const result = await callAction(() =>
      isSaved ? removeDestination(destination.id) : saveDestination(destination.id)
    )
    setPendingId(null)

    if (result.success) {
      toast.success(isSaved ? `Removed ${destination.name}` : `Saved ${destination.name}`)
    } else {
      // 1E Save failed
      toast.error(result.error ?? 'Something went wrong. Please try again.')
    }
  }

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
            <DestinationCard
              key={destination.id}
              destination={destination}
              isSaved={savedIds.has(destination.id)}
              isPending={pendingId === destination.id}
              onSaveToggle={() => handleSaveToggle(destination)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
