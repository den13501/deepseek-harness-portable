/** Company source-distribution policy. Deliberately not configurable via environment or user settings. */
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/cordis-plugin-loader'

/** Known Harness-owned collection and extra model-request contributions; normal inference is not denied. */
export const COMPANY_BLOCKED_MODULES: readonly string[] = Object.freeze([
  '@deepseek-ai/dsh-client-product-analytics',
  '@deepseek-ai/dsh-host-product-telemetry-otel',
  '@deepseek-ai/dsh-session-telemetry-otel',
  '@deepseek-ai/dsh-session-log-deepseek',
  '@deepseek-ai/dsh-plugin-package-inventory-deepseek',
])

/** Match package names and their subpaths independently of user-selected entry ids. */
export function isCompanyBlockedModule(name: string): boolean {
  return COMPANY_BLOCKED_MODULES.some(module => name === module || name.startsWith(`${module}/`))
}

/** Install before any configuration entry mounts; retained for the lifetime of the root context. */
export function installCompanyPrivacyPolicy(ctx: Context): void {
  ctx.on('loader/entry-disabled', (entry, next) => isCompanyBlockedModule(entry.options.name ?? '') || next(), { global: true })
}
