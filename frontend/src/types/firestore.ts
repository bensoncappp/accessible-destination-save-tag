import type { Timestamp } from 'firebase/firestore'

/**
 * Firestore collection type definitions.
 *
 * Keep in sync with:
 *   - src/lib/firebase/firestore.ts  (typed collection exports)
 *   - firebase/firestore.rules       (security rules)
 *   - docs/FIRESTORE-SCHEMA.md       (schema documentation)
 *
 * When adding a new collection, use the /firebase-collection skill.
 */

export interface UserProfile {
  uid: string
  email: string
  displayName: string | null
  photoURL: string | null
  role: 'user'
  createdAt: Timestamp
  updatedAt: Timestamp
  _schemaVersion: 1
}

export type CreateUserProfileInput = Omit<UserProfile, 'createdAt' | 'updatedAt'>

/** The fixed list of accessibility features a destination can offer (filter chips). */
export type AccessibilityFeature =
  | 'step-free-transport'
  | 'accessible-stays'
  | 'wheelchair-attractions'
  | 'accessible-toilets'
  | 'quiet-spaces'

/** destinations/{destinationId} : seeded data, read-only for users. */
export interface Destination {
  id: string
  name: string
  country: string
  accessibilityFeatures: AccessibilityFeature[]
  accessibilityNotes: string
  saveCount: number // changed only by server code (Server Actions)
  createdAt: Timestamp
  updatedAt: Timestamp
  _schemaVersion: 1
}

/** savedDestinations/{uid}_{destinationId} : one per user per destination. */
export interface SavedDestination {
  id: string
  uid: string // ownerm, checked by security rules
  destinationId: string
  destinationName: string // copied at save time, so the shortlist needs no second read
  country: string
  tags: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
  deletedAt: Timestamp | null // soft delete: null = active, set = removed
  _schemaVersion: 1
}