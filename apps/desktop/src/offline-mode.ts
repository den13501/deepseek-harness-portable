/** Offline distribution flags. The manifest flag is intentionally opt-in so upstream builds retain update behavior. */

/** Narrow manifest shape read by the Electron main process. */
interface DesktopDistributionManifest {
  readonly dshOfflineMode?: unknown
}

/**
 * Whether this packaged application is a controlled offline distribution.
 * @param manifest - Parsed application manifest, not renderer-controlled data.
 * @returns True only for an explicit boolean opt-in.
 */
export function isDesktopOfflineMode(manifest: unknown): boolean {
  return typeof manifest === 'object' && manifest !== null
    && (manifest as DesktopDistributionManifest).dshOfflineMode === true
}
