import { describe, it, expect } from 'vitest'
import type { Timestamp } from 'firebase/firestore'
import type { AccessibilityFeature, Destination } from '@/types/firestore'
import { filterDestinations } from '@/features/destinations/filters'

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
