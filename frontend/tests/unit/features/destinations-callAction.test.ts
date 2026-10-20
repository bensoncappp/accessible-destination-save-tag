import { describe, it, expect } from 'vitest'
import { callAction, NETWORK_ERROR } from '@/features/destinations/callAction'

describe('callAction', () => {
  it('passes a successful result through', async () => {
    expect(await callAction(async () => ({ success: true }))).toEqual({ success: true })
  })

  it('passes a handled failure through unchanged', async () => {
    const failed = { success: false, error: 'Invalid destination.' }
    expect(await callAction(async () => failed)).toEqual(failed)
  })

  it('turns a network failure (rejected call) into a friendly error', async () => {
    const offline = async () => {
      throw new TypeError('Failed to fetch')
    }
    expect(await callAction(offline)).toEqual({ success: false, error: NETWORK_ERROR })
  })
})
