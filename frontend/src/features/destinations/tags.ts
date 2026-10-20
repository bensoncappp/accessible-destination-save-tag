/**
 * Tag rules for shortlist items. Used in BOTH places:
 *   - the browser, to show an error instantly while typing
 *   - the Server Action, as the real guard (the browser can be bypassed)
 */

export const MAX_TAGS = 5
export const MAX_TAG_LENGTH = 20

// After cleaning: starts with a letter or digit, then letters, digits, spaces or hyphens
const TAG_PATTERN = /^[a-z0-9][a-z0-9 -]*$/

export type TagResult = { ok: true; tags: string[] } | { ok: false; error: string }

/** '  Beach   Trip ' → 'beach trip' (trim, lowercase, single spaces). */
export function normaliseTag(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Returns an error message for a bad (already cleaned) tag, or null if it's fine. */
export function tagError(tag: string): string | null {
  if (tag.length === 0) return 'Tag cannot be empty.'
  if (tag.length > MAX_TAG_LENGTH) return `Tags can be at most ${MAX_TAG_LENGTH} characters.`
  if (!TAG_PATTERN.test(tag)) return 'Use only letters, numbers, spaces and hyphens.'
  return null
}

/** Adds one tag to an existing list, or explains why it can't (AC-7). */
export function addTag(existing: string[], raw: string): TagResult {
  const tag = normaliseTag(raw)
  const error = tagError(tag)
  if (error) return { ok: false, error }
  if (existing.includes(tag)) return { ok: false, error: `"${tag}" is already a tag.` }
  if (existing.length >= MAX_TAGS)
    return { ok: false, error: `You can add up to ${MAX_TAGS} tags.` }
  return { ok: true, tags: [...existing, tag] }
}

/** Checks a whole list from the browser before it is saved (server-side guard). */
export function validateTags(tags: unknown): TagResult {
  if (!Array.isArray(tags) || !tags.every((t) => typeof t === 'string')) {
    return { ok: false, error: 'Tags must be a list of text.' }
  }
  let result: string[] = []
  for (const raw of tags) {
    const next = addTag(result, raw)
    if (!next.ok) return next
    result = next.tags
  }
  return { ok: true, tags: result }
}

/** Every distinct tag used across the shortlist, A–Z (for the filter chips). */
export function collectTags(items: { tags: string[] }[]): string[] {
  return [...new Set(items.flatMap((i) => i.tags))].sort()
}
