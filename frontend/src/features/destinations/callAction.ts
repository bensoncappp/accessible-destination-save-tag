import type { ActionResult } from '@/types'

export const NETWORK_ERROR = 'Connection problem. Check your internet and try again.'

/**
 * Calls a Server Action from the browser and never throws.
 * The action itself already returns { success: false } for problems it knows about,
 * but if the request never reaches the server (offline, server down), the call
 * REJECTS instead — without this, the button would stay on "Saving…" forever.
 */
export async function callAction(action: () => Promise<ActionResult>): Promise<ActionResult> {
  try {
    return await action()
  } catch {
    return { success: false, error: NETWORK_ERROR }
  }
}
