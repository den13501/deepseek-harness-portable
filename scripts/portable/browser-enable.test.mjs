import assert from 'node:assert/strict'
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { prepareBrowserExtension } from './browser-extension.mjs'
import { deployBrowserExtension, disableBrowserExtension, enableBrowserExtension, verifyPortableRuntime } from './browser-enable.mjs'

const CURRENT = '0.2.1-rc.3'
const PREVIOUS = '0.2.1-rc.2'
const readJson = file => JSON.parse(readFileSync(file, 'utf8').replace(/^\uFEFF/, ''))

function fixture(t, cordisVersion = '4.0.5', VERSION = CURRENT) {
  const root = mkdtempSync(join(tmpdir(), 'browser enable 中文 & '))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const entry = join(root, 'source', 'node_modules', '@deepseek-ai', 'dsh-experimental-browser-use-playwright-mcp')
  const dest = join(root, 'payload')
  function pkg(directory, name, extras = {}) {
    mkdirSync(join(directory, 'lib'), { recursive: true })
    writeFileSync(join(directory, 'package.json'), JSON.stringify({ name, version: VERSION, main: 'lib/index.js', files: ['lib'], license: 'MIT', ...extras }))
    writeFileSync(join(directory, 'lib', 'index.js'), 'export const test = true\n')
  }
  pkg(entry, '@deepseek-ai/dsh-experimental-browser-use-playwright-mcp', {
    dependencies: { '@deepseek-ai/dsh-experimental-browser-use-runtime': VERSION },
    peerDependencies: { '@deepseek-ai/cordis': '^4.0.0' },
  })
  pkg(join(root, 'source', 'node_modules', '@deepseek-ai', 'dsh-experimental-browser-use-runtime'), '@deepseek-ai/dsh-experimental-browser-use-runtime')
  pkg(join(root, 'source', 'node_modules', '@deepseek-ai', 'cordis'), '@deepseek-ai/cordis', { version: cordisVersion })
  const runtimeJson = join(root, 'app', 'resources', 'runtime', 'primary-runtime', 'runtime.json')
  mkdirSync(join(runtimeJson, '..'), { recursive: true })
  writeFileSync(runtimeJson, JSON.stringify({ desktopVersion: VERSION, platform: 'win32', arch: 'x64' }))
  const profile = join(root, 'data', 'home', 'profiles', 'desktop')
  mkdirSync(profile, { recursive: true })
  const userLayer = '- insert:\n    - id: keep\n      name: keep\n'
  writeFileSync(join(profile, 'package.json'), JSON.stringify({ name: 'desktop', version: VERSION }))
  writeFileSync(join(profile, 'cordis.patch.yml'), userLayer)
  const runtime = () => ({
    providerConfig: {
      mode: 'launch',
      executablePath: join(root, 'chrome.exe'),
      outputDir: join(root, 'data', 'browser', 'output'),
      tempDir: join(root, 'data', 'browser', 'temp'),
    },
  })
  prepareBrowserExtension(entry, dest, { '@deepseek-ai/cordis': cordisVersion })
  return { root, entry, dest, profile, userLayer, runtime, runtimeJson, VERSION }
}
const VERSION = CURRENT

/** An older release with the browser enabled, whose program was then updated to `next` with a matching payload. */
function upgraded(t) {
  const old = fixture(t, '4.0.5', PREVIOUS)
  deployBrowserExtension(old.root, old.dest)
  enableBrowserExtension(old.root, old.runtime())
  const next = fixture(t, '4.0.5', CURRENT)
  writeFileSync(old.runtimeJson, JSON.stringify({ desktopVersion: CURRENT, platform: 'win32', arch: 'x64' }))
  return { ...old, nextPayload: next.dest }
}
const browserDir = root => join(root, 'data', 'browser')
const leftovers = root => readdirSync(browserDir(root)).filter(name => name.startsWith('.extension-'))

function deployed(t) {
  const x = fixture(t)
  deployBrowserExtension(x.root, x.dest)
  return x
}

test('deploys the verified payload and refuses version or payload mismatches', t => {
  const x = deployed(t)
  assert.deepEqual(readJson(join(x.root, 'data', 'browser', 'extension', 'BROWSER-EXTENSION.json')).packages.map(p => p.name),
    ['@deepseek-ai/dsh-experimental-browser-use-playwright-mcp', '@deepseek-ai/dsh-experimental-browser-use-runtime'])
  deployBrowserExtension(x.root, x.dest)
  const other = fixture(t, '4.0.6')
  assert.throws(() => deployBrowserExtension(x.root, other.dest), /already deployed/)
  const bad = fixture(t)
  const runtimeJson = join(bad.root, 'app', 'resources', 'runtime', 'primary-runtime', 'runtime.json')
  writeFileSync(runtimeJson, JSON.stringify({ desktopVersion: '9.9.9', platform: 'win32', arch: 'x64' }))
  assert.throws(() => deployBrowserExtension(bad.root, bad.dest), /does not match packaged desktop/)
  writeFileSync(runtimeJson, JSON.stringify({ desktopVersion: VERSION, platform: 'linux', arch: 'x64' }))
  assert.throws(() => verifyPortableRuntime(bad.root), /Windows x64/)
})

test('enables additively, is idempotent, updates the block on re-enable, and disables cleanly', t => {
  const x = deployed(t)
  const patchFile = join(x.profile, 'cordis.patch.yml')
  const manifestFile = join(x.profile, 'package.json')
  enableBrowserExtension(x.root, x.runtime())
  const manifest = readJson(manifestFile)
  assert.equal(manifest.dependencies['@deepseek-ai/dsh-experimental-browser-use-playwright-mcp'], VERSION)
  const installed = join(x.profile, 'node_modules', '@deepseek-ai', 'dsh-experimental-browser-use-playwright-mcp')
  assert.equal(lstatSync(installed).isSymbolicLink(), false)
  assert.equal(readFileSync(join(installed, 'lib', 'index.js'), 'utf8'), readFileSync(join(x.root, 'data', 'browser', 'extension', 'node_modules', '@deepseek-ai', 'dsh-experimental-browser-use-playwright-mcp', 'lib', 'index.js'), 'utf8'))
  const first = readFileSync(patchFile, 'utf8')
  assert.match(first, /# dsh-portable-browser begin/)
  assert.match(first, /dsh-experimental-browser-use-playwright-mcp/)
  // 0.2.2 registers both rows under ids inferred from their names unless an id is stated, and the Loader then
  // reports a duplicate browserUse service; each managed row must carry its own explicit id.
  assert.match(first, /- id: 'portable-browser-use'\n\s+name: '@deepseek-ai\/dsh-browser-use'/)
  assert.match(first, /- id: 'portable-browser-use-playwright-mcp'\n\s+name: '@deepseek-ai\/dsh-experimental-browser-use-playwright-mcp'/)
  assert.ok(first.includes(x.userLayer))
  enableBrowserExtension(x.root, x.runtime())
  assert.equal(readFileSync(patchFile, 'utf8'), first)
  const moved = { providerConfig: { ...x.runtime().providerConfig, executablePath: join(x.root, 'elsewhere', 'chrome.exe') } }
  enableBrowserExtension(x.root, moved)
  const updated = readFileSync(patchFile, 'utf8')
  assert.match(updated, /elsewhere/)
  assert.equal(updated.match(/# dsh-portable-browser begin/g).length, 1)
  assert.ok(updated.includes(x.userLayer))
  assert.ok(existsSync(join(x.root, 'data', 'browser', 'enable.json')))
  disableBrowserExtension(x.root)
  assert.equal(readJson(manifestFile).dependencies, undefined)
  assert.equal(existsSync(installed), false)
  assert.equal(readFileSync(patchFile, 'utf8'), x.userLayer)
  assert.equal(existsSync(join(x.root, 'data', 'browser', 'enable.json')), false)
  assert.ok(existsSync(join(x.root, 'data', 'browser', 'extension')), 'payload survives disable')
  enableBrowserExtension(x.root, x.runtime())
  assert.ok(existsSync(installed))
})

test('enable refuses a missing profile, foreign node_modules entries, and conflicting dependencies', t => {
  const x = fixture(t)
  const bare = mkdtempSync(join(tmpdir(), 'browser bare '))
  t.after(() => rmSync(bare, { recursive: true, force: true }))
  const bareRuntimeJson = join(bare, 'app', 'resources', 'runtime', 'primary-runtime', 'runtime.json')
  mkdirSync(join(bareRuntimeJson, '..'), { recursive: true })
  writeFileSync(bareRuntimeJson, JSON.stringify({ desktopVersion: VERSION, platform: 'win32', arch: 'x64' }))
  assert.throws(() => enableBrowserExtension(bare, x.runtime()), /start DSH once/)
  deployBrowserExtension(x.root, x.dest)
  mkdirSync(join(x.profile, 'node_modules', '@deepseek-ai'), { recursive: true })
  writeFileSync(join(x.profile, 'node_modules', '@deepseek-ai', 'dsh-experimental-browser-use-playwright-mcp'), 'foreign')
  assert.throws(() => enableBrowserExtension(x.root, x.runtime()), /not a real directory/)
  rmSync(join(x.profile, 'node_modules', '@deepseek-ai', 'dsh-experimental-browser-use-playwright-mcp'))
  const manifestFile = join(x.profile, 'package.json')
  const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'))
  manifest.dependencies = { '@deepseek-ai/dsh-experimental-browser-use-playwright-mcp': '0.0.1' }
  writeFileSync(manifestFile, JSON.stringify(manifest))
  assert.throws(() => enableBrowserExtension(x.root, x.runtime()), /already depends/)
})

test('upgrade: deploying a newer payload retires the older enablement, then enable succeeds without leftovers', t => {
  const x = upgraded(t)
  const manifestFile = join(x.profile, 'package.json')
  const installed = join(x.profile, 'node_modules', '@deepseek-ai', 'dsh-experimental-browser-use-playwright-mcp')
  assert.equal(readJson(join(browserDir(x.root), 'enable.json')).desktopVersion, PREVIOUS)
  assert.throws(() => enableBrowserExtension(x.root, x.runtime()), /does not match|already depends|differs/, 'enable alone keeps refusing the stale profile')
  deployBrowserExtension(x.root, x.nextPayload)
  assert.equal(existsSync(join(browserDir(x.root), 'enable.json')), false, 'old receipt retired')
  assert.equal(readJson(manifestFile).dependencies, undefined, 'old dependency rows removed')
  enableBrowserExtension(x.root, x.runtime())
  const receipt = readJson(join(browserDir(x.root), 'enable.json'))
  assert.equal(receipt.desktopVersion, CURRENT)
  assert.equal(readJson(manifestFile).dependencies['@deepseek-ai/dsh-experimental-browser-use-playwright-mcp'], CURRENT)
  assert.equal(readJson(join(installed, 'package.json')).version, CURRENT)
  const patch = readFileSync(join(x.profile, 'cordis.patch.yml'), 'utf8')
  assert.equal(patch.match(/# dsh-portable-browser begin/g).length, 1)
  assert.ok(patch.includes(x.userLayer))
  assert.deepEqual(leftovers(x.root), [])
  deployBrowserExtension(x.root, x.nextPayload)
  assert.equal(readJson(join(browserDir(x.root), 'enable.json')).desktopVersion, CURRENT, 'same-release redeploy keeps the enablement')
})

test('upgrade: modified owned packages, dependency rows or payload refuse before any change', t => {
  for (const tamper of [
    x => writeFileSync(join(x.profile, 'node_modules', '@deepseek-ai', 'dsh-experimental-browser-use-runtime', 'lib', 'index.js'), 'edited\n'),
    x => {
      const file = join(x.profile, 'package.json')
      const manifest = readJson(file)
      manifest.dependencies['@deepseek-ai/dsh-experimental-browser-use-runtime'] = '9.9.9'
      writeFileSync(file, JSON.stringify(manifest))
    },
    x => writeFileSync(join(browserDir(x.root), 'extension', 'node_modules', '@deepseek-ai', 'dsh-experimental-browser-use-runtime', 'lib', 'index.js'), 'edited\n'),
  ]) {
    const x = upgraded(t)
    tamper(x)
    const before = ['package.json', 'cordis.patch.yml'].map(name => readFileSync(join(x.profile, name), 'utf8'))
    const receipt = readFileSync(join(browserDir(x.root), 'enable.json'), 'utf8')
    assert.throws(() => deployBrowserExtension(x.root, x.nextPayload), /changed after browser enablement|no longer matches/)
    assert.deepEqual(['package.json', 'cordis.patch.yml'].map(name => readFileSync(join(x.profile, name), 'utf8')), before)
    assert.equal(readFileSync(join(browserDir(x.root), 'enable.json'), 'utf8'), receipt)
    assert.deepEqual(leftovers(x.root), [])
  }
})

test('upgrade: a payload for the wrong release changes nothing', t => {
  const x = upgraded(t)
  const receipt = readFileSync(join(browserDir(x.root), 'enable.json'), 'utf8')
  const stale = fixture(t, '4.0.5', PREVIOUS)
  assert.throws(() => deployBrowserExtension(x.root, stale.dest), /does not match packaged desktop/)
  assert.equal(readFileSync(join(browserDir(x.root), 'enable.json'), 'utf8'), receipt)
  assert.ok(existsSync(join(x.profile, 'node_modules', '@deepseek-ai', 'dsh-experimental-browser-use-playwright-mcp')))
})