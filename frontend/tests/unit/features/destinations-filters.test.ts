import { describe, it, expect } from 'vitest'
import type { Timestamp } from 'firebase/firestore'
import type { AccessibilityFeature, Destination, SavedDestination } from '@/types/firestore'
import { filterDestinations, filterShortlist } from '@/features/destinations/filters'

// Minimal fake destination: only the fields the filter reads matter.
function dest(name: string, accessibilityFeatures: AccessibilityFeature[]): Destination {
  return {
    id: name.toLowerCase(),
    name,
    country: 'Testland',
    accessibilityFeatures,
    accessibilityNotes: '',
    saveCount: 0,
    createdAt: {} as Timestamp,
    updatedAt: {} as Timestamp,
    _schemaVersion: 1,
  }
}

const tokyo = dest('Tokyo', ['step-free-transport', 'quiet-spaces'])
const bali = dest('Bali', ['quiet-spaces'])
const berlin = dest('Berlin', ['step-free-transport', 'accessible-toilets'])
const all = [tokyo, bali, berlin]

describe('filterDestinations', () => {
  it('returns every destination, sorted A–Z, when no filter is selected', () => {
    expect(filterDestinations(all, []).map((d) => d.name)).toEqual(['Bali', 'Berlin', 'Tokyo'])
  })

  it('keeps destinations that have the one selected feature', () => {
    expect(filterDestinations(all, ['quiet-spaces']).map((d) => d.name)).toEqual(['Bali', 'Tokyo'])
  })

  it('uses AND logic: a destination must have every selected feature', () => {
    expect(
      filterDestinations(all, ['step-free-transport', 'quiet-spaces']).map((d) => d.name)
    ).toEqual(['Tokyo'])
  })

  it('returns an empty list when nothing matches', () => {
    expect(filterDestinations(all, ['accessible-stays'])).toEqual([])
  })

  it('does not change the original array', () => {
    const before = all.map((d) => d.name)
    filterDestinations(all, [])
    expect(all.map((d) => d.name)).toEqual(before)
  })
})

function saved(destination: Destination, tags: string[]): SavedDestination {
  return {
    id: `u1_${destination.id}`,
    uid: 'u1',
    destinationId: destination.id,
    destinationName: destination.name,
    country: destination.country,
    tags,
    createdAt: {} as Timestamp,
    updatedAt: {} as Timestamp,
    deletedAt: null,
    _schemaVersion: 1,
  }
}

describe('filterShortlist', () => {
  const byId = new Map(all.map((d) => [d.id, d]))
  const items = [saved(tokyo, ['winter', 'food']), saved(bali, ['food']), saved(berlin, [])]
  const names = (list: SavedDestination[]) => list.map((i) => i.destinationName)

  it('returns everything, sorted A–Z, with no filters', () => {
    expect(names(filterShortlist(items, byId, [], []))).toEqual(['Bali', 'Berlin', 'Tokyo'])
  })

  it('filters by destination feature', () => {
    expect(names(filterShortlist(items, byId, ['step-free-transport'], []))).toEqual([
      'Berlin',
      'Tokyo',
    ])
  })

  it('multi-select tags use AND logic', () => {
    expect(names(filterShortlist(items, byId, [], ['food']))).toEqual(['Bali', 'Tokyo'])
    expect(names(filterShortlist(items, byId, [], ['food', 'winter']))).toEqual(['Tokyo'])
  })

  it('combines features and tags', () => {
    expect(names(filterShortlist(items, byId, ['quiet-spaces'], ['winter']))).toEqual(['Tokyo'])
  })

  it('drops an item whose destination is missing when a feature filter is on', () => {
    expect(names(filterShortlist(items, new Map(), ['quiet-spaces'], []))).toEqual([])
  })
})
