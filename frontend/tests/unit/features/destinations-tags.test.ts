import { describe, it, expect } from 'vitest'
import {
  addTag,
  collectTags,
  normaliseTag,
  validateTags,
  MAX_TAGS,
} from '@/features/destinations/tags'

describe('normaliseTag', () => {
  it('trims, lowercases and collapses spaces', () => {
    expect(normaliseTag('  Beach   Trip ')).toBe('beach trip')
  })
})

describe('addTag', () => {
  it('adds a clean tag', () => {
    expect(addTag([], 'Winter')).toEqual({ ok: true, tags: ['winter'] })
  })

  it('rejects an empty tag', () => {
    expect(addTag([], '   ').ok).toBe(false)
  })

  it('rejects a tag longer than 20 characters', () => {
    expect(addTag([], 'a'.repeat(21)).ok).toBe(false)
  })

  it('accepts a tag of exactly 20 characters', () => {
    expect(addTag([], 'a'.repeat(20)).ok).toBe(true)
  })

  it('rejects symbols (AC-7 invalid tag)', () => {
    expect(addTag([], '<script>').ok).toBe(false)
  })

  it('rejects a duplicate, even with different case', () => {
    expect(addTag(['winter'], 'WINTER').ok).toBe(false)
  })

  it('rejects a 6th tag (AC-7 more than 5)', () => {
    const five = ['a', 'b', 'c', 'd', 'e']
    expect(five).toHaveLength(MAX_TAGS)
    expect(addTag(five, 'f')).toEqual({ ok: false, error: 'You can add up to 5 tags.' })
  })
})

describe('validateTags', () => {
  it('accepts and cleans a valid list', () => {
    expect(validateTags([' Food ', 'with-kids'])).toEqual({ ok: true, tags: ['food', 'with-kids'] })
  })

  it('rejects something that is not a list of strings', () => {
    expect(validateTags('food').ok).toBe(false)
    expect(validateTags([1, 2]).ok).toBe(false)
  })

  it('rejects more than 5 tags', () => {
    expect(validateTags(['a', 'b', 'c', 'd', 'e', 'f']).ok).toBe(false)
  })
})

describe('collectTags', () => {
  it('returns each tag once, sorted A–Z', () => {
    expect(collectTags([{ tags: ['winter', 'food'] }, { tags: ['food'] }, { tags: [] }])).toEqual([
      'food',
      'winter',
    ])
  })
})
