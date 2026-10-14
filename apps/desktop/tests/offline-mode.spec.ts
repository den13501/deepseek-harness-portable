import { describe, expect, it } from 'vitest'
import { isDesktopOfflineMode } from '../src/offline-mode.ts'

describe('Desktop offline distribution mode', () => {
  it('requires an explicit boolean manifest opt-in', () => {
    expect(isDesktopOfflineMode({ dshOfflineMode: true })).toBe(true)
    expect(isDesktopOfflineMode({})).toBe(false)
    expect(isDesktopOfflineMode({ dshOfflineMode: false })).toBe(false)
    expect(isDesktopOfflineMode({ dshOfflineMode: 'true' })).toBe(false)
  })
})
