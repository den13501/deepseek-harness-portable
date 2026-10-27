import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readdirSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { prepareBrowserAssets } from './browser-assets.mjs'
import { resolveBrowserRuntime } from './browser-runtime.mjs'

function fixture(t) {
  const base = mkdtempSync(join(tmpdir(), 'browser runtime 中文 & '))
  t.after(() => rmSync(base, { recursive: true, force: true }))
  const root = join(base, 'portable'), cache = join(base, 'cache'), core = join(base, 'core')
  mkdirSync(join(root, 'app', 'browser'), { recursive: true })
  mkdirSync(core)
  writeFileSync(join(core, 'package.json'), JSON.stringify({ name: 'playwright-core', version: 'pinned' }))
  writeFileSync(join(core, 'browsers.json'), JSON.stringify({ browsers: [
    { name: 'chromium', revision: '1' }, { name: 'ffmpeg', revision: '2' }, { name: 'winldd', revision: '3' },
  ] }))
  for (const path of ['chromium-1/chrome-win64/chrome.exe', 'ffmpeg-2/helper.exe', 'winldd-3/helper.exe']) {
    const file = join(cache, path)
    mkdirSync(join(file, '..'), { recursive: true })
    writeFileSync(file, 'fixture')
  }
  prepareBrowserAssets(cache, core, join(root, 'app', 'browser', 'assets'))
  return { base, root }
}

test('resolves isolated settings after relocation without depending on ambient Playwright settings', t => {
  const { base, root } = fixture(t)
  const moved = join(base, '搬移後 (portable)')
  renameSync(root, moved)
  const settings = resolveBrowserRuntime(moved, 'pinned')
  assert.equal(settings.root, moved)
  assert.equal(settings.executablePath, join(moved, 'app', 'browser', 'assets', 'chromium-1', 'chrome-win64', 'chrome.exe'))
  assert.equal(settings.env.TEMP, join(moved, 'data', 'browser', 'temp'))
  assert.equal(settings.env.ELECTRON_RUN_AS_NODE, '1')
  assert.equal(settings.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD, '1')
  assert.deepEqual(settings.providerConfig, { mode: 'launch', headless: true, executablePath: settings.executablePath, outputDir: settings.output, tempDir: settings.temp })
  assert.deepEqual(settings.args, ['--browser', 'chromium', '--isolated', '--headless', '--executable-path', settings.executablePath, '--output-dir', settings.output])
})

test('rejects relative roots, missing pins, mismatched versions and changed binaries', t => {
  const { root } = fixture(t)
  assert.throws(() => resolveBrowserRuntime('relative', 'pinned'), /absolute/)
  assert.throws(() => resolveBrowserRuntime(root), /pinned/)
  assert.throws(() => resolveBrowserRuntime(root, 'other'), /mismatch/)
  writeFileSync(join(root, 'app', 'browser', 'assets', 'chromium-1', 'chrome-win64', 'chrome.exe'), 'changed')
  assert.throws(() => resolveBrowserRuntime(root, 'pinned'), /integrity/)
})

test('rejects a data junction before writing to its target', t => {
  const { base, root } = fixture(t)
  const outside = join(base, 'outside')
  mkdirSync(outside)
  symlinkSync(outside, join(root, 'data'), process.platform === 'win32' ? 'junction' : 'dir')
  assert.throws(() => resolveBrowserRuntime(root, 'pinned'), /escape/)
  assert.deepEqual(readdirSync(outside), [])
})