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
/** What one accessibility feature looks like at a destination, with where that fact came from. */
export interface FeatureDetail {
  text: string
  sourceUrl: string
}

export interface Destination {
  id: string
  name: string
  region: string // e.g. 'Victoria' — more precise than country alone
  country: string
  airportCode: string // IATA code of the main arrival airport, e.g. 'MEL'
  airportName: string
  accessibilityFeatures: AccessibilityFeature[]
  // One researched detail per feature in accessibilityFeatures (same keys)
  featureDetails: Partial<Record<AccessibilityFeature, FeatureDetail>>
  accessibilityNotes: string
  saveCount: number // changed only by server code (Server Actions)
  createdAt: Timestamp
  updatedAt: Timestamp
  _schemaVersion: 2 // 2 = added region, airport and featureDetails
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
