'use server'

import { z } from 'zod'
import { FieldValue } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase/admin'
import { requireAuth } from '@/actions/auth.actions'
import type { ActionResult } from '@/types'

/**
 * Save / remove a destination on the signed-in user's shortlist.
 *
 * These run on the SERVER (Admin SDK), so Firestore rules don't apply.
 * That is why every check the rules would normally do happens here:
 *   1. requireAuth()  → who is asking (from the session cookie, not the browser)
 *   2. Zod            → the destination ID is a safe, expected shape
 *   3. Transaction    → the saved doc and saveCount change together, or not at all
 */

// IDs look like 'melbourne-au'. Blocks empty strings and paths like 'a/b'.
const destinationIdSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9-]+$/, 'Invalid destination ID')

// One saved doc per user per destination → saving twice can never create two docs.
function savedDocId(uid: string, destinationId: string) {
  return `${uid}_${destinationId}`
}

export async function saveDestination(destinationId: string): Promise<ActionResult> {
  // Outside try/catch: if signed out, requireAuth redirects to sign-in (AC-11)
  const { uid } = await requireAuth()

  const parsed = destinationIdSchema.safeParse(destinationId)
  if (!parsed.success) return { success: false, error: 'Invalid destination.' }

  const destRef = adminDb.collection('destinations').doc(parsed.data)
  const savedRef = adminDb.collection('savedDestinations').doc(savedDocId(uid, parsed.data))

  try {
    await adminDb.runTransaction(async (tx) => {
      // All reads first (a Firestore transaction rule)
      const destSnap = await tx.get(destRef)
      const savedSnap = await tx.get(savedRef)

      if (!destSnap.exists) throw new Error('NOT_FOUND')

      // Already saved and not removed → do nothing, so saveCount isn't counted twice (AC-4)
      if (savedSnap.exists && savedSnap.data()?.deletedAt == null) return

      const dest = destSnap.data()!

      // New save, or re-save after a soft delete: write a fresh saved doc
      tx.set(savedRef, {
        uid,
        destinationId: parsed.data,
        destinationName: dest.name,
        country: dest.country,
        tags: [],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        deletedAt: null,
        _schemaVersion: 1,
      })
      tx.update(destRef, {
        saveCount: (dest.saveCount ?? 0) + 1,
        updatedAt: FieldValue.serverTimestamp(),
      })
    })
    return { success: true }
  } catch (err) {
    if (err instanceof Error && err.message === 'NOT_FOUND') {
      return { success: false, error: 'That destination no longer exists.' }
    }
    console.error('saveDestination failed', err)
    return { success: false, error: 'Could not save. Please try again.' }
  }
}

export async function removeDestination(destinationId: string): Promise<ActionResult> {
  const { uid } = await requireAuth()

  const parsed = destinationIdSchema.safeParse(destinationId)
  if (!parsed.success) return { success: false, error: 'Invalid destination.' }

  const destRef = adminDb.collection('destinations').doc(parsed.data)
  const savedRef = adminDb.collection('savedDestinations').doc(savedDocId(uid, parsed.data))

  try {
    await adminDb.runTransaction(async (tx) => {
      const savedSnap = await tx.get(savedRef)
      const destSnap = await tx.get(destRef)

      // Not saved (or already removed) → nothing to undo, count unchanged
      if (!savedSnap.exists || savedSnap.data()?.deletedAt != null) return

      // Soft delete: keep the doc, mark it removed
      tx.update(savedRef, {
        deletedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })

      if (destSnap.exists) {
        // Never let the count go below 0 (AC-9)
        const current = destSnap.data()?.saveCount ?? 0
        tx.update(destRef, {
          saveCount: Math.max(0, current - 1),
          updatedAt: FieldValue.serverTimestamp(),
        })
      }
    })
    return { success: true }
  } catch (err) {
    console.error('removeDestination failed', err)
    return { success: false, error: 'Could not remove. Please try again.' }
  }
}
