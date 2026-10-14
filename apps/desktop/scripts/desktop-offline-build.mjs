/** Explicit, fail-closed switch for a controlled Desktop distribution with no update feed. */

/** Environment variable enabling the controlled offline build path. */
export const DESKTOP_OFFLINE_BUILD_ENV = 'DSH_DESKTOP_OFFLINE_BUILD'

/**
 * Resolve the offline-build switch without accepting truthy aliases.
 * @param {NodeJS.ProcessEnv} environment - Packaging environment; unset or empty disables offline mode.
 * @returns {boolean} True only for the exact value "1"; other nonempty values throw.
 */
export function isDesktopOfflineBuild(environment) {
  const value = environment[DESKTOP_OFFLINE_BUILD_ENV]
  if (value === undefined || value === '') return false
  if (value !== '1') throw new Error(`desktop offline build: ${DESKTOP_OFFLINE_BUILD_ENV} must be exactly "1" when set`)
  return true
}