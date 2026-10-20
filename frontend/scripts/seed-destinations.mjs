// Seeds the read-only `destinations` collection with sample data.
// Run from frontend/:  pnpm run seed:destinations
// Safe to re-run: existing destinations are updated, and their saveCount is never reset.

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

// Must match AccessibilityFeature in src/types/firestore.ts
const FEATURES = [
  'step-free-transport',
  'accessible-stays',
  'wheelchair-attractions',
  'accessible-toilets',
  'quiet-spaces',
]

const NOTE = 'Sample data for this demo. Confirm details with providers before travelling.'

// The key (e.g. 'melbourne-au') becomes the Firestore document ID.
const DESTINATIONS = {
  'melbourne-au': {
    name: 'Melbourne',
    country: 'Australia',
    accessibilityFeatures: ['step-free-transport', 'accessible-stays', 'wheelchair-attractions', 'accessible-toilets'],
  },
  'sydney-au': {
    name: 'Sydney',
    country: 'Australia',
    accessibilityFeatures: ['step-free-transport', 'wheelchair-attractions', 'accessible-toilets'],
  },
  'singapore-sg': {
    name: 'Singapore',
    country: 'Singapore',
    accessibilityFeatures: [...FEATURES],
  },
  'kuala-lumpur-my': {
    name: 'Kuala Lumpur',
    country: 'Malaysia',
    accessibilityFeatures: ['accessible-stays', 'wheelchair-attractions'],
  },
  'tokyo-jp': {
    name: 'Tokyo',
    country: 'Japan',
    accessibilityFeatures: ['step-free-transport', 'accessible-toilets', 'quiet-spaces'],
  },
  'london-gb': {
    name: 'London',
    country: 'United Kingdom',
    accessibilityFeatures: ['accessible-stays', 'wheelchair-attractions', 'quiet-spaces'],
  },
  'barcelona-es': {
    name: 'Barcelona',
    country: 'Spain',
    accessibilityFeatures: ['step-free-transport', 'wheelchair-attractions', 'accessible-toilets'],
  },
  'vancouver-ca': {
    name: 'Vancouver',
    country: 'Canada',
    accessibilityFeatures: ['step-free-transport', 'accessible-stays', 'quiet-spaces'],
  },
  'auckland-nz': {
    name: 'Auckland',
    country: 'New Zealand',
    accessibilityFeatures: ['accessible-stays', 'quiet-spaces'],
  },
  'berlin-de': {
    name: 'Berlin',
    country: 'Germany',
    accessibilityFeatures: ['step-free-transport', 'accessible-toilets'],
  },
  'copenhagen-dk': {
    name: 'Copenhagen',
    country: 'Denmark',
    accessibilityFeatures: ['step-free-transport', 'accessible-stays', 'quiet-spaces'],
  },
  'bali-id': {
    name: 'Bali',
    country: 'Indonesia',
    accessibilityFeatures: ['quiet-spaces'],
  },
}

// 1. Check the data before touching the database
for (const [id, d] of Object.entries(DESTINATIONS)) {
  const unknown = d.accessibilityFeatures.filter((f) => !FEATURES.includes(f))
  if (unknown.length > 0) {
    console.error(`${id}: unknown feature(s): ${unknown.join(', ')}`)
    process.exit(1)
  }
}

// 2. Connect with the Admin SDK (same key the server uses)
const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64
if (!key) {
  console.error('FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 is not set. Run this from frontend/ via pnpm run seed:destinations')
  process.exit(1)
}
initializeApp({ credential: cert(JSON.parse(Buffer.from(key, 'base64').toString('utf8'))) })
const db = getFirestore()

// 3. Write each destination: create if new, update if it already exists
let created = 0
let updated = 0
for (const [id, d] of Object.entries(DESTINATIONS)) {
  const ref = db.collection('destinations').doc(id)
  const snap = await ref.get()
  const fields = { ...d, accessibilityNotes: NOTE, updatedAt: FieldValue.serverTimestamp() }

  if (snap.exists) {
    await ref.update(fields) // saveCount left untouched
    updated++
  } else {
    await ref.set({ ...fields, saveCount: 0, createdAt: FieldValue.serverTimestamp(), _schemaVersion: 1 })
    created++
  }
}

console.log(`Done: ${created} created, ${updated} updated`)
