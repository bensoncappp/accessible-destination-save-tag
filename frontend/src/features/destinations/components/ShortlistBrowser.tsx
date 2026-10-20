'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { where } from 'firebase/firestore'
import { Bookmark } from 'lucide-react'
import type { AccessibilityFeature } from '@/types/firestore'
import { getDestinationsCollection, getSavedDestinationsCollection } from '@/lib/firebase/firestore'
import { useAuth } from '@/hooks/useAuth'
import { useCollection } from '@/hooks/useFirestore'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { collectTags } from '../tags'
import { filterShortlist } from '../filters'
import { FeatureFilter } from './FeatureFilter'
import { TagFilter } from './TagFilter'
import { ShortlistItem } from './ShortlistItem'

/** Screen 2 body. Waits until we know who is signed in, then shows their shortlist. */
export function ShortlistBrowser() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return <p className="text-sm text-zinc-500">Please sign in again to see your shortlist.</p>
  }

  return <ShortlistView key={user.uid} uid={user.uid} />
}

// Adds the value if missing, removes it if present
function toggleIn<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

function ShortlistView({ uid }: { uid: string }) {
  // Read 1: MY saves that aren't removed. The where() clauses repeat the
  // security rule — rules are not filters, so a broader query would be denied.
  const savedRef = useMemo(() => getSavedDestinationsCollection(), [])
  const saves = useCollection(savedRef, where('uid', '==', uid), where('deletedAt', '==', null))

  // Read 2: all destinations, for each saved item's features, notes and count
  const destinationsRef = useMemo(() => getDestinationsCollection(), [])
  const destinations = useCollection(destinationsRef)
  const destinationsById = new Map(destinations.data.map((d) => [d.id, d]))

  const [features, setFeatures] = useState<AccessibilityFeature[]>([])
  const [tagFilter, setTagFilter] = useState<string[]>([])

  const allTags = collectTags(saves.data)
  // Ignore a selected tag that no longer exists on any item (e.g. just deleted)
  const activeTags = tagFilter.filter((t) => allTags.includes(t))
  const items = filterShortlist(saves.data, destinationsById, features, activeTags)
  const isFiltering = features.length > 0 || activeTags.length > 0
  const clearAll = () => {
    setFeatures([])
    setTagFilter([])
  }

  // 2A Loading
  if (saves.loading || destinations.loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    )
  }

  // 2D Load error
  if (saves.error || destinations.error) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
      >
        <p className="font-medium">We couldn&apos;t load your shortlist.</p>
        <p className="mt-1">Check your connection and try again.</p>
        <button type="button" onClick={() => window.location.reload()} className="mt-3 underline">
          Try again
        </button>
      </div>
    )
  }

  // 2C Empty: nothing saved yet
  if (saves.data.length === 0) {
    return (
      <EmptyState
        icon={Bookmark}
        title="Your shortlist is empty"
        description="Save destinations to compare them and add your own tags."
        action={
          <Link href="/destinations" className="text-sm underline">
            Browse destinations
          </Link>
        }
      />
    )
  }

  // 2B Success
  return (
    <div className="space-y-4">
      <FeatureFilter
        selected={features}
        onToggle={(f) => setFeatures((current) => toggleIn(current, f))}
        onClear={() => setFeatures([])}
      />
      <TagFilter
        tags={allTags}
        selected={activeTags}
        onToggle={(t) => setTagFilter((current) => toggleIn(current, t))}
        onClear={() => setTagFilter([])}
      />

      <p className="text-sm text-zinc-500" aria-live="polite">
        Showing {items.length} of {saves.data.length} saved destinations
      </p>

      {items.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved destinations match"
          description="Try removing a filter."
          action={
            isFiltering ? (
              <button type="button" onClick={clearAll} className="text-sm underline">
                Clear all filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <ShortlistItem
              key={item.id}
              item={item}
              destination={destinationsById.get(item.destinationId)}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
