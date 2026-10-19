/** Chromium browser tools from the pinned Playwright MCP server. @module */

import { dirname, isAbsolute, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'
import { BrowserMcpConfig, mountSessionMcp, validateBrowserMcpConfig } from '@deepseek-ai/dsh-experimental-browser-use-runtime/mcp'
import type {} from '@deepseek-ai/dsh-working-directory'

/** Cordis identity for the Playwright MCP browser provider. */
export const name = 'experimental-browser-use-playwright-mcp'

/** Services required for scoped MCP startup and prompt readiness checks. */
export const inject = ['browserUse', 'agents', 'tools', 'systemPrompt', 'workingDirectory']

/** Fixed Chromium launch or existing-browser attachment settings. */
export type Config = BrowserMcpConfig & {
  /** Absolute directory for generated upstream artifacts; explicit relative filenames use the Session working directory. */
  outputDir?: string
  /** Absolute temporary directory inherited by the MCP server and its owned browser. */
  tempDir?: string
}

type ConfigInput = Config | (Omit<Extract<Config, { mode: 'launch' }>, 'headless'> & { headless?: boolean })

/** Validate the launch or attachment configuration before activation. */
export const Config: Schema<ConfigInput, Config> = Schema.intersect([
  BrowserMcpConfig,
  Schema.object({
    outputDir: Schema.string().pattern(/\S/u),
    tempDir: Schema.string().pattern(/\S/u),
  }),
])

/**
 * Expose Playwright's upstream tools in each live Session's scope.
 * The pinned npm server runs under the current Node executable; browser state is not persisted by DSH.
 * @param ctx - provider context supplying browser use, Agents, and tools.
 * @param config - validated browser choice and optional tool timeout.
 */
export function apply(ctx: Context, config: Config): void {
  validateBrowserMcpConfig(config)
  for (const directory of [config.outputDir, config.tempDir]) {
    if (directory !== undefined && !isAbsolute(directory)) throw new Error('browser outputDir and tempDir must be absolute paths')
  }
  const cli = join(dirname(fileURLToPath(import.meta.resolve('@playwright/mcp/package.json'))), 'cli.js')
  // Upstream environment options can otherwise replace the configured browser
  // mode or import an unrelated profile. Empty values mean absent to its parser.
  // Packaged hosts run under the Electron binary with the node-mode flag
  // cleared, so the MCP server child must opt back into Node mode explicitly.
  const env: Record<string, string> = {
    ELECTRON_RUN_AS_NODE: '1',
    ...Object.fromEntries(Object.keys(process.env)
      .filter(key => key.toUpperCase().startsWith('PLAYWRIGHT_MCP_'))
      .map(key => [key, ''])),
  }
  const args = [cli, '--browser', 'chromium']
  if (config.outputDir !== undefined) args.push('--output-dir', config.outputDir)
  if (config.tempDir !== undefined) Object.assign(env, { TEMP: config.tempDir, TMP: config.tempDir, TMPDIR: config.tempDir })
  if (config.mode === 'attach') {
    args.push('--cdp-endpoint', config.endpoint)
  } else {
    args.push('--isolated')
    if (config.headless) args.push('--headless')
    if (config.executablePath !== undefined) args.push('--executable-path', config.executablePath)
  }
  mountSessionMcp(ctx, {
    name: 'playwright-mcp',
    exclusive: config.mode === 'attach',
    command: process.execPath,
    args,
    env,
    ...config.toolCallTimeoutMs === undefined ? {} : { toolCallTimeoutMs: config.toolCallTimeoutMs },
  })
}
