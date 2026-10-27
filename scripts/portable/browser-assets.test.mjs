import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { prepareBrowserAssets, verifyBrowserAssets } from './browser-assets.mjs'

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'browser assets 中文 & '))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const cache = join(root, 'cache'), core = join(root, 'core'), dest = join(root, 'new portable')
  mkdirSync(core); mkdirSync(cache)
  writeFileSync(join(core, 'package.json'), JSON.stringify({ name: 'playwright-core', version: 'test-pinned' }))
  writeFileSync(join(core, 'browsers.json'), JSON.stringify({ browsers: [
    { name: 'chromium', revision: '123', browserVersion: '1.2.3' },
    { name: 'ffmpeg', revision: '456' }, { name: 'winldd', revision: '789' },
  ] }))
  for (const directory of ['chromium-123/chrome-win64', 'ffmpeg-456', 'winldd-789', '.links', 'unrelated-profile']) {
    mkdirSync(join(cache, directory), { recursive: true })
    writeFileSync(join(cache, directory, directory.includes('chrome') ? 'chrome.exe' : 'fixture.txt'), directory)
  }
  return { root, cache, core, dest }
}

test('seals selected pinned components only and supports relocation', t => {
  const { root, cache, core, dest } = fixture(t)
  const manifest = prepareBrowserAssets(cache, core, dest)
  assert.equal(manifest.files.length, 3)
  assert.equal(manifest.playwrightVersion, 'test-pinned')
  assert.equal(readFileSync(join(dest, 'BROWSER-ASSETS.json'), 'utf8').includes(cache), false)
  assert.deepEqual(verifyBrowserAssets(dest), manifest)
  assert.throws(() => prepareBrowserAssets(cache, core, dest), /overwrite/)
  assert.throws(() => prepareBrowserAssets(cache, core, join(cache, 'nested')), /separate/)
  assert.throws(() => prepareBrowserAssets(cache, core, root), /separate/)
  const moved = join(root, '搬移後 (browser)')
  renameSync(dest, moved)
  assert.deepEqual(verifyBrowserAssets(moved), manifest)
})

for (const corruption of ['modified', 'extra', 'missing', 'manifest']) {
  test('rejects ' + corruption + ' assets', t => {
    const { cache, core, dest } = fixture(t)
    const manifest = prepareBrowserAssets(cache, core, dest)
    const exe = join(dest, manifest.executable)
    if (corruption === 'modified') writeFileSync(exe, 'changed')
    if (corruption === 'extra') writeFileSync(join(dest, 'credentials.txt'), 'unexpected')
    if (corruption === 'missing') rmSync(exe)
    if (corruption === 'manifest') writeFileSync(join(dest, 'BROWSER-ASSETS.json'), JSON.stringify({ ...manifest, executable: '../escape.exe' }))
    assert.throws(() => verifyBrowserAssets(dest), /integrity|manifest/)
  })
}

test('rejects directory junctions without following them', t => {
  const { cache, core, dest } = fixture(t)
  symlinkSync(core, join(cache, 'chromium-123', 'linked'), process.platform === 'win32' ? 'junction' : 'dir')
  assert.throws(() => prepareBrowserAssets(cache, core, dest), /links/)
})