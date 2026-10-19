/** Resolve a sealed optional browser payload without consulting user caches. */
import { mkdirSync, realpathSync } from 'node:fs'
import { isAbsolute, join, relative, sep } from 'node:path'
import { verifyBrowserAssets } from './browser-assets.mjs'

function inside(root, path) {
  const suffix = relative(root, path)
  return suffix !== '' && suffix !== '..' && !suffix.startsWith('..' + sep) && !isAbsolute(suffix)
}

/** Build explicit settings for an isolated MCP process; does not enable a DSH plugin. */
export function resolveBrowserRuntime(portableDirectory, expectedPlaywrightVersion) {
  if (!isAbsolute(portableDirectory)) throw new Error('Portable directory must be absolute')
  if (typeof expectedPlaywrightVersion !== 'string' || !expectedPlaywrightVersion.trim()) {
    throw new Error('Expected pinned Playwright version is required')
  }
  const root = realpathSync(portableDirectory)
  const assets = join(root, 'app', 'browser', 'assets')
  if (!inside(root, realpathSync(assets))) throw new Error('Browser assets escape portable directory')
  const manifest = verifyBrowserAssets(assets)
  if (manifest.playwrightVersion !== expectedPlaywrightVersion) throw new Error('Pinned Playwright version mismatch')
  const executablePath = join(assets, manifest.executable)
  const state = join(root, 'data', 'browser')
  // Check existing ancestors before creating children: do not write through a data junction.
  for (const path of [join(root, 'data'), state, join(state, 'temp'), join(state, 'output')]) {
    try {
      if (!inside(root, realpathSync(path))) throw new Error('Browser state escapes portable directory')
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
    mkdirSync(path, { recursive: true })
    if (!inside(root, realpathSync(path))) throw new Error('Browser state escapes portable directory')
  }
  const temp = join(state, 'temp'), output = join(state, 'output')
  return {
    root, assets, executablePath, temp, output,
    providerConfig: { mode: 'launch', headless: true, executablePath, outputDir: output, tempDir: temp },
    args: ['--browser', 'chromium', '--isolated', '--headless', '--executable-path', executablePath, '--output-dir', output],
    env: {
      ELECTRON_RUN_AS_NODE: '1', PLAYWRIGHT_BROWSERS_PATH: assets,
      PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '1', TEMP: temp, TMP: temp, TMPDIR: temp,
    },
  }
}