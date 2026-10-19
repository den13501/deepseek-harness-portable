import { describe, expect, it } from 'vitest'
import { createElectronBuilderConfig } from '../scripts/electron-builder-config.mjs'
import { isDesktopOfflineBuild } from '../scripts/desktop-offline-build.mjs'

describe('Desktop offline build', () => {
  it('requires an exact opt-in value', () => {
    expect(isDesktopOfflineBuild({})).toBe(false)
    expect(isDesktopOfflineBuild({ DSH_DESKTOP_OFFLINE_BUILD: '1' })).toBe(true)
    expect(() => isDesktopOfflineBuild({ DSH_DESKTOP_OFFLINE_BUILD: 'true' })).toThrow('DSH_DESKTOP_OFFLINE_BUILD')
  })

  it('omits the update feed and embeds the offline distribution manifest flag', () => {
    const config = createElectronBuilderConfig({
      DSH_DESKTOP_APP_ID: 'com.example.offline',
      DSH_DESKTOP_OFFLINE_BUILD: '1',
      DSH_DESKTOP_UNSIGNED: '1',
      DSH_DESKTOP_TARGET_PLATFORM: 'win32',
      DSH_DESKTOP_TARGET_ARCH: 'x64',
    }, 'win32', 'x64')
    expect(config.publish).toBeNull()
    expect(config.extraMetadata).toMatchObject({ dshOfflineMode: true })
    expect(config.extraMetadata).not.toHaveProperty('dshMandatoryUpdatePolicy')
  })
})
