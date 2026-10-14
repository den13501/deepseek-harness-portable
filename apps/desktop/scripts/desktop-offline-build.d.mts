/** Environment variable enabling the controlled offline build path. */
export const DESKTOP_OFFLINE_BUILD_ENV: 'DSH_DESKTOP_OFFLINE_BUILD'

/**
 * Resolve the offline-build switch without accepting truthy aliases.
 * @param environment - Packaging environment; unset or empty disables offline mode.
 * @returns True only for the exact value "1"; other nonempty values throw.
 */
export function isDesktopOfflineBuild(environment: NodeJS.ProcessEnv): boolean