import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { prepareBrowserExtension, verifyBrowserExtension } from './browser-extension.mjs'

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'browser extension 中文 & '))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const entry = join(root, 'source', 'node_modules', '@test', 'provider'), dest = join(root, 'payload')
  function pkg(directory, name, extras = {}) {
    mkdirSync(join(directory, 'lib'), { recursive: true })
    writeFileSync(join(directory, 'package.json'), JSON.stringify({ name, version: '1.0.0', main: 'lib/index.js', files: ['lib'], license: 'MIT', ...extras }))
    writeFileSync(join(directory, 'lib', 'index.js'), 'export const test = true\n')
    writeFileSync(join(directory, 'LICENSE'), 'fixture license')
    writeFileSync(join(directory, 'secret.txt'), 'must not ship')
  }
  pkg(entry, '@test/provider', { dependencies: { server: '1.0.0' }, peerDependencies: { host: '1.0.0' } })
  pkg(join(root, 'source', 'node_modules', 'server'), 'server')
  pkg(join(root, 'source', 'node_modules', 'host'), 'host')
  return { root, entry, dest, pkg }
}

test('copies published closure and licenses, excludes host peers, secrets and absolute source paths, and relocates', t => {
  const { root, entry, dest } = fixture(t)
  const manifest = prepareBrowserExtension(entry, dest, { host: '1.0.0' })
  assert.deepEqual(manifest.packages.map(pkg => pkg.name), ['@test/provider', 'server'])
  assert.deepEqual(manifest.hostPackages, { host: '1.0.0' })
  assert.equal(manifest.files.length, 6)
  assert.equal(readFileSync(join(dest, 'BROWSER-EXTENSION.json'), 'utf8').includes(root), false)
  assert.throws(() => prepareBrowserExtension(entry, dest, { host: '1.0.0' }), /overwrite/)
  const moved = join(root, '搬移後 (payload)')
  renameSync(dest, moved)
  assert.deepEqual(verifyBrowserExtension(moved), manifest)
})

test('rejects unsupplied peers and host version mismatches before writing', t => {
  const { root, entry, dest } = fixture(t)
  assert.throws(() => prepareBrowserExtension(entry, dest, {}), /Peer must/)
  assert.throws(() => prepareBrowserExtension(entry, dest, { host: '2.0.0' }), /version mismatch/)
  assert.equal(readdirSync(root).includes('payload'), false)
})

test('rejects missing dependencies and unbuilt entries', t => {
  const { root, entry, dest } = fixture(t)
  rmSync(join(root, 'source', 'node_modules', 'server'), { recursive: true })
  assert.throws(() => prepareBrowserExtension(entry, dest, { host: '1.0.0' }), /Missing extension dependency/)
  rmSync(join(entry, 'lib', 'index.js'))
  assert.throws(() => prepareBrowserExtension(entry, dest, { host: '1.0.0' }), /build package/)
})

test('rejects duplicate dependency resolutions instead of silently flattening incompatible trees', t => {
  const { root, entry, dest, pkg } = fixture(t)
  const server = join(root, 'source', 'node_modules', 'server')
  pkg(server, 'server', { dependencies: { '@test/provider': '1.0.0' } })
  pkg(join(server, 'node_modules', '@test', 'provider'), '@test/provider')
  assert.throws(() => prepareBrowserExtension(entry, dest, { host: '1.0.0' }), /Conflicting flat/)
})

test('supports already-installed registry packages without files or main via default exports', t => {
  const { root, entry, dest, pkg } = fixture(t)
  const registry = join(root, '.pnpm', 'server@1.0.0', 'node_modules', 'server')
  pkg(registry, 'server', { files: undefined, main: undefined, exports: { '.': { default: './lib/index.js' } } })
  const original = join(root, 'source', 'node_modules', 'server')
  rmSync(original, { recursive: true })
  symlinkSync(registry, original, process.platform === 'win32' ? 'junction' : 'dir')
  const manifest = prepareBrowserExtension(entry, dest, { host: '1.0.0' })
  assert.equal(manifest.packages.length, 2)
  assert.equal(manifest.files.some(file => file.path === 'node_modules/server/lib/index.js'), true)
})

test('rejects extra files, modified content, and junctions in sealed payload', t => {
  const { entry, dest } = fixture(t)
  prepareBrowserExtension(entry, dest, { host: '1.0.0' })
  writeFileSync(join(dest, 'unexpected.txt'), 'unexpected')
  assert.throws(() => verifyBrowserExtension(dest), /integrity/)
  rmSync(join(dest, 'unexpected.txt'))
  symlinkSync(entry, join(dest, 'linked'), process.platform === 'win32' ? 'junction' : 'dir')
  assert.throws(() => verifyBrowserExtension(dest), /links/)
  rmSync(join(dest, 'linked'), { recursive: true })
  writeFileSync(join(dest, 'node_modules', 'server', 'lib', 'index.js'), 'changed')
  assert.throws(() => verifyBrowserExtension(dest), /integrity/)
})