# Firestore Schema

## Overview

All collections use the typed collection pattern — see `frontend/src/lib/firebase/firestore.ts`.
Security rules are in `firebase/firestore.rules`.

When adding a new collection, use the `/firebase-collection` Claude Code skill.

## Schema versioning

Every document in every collection **must** include a `_schemaVersion` field:

```typescript
_schemaVersion: 1; // increment when doing a breaking schema change
```

This enables **lazy migration** — when a document is read, check `_schemaVersion` and migrate on the fly if it's behind current. See the `/evolve-schema` skill for the full migration workflow.

**Rules:**

- `_schemaVersion` is always `1` on creation
- Non-breaking changes (adding optional fields with defaults) keep the same version
- Breaking changes (rename, remove, type change) increment the version and require a migration function
- Never remove `_schemaVersion` from a schema

---

## `users` collection

**Path:** `/users/{userId}`
**Access:** Owner-only (user can read/write their own document; admins can read all)

| Field            | Type                | Required | Description                                  |
| ---------------- | ------------------- | -------- | -------------------------------------------- |
| `uid`            | `string`            | Yes      | Firebase Auth UID (same as document ID)      |
| `email`          | `string`            | Yes      | User's email address                         |
| `displayName`    | `string \| null`    | Yes      | Display name from Auth or profile            |
| `photoURL`       | `string \| null`    | Yes      | Profile photo URL                            |
| `role`           | `'user' \| 'admin'` | Yes      | User role — immutable by user after creation |
| `createdAt`      | `Timestamp`         | Yes      | When the document was created                |
| `updatedAt`      | `Timestamp`         | Yes      | When the document was last updated           |
| `_schemaVersion` | `1`                 | Yes      | Schema version for lazy migration            |

**Creation:** Auto-created by `AuthProvider` on first sign-in via `syncUserProfile()`.
**Deletion:** Hard-delete is disabled in security rules. Use `deletedAt` field for soft-delete.

---

<!-- Add new collection schemas below using the /firebase-collection skill -->

## `destinations` collection

**Path:** `/destinations/{destinationId}`
**Access:** Read by any signed-in user. No client writes; `saveCount` is updated only by Server Actions (Admin SDK).

| Field                   | Type                                             | Required | Description                                                                                                                  |
| ----------------------- | ------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `name`                  | `string`                                         | Yes      | Destination name                                                                                                             |
| `region`                | `string`                                         | Yes      | State / province / region, e.g. `Victoria`                                                                                   |
| `country`               | `string`                                         | Yes      | Country                                                                                                                      |
| `airportCode`           | `string`                                         | Yes      | IATA code of the main arrival airport, e.g. `MEL`                                                                            |
| `airportName`           | `string`                                         | Yes      | Name of that airport                                                                                                         |
| `accessibilityFeatures` | `AccessibilityFeature[]`                         | Yes      | From a fixed list: `step-free-transport`, `accessible-stays`, `wheelchair-attractions`, `accessible-toilets`, `quiet-spaces` |
| `featureDetails`        | `map<AccessibilityFeature, { text, sourceUrl }>` | Yes      | One researched detail per listed feature, with the source it came from (same keys as `accessibilityFeatures`)                |
| `accessibilityNotes`    | `string`                                         | Yes      | General caveat or tip for the destination                                                                                    |
| `saveCount`             | `number`                                         | Yes      | How many users currently have it saved; never below 0                                                                        |
| `createdAt`             | `Timestamp`                                      | Yes      | When the document was created                                                                                                |
| `updatedAt`             | `Timestamp`                                      | Yes      | When the document was last updated                                                                                           |
| `_schemaVersion`        | `2`                                              | Yes      | Schema version (2 added `region`, `airportCode`, `airportName`, `featureDetails`)                                            |

**Creation:** Seeded by `frontend/scripts/seed-destinations.mjs`. Feature details were researched in Oct 2026 and each links to its source; a feature is only listed when a source supports it.

---

## `savedDestinations` collection

**Path:** `/savedDestinations/{uid}_{destinationId}`
**Access:** Owner-only read of non-removed documents. No client writes; all writes go through Server Actions.

| Field             | Type                | Required | Description                                                    |
| ----------------- | ------------------- | -------- | -------------------------------------------------------------- |
| `uid`             | `string`            | Yes      | Owner's Firebase Auth UID                                      |
| `destinationId`   | `string`            | Yes      | ID of the saved destination                                    |
| `destinationName` | `string`            | Yes      | Copied at save time for display                                |
| `country`         | `string`            | Yes      | Copied at save time for display                                |
| `tags`            | `string[]`          | Yes      | User's own labels: max 5, lowercase, 1–20 chars, no duplicates |
| `createdAt`       | `Timestamp`         | Yes      | When first saved                                               |
| `updatedAt`       | `Timestamp`         | Yes      | When last changed                                              |
| `deletedAt`       | `Timestamp \| null` | Yes      | `null` = active; set = removed (soft delete)                   |
| `_schemaVersion`  | `1`                 | Yes      | Schema version for lazy migration                              |

**Document ID:** `{uid}_{destinationId}`, so each user can save a destination only once (prevents duplicates).
**Deletion:** Soft delete only; re-saving a removed destination restores it.
