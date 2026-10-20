'use client'

import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import type { Destination, SavedDestination } from '@/types/firestore'
import { addTag, MAX_TAGS } from '../tags'
import { removeDestination, updateTags } from '../actions/destinations.actions'
import { callAction } from '../callAction'
import { DestinationDetails } from './DestinationDetails'

interface ShortlistItemProps {
  item: SavedDestination
  // The full destination (features, notes, count). Missing only if it was deleted.
  destination: Destination | undefined
}

/** One saved destination: full details, its tags (add / remove), and Remove. */
export function ShortlistItem({ item, destination }: ShortlistItemProps) {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const isFull = item.tags.length >= MAX_TAGS

  // Sends the whole new tag list to the server. The live listener on the
  // shortlist then shows the saved tags, so there's no local copy to keep in sync.
  async function saveTags(nextTags: string[]): Promise<boolean> {
    setBusy(true)
    const result = await callAction(() => updateTags(item.destinationId, nextTags))
    setBusy(false)
    if (!result.success) {
      toast.error(result.error ?? 'Could not update tags. Please try again.')
      return false
    }
    return true
  }

  async function handleAddTag(event: FormEvent) {
    event.preventDefault() // stop the browser reloading the page on submit
    const result = addTag(item.tags, draft)
    if (!result.ok) {
      setError(result.error) // 2E: invalid tag or 5/5 limit, shown instantly
      return
    }
    setError(null)
    if (await saveTags(result.tags)) setDraft('')
  }

  async function handleRemoveTag(tag: string) {
    await saveTags(item.tags.filter((t) => t !== tag))
  }

  async function handleRemoveItem() {
    setBusy(true)
    const result = await callAction(() => removeDestination(item.destinationId))
    if (result.success) {
      toast.success(`Removed ${item.destinationName}`)
      // The item disappears by itself: the live query only shows deletedAt == null
    } else {
      setBusy(false)
      toast.error(result.error ?? 'Could not remove. Please try again.') // 2E remove failed
    }
  }

  const inputId = `tag-input-${item.destinationId}`
  const errorId = `tag-error-${item.destinationId}`

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{item.destinationName}</h2>
          {/* Location comes from the full destination below; fall back to the saved copy */}
          {!destination && <p className="text-sm text-zinc-500">{item.country}</p>}
        </div>
        <button
          type="button"
          onClick={handleRemoveItem}
          disabled={busy}
          className="text-sm text-zinc-500 underline hover:text-zinc-900 disabled:opacity-60 dark:hover:text-white"
        >
          Remove
        </button>
      </div>

      {destination && <DestinationDetails destination={destination} />}

      {item.tags.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label={`Tags for ${item.destinationName}`}>
          {item.tags.map((tag) => (
            <li
              key={tag}
              className="flex items-center gap-1 rounded-full bg-zinc-100 py-0.5 pr-1 pl-3 text-sm dark:bg-zinc-800"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                disabled={busy}
                aria-label={`Remove tag ${tag}`}
                className="rounded-full p-0.5 hover:bg-zinc-200 disabled:opacity-60 dark:hover:bg-zinc-700"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAddTag} className="space-y-1">
        <label htmlFor={inputId} className="text-xs text-zinc-500">
          Add a tag ({item.tags.length}/{MAX_TAGS})
        </label>
        <div className="flex gap-2">
          <input
            id={inputId}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              setError(null)
            }}
            disabled={busy || isFull}
            placeholder={isFull ? 'Tag limit reached' : 'e.g. winter trip'}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className="flex-1 rounded-md border border-zinc-300 bg-transparent px-3 py-1.5 text-sm disabled:opacity-60 dark:border-zinc-700"
          />
          <button
            type="submit"
            disabled={busy || isFull}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-white dark:text-zinc-900"
          >
            Add
          </button>
        </div>
        {error && (
          <p id={errorId} role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </form>
    </li>
  )
}
