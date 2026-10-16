import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { test } from 'node:test'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import fs from 'node:fs'
import { syncBuiltinESMExports } from 'node:module'
import { fileURLToPath } from 'node:url'
import { applyUpdate, checkUpdate, restoreUpdate } from './portable-update.mjs'

const tools = dirname(fileURLToPath(import.meta.url))
function put(root, path, content) {
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), content)
}
function seal(root) {
  const rows = ['"Path","Length","SHA256"']
  function walk(path = '') {
    for (const entry of readdirSync(join(root, path), { withFileTypes: true })) {
      const file = path ? `${path}/${entry.name}` : entry.name
      if (entry.isDirectory()) walk(file)
      else if (file !== 'SHA256SUMS.csv') {
        const data = readFileSync(join(root, file))
        rows.push(`"${file}","${data.length}","${createHash('sha256').update(data).digest('hex').toUpperCase()}"`)
      }
    }
  }
  walk()
  put(root, 'SHA256SUMS.csv', '\uFEFF' + rows.join('\r\n') + '\r\n')
}
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'dsh-portable-update-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const source = join(root, '新版 clean'), target = join(root, '舊版 used')
  mkdirSync(source); mkdirSync(target)
  for (const [directory, version] of [[source, '0.2.1-alpha.4'], [target, '0.2.1-alpha.3']]) {
    put(directory, 'app/DeepSeek Harness.exe', 'test executable ' + version)
    put(directory, 'BUILD-INFO.json', JSON.stringify({ version, commit: 'a'.repeat(40), dirty: false, unsigned: true }))
    copyFileSync(join(tools, 'Start-DSH.cmd'), join(directory, 'Start-DSH.cmd'))
  }
  for (const name of ['Check-Update.cmd', 'Update-DSH.cmd', 'Restore-DSH.cmd', 'portable-update.mjs']) copyFileSync(join(tools, name), join(source, name))
  put(source, 'README.zh-TW.md', 'test readme')
  put(source, 'POLICY-CHECK.json', JSON.stringify({ version: '0.2.1-alpha.4', checks: {
    offline: true, noMandatoryPolicy: true, noUpdaterYaml: true, policyModules: true, loaderHook: true, bootHook: true,
  } }))
  put(source, 'app/resources/runtime/primary-runtime/runtime.json', JSON.stringify({ desktopVersion: '0.2.1-alpha.4', platform: 'win32', arch: 'x64' }))
  put(target, 'app/obsolete.dll', 'old runtime must not survive')
  put(target, 'data/home/.credentials.yaml', 'test-only-fake-key')
  put(target, 'data/home/profiles/desktop/cordis.patch.yml', 'provider: fake-provider\nmcp: fake-mcp\n')
  put(target, 'data/home/skills/fake/SKILL.md', 'fake skill')
  put(target, 'data/home/sessions/fake.jsonl', 'fake session')
  put(target, 'data/user-data/preferences', 'zh-TW')
  mkdirSync(join(target, 'data/empty-folder'))
  put(target, 'workspace/.agents/skills/project/SKILL.md', 'project skill')
  put(target, 'workspace/document.txt', 'user document')
  put(target, 'custom-mcp/start.cmd', 'external command')
  seal(source)
  return { root, source, target }
}

test('read-only preflight, update and full data recovery keep paths, Skills, MCP and workspace', t => {
  const { source, target } = fixture(t)
  const before = readFileSync(join(target, 'data/home/.credentials.yaml'))
  const plan = checkUpdate(source, target)
  assert.equal(plan.from, '0.2.1-alpha.3')
  assert.equal(plan.to, '0.2.1-alpha.4')
  assert.ok(plan.requiredBytes > 0)
  assert.equal(existsSync(join(target, 'portable-backups')), false)
  const result = applyUpdate(source, target)
  assert.equal(JSON.parse(readFileSync(join(target, 'BUILD-INFO.json'))).version, '0.2.1-alpha.4')
  assert.deepEqual(readFileSync(join(target, 'data/home/.credentials.yaml')), before)
  assert.equal(readFileSync(join(target, 'data/home/skills/fake/SKILL.md'), 'utf8'), 'fake skill')
  assert.match(readFileSync(join(target, 'data/home/profiles/desktop/cordis.patch.yml'), 'utf8'), /fake-mcp/)
  assert.equal(existsSync(join(target, 'data/empty-folder')), true)
  assert.equal(existsSync(join(target, 'app/obsolete.dll')), false)
  assert.equal(existsSync(join(target, '.portable-update.lock')), false)
  assert.equal(existsSync(join(source, 'data')), false)
  put(target, 'data/home/.credentials.yaml', 'new-fake-value')
  put(target, 'data/home/sessions/new.jsonl', 'new session')
  put(target, 'workspace/document.txt', 'new user document')
  const restored = restoreUpdate(target, result.backupId)
  assert.equal(restored.restoredVersion, '0.2.1-alpha.3')
  assert.deepEqual(readFileSync(join(target, 'data/home/.credentials.yaml')), before)
  assert.equal(existsSync(join(target, 'data/home/sessions/new.jsonl')), false)
  assert.equal(readFileSync(join(restored.evidence, 'displaced/data/home/sessions/new.jsonl'), 'utf8'), 'new session')
  assert.equal(readFileSync(join(target, 'workspace/document.txt'), 'utf8'), 'new user document')
  assert.equal(readFileSync(join(target, 'custom-mcp/start.cmd'), 'utf8'), 'external command')
  assert.equal(existsSync(join(target, 'app/obsolete.dll')), true)
  assert.equal(existsSync(join(target, 'Update-DSH.cmd')), false)
  assert.throws(() => restoreUpdate(target, result.backupId), /already been restored/)
})

test('rejects modified payload before touching the target', t => {
  const { source, target } = fixture(t)
  put(source, 'app/DeepSeek Harness.exe', 'tampered')
  assert.throws(() => applyUpdate(source, target), /checksum mismatch/)
  assert.equal(existsSync(join(target, 'portable-backups')), false)
})
test('rejects a used or incomplete source package and unexpected extra files', t => {
  const { source, target } = fixture(t)
  put(source, 'data/home/.credentials.yaml', 'private')
  assert.throws(() => checkUpdate(source, target), /unlisted files/)
  seal(source)
  assert.throws(() => checkUpdate(source, target), /clean extracted release/)
  rmSync(join(source, 'data'), { recursive: true })
  rmSync(join(source, 'Restore-DSH.cmd'))
  seal(source)
  assert.throws(() => checkUpdate(source, target), /Incomplete update package/)
})
test('rejects traversal and duplicate inventory paths', t => {
  const { source, target } = fixture(t)
  put(source, 'SHA256SUMS.csv', '"Path","Length","SHA256"\n"../outside","1","' + 'A'.repeat(64) + '"\n')
  assert.throws(() => checkUpdate(source, target), /Unsafe inventory path/)
  seal(source)
  const csv = readFileSync(join(source, 'SHA256SUMS.csv'), 'utf8')
  put(source, 'SHA256SUMS.csv', csv + csv.split('\r\n')[1] + '\r\n')
  assert.throws(() => checkUpdate(source, target), /Duplicate/)
})
test('rejects invalid policy, runtime, downgrade and same-version reapplication', t => {
  const { source, target } = fixture(t)
  const policy = readFileSync(join(source, 'POLICY-CHECK.json'))
  put(source, 'POLICY-CHECK.json', JSON.stringify({ version: '0.2.1-alpha.4', checks: { offline: false } }))
  seal(source)
  assert.throws(() => checkUpdate(source, target), /offline policy/)
  put(source, 'POLICY-CHECK.json', policy)
  put(source, 'app/resources/runtime/primary-runtime/runtime.json', '{}')
  seal(source)
  assert.throws(() => checkUpdate(source, target), /runtime version/)
  put(source, 'app/resources/runtime/primary-runtime/runtime.json', JSON.stringify({ desktopVersion: '0.2.1-alpha.4', platform: 'win32', arch: 'x64' }))
  seal(source)
  for (const version of ['0.2.1-alpha.4', '0.2.1-alpha.10', '0.2.1', '0.3.0']) {
    put(target, 'BUILD-INFO.json', JSON.stringify({ version, commit: 'b'.repeat(40), dirty: false }))
    assert.throws(() => checkUpdate(source, target), /Only a newer release/)
  }
})
test('rejects nested source, unknown launcher and locked profile', t => {
  const { source, target } = fixture(t)
  assert.throws(() => checkUpdate(source, source), /non-nested/)
  put(target, 'data/home/profiles/desktop/lock', '123')
  assert.throws(() => applyUpdate(source, target), /profile is locked/)
  rmSync(join(target, 'data/home/profiles/desktop/lock'))
  put(target, 'Start-DSH.cmd', 'unknown launcher')
  assert.throws(() => checkUpdate(source, target), /Unsupported launcher/)
})
test('rejects data junctions instead of losing or following external Skills', t => {
  const { source, target, root } = fixture(t)
  mkdirSync(join(root, 'external-skills'))
  symlinkSync(join(root, 'external-skills'), join(target, 'data/linked-skills'), process.platform === 'win32' ? 'junction' : 'dir')
  assert.throws(() => applyUpdate(source, target), /link/)
  assert.equal(existsSync(join(target, 'portable-backups')), false)
})
test('recovery rejects corrupted backup, wrong IDs and unrelated active locks', t => {
  const { source, target } = fixture(t)
  const result = applyUpdate(source, target)
  assert.throws(() => restoreUpdate(target, '../escape'), /Invalid backup ID/)
  put(target, '.portable-update.lock/owner.json', JSON.stringify({ pid: process.pid, backup: 'unrelated' }))
  assert.throws(() => restoreUpdate(target, result.backupId), /unrelated update lock/)
  rmSync(join(target, '.portable-update.lock'), { recursive: true })
  put(target, `portable-backups/${result.backupId}/snapshot/data/home/.credentials.yaml`, 'corrupted')
  assert.throws(() => restoreUpdate(target, result.backupId), /Snapshot verification failed/)
  assert.equal(JSON.parse(readFileSync(join(target, 'BUILD-INFO.json'))).version, '0.2.1-alpha.4')
})
test('recovery handles an interrupted mixed program replacement using its verified snapshot', t => {
  const { source, target } = fixture(t)
  const result = applyUpdate(source, target)
  const backup = join(target, 'portable-backups', result.backupId)
  const journal = JSON.parse(readFileSync(join(backup, 'transaction.json')))
  journal.state = 'applying'
  put(backup, 'transaction.json', JSON.stringify(journal))
  rmSync(join(target, 'app'), { recursive: true })
  put(target, 'Start-DSH.cmd', 'interrupted launcher')
  put(target, 'data/home/sessions/new.jsonl', 'newer data')
  const restored = restoreUpdate(target, result.backupId)
  assert.equal(existsSync(join(target, 'app/obsolete.dll')), true)
  assert.equal(existsSync(join(restored.evidence, 'displaced/data/home/sessions/new.jsonl')), true)
})

test('program replacement failure automatically restores old program without touching personal data', t => {
  const { source, target } = fixture(t)
  const rename = fs.renameSync
  let injected = false
  t.mock.method(fs, 'renameSync', (from, to) => {
    if (!injected && String(from).endsWith(join('stage', 'app')) && to === join(target, 'app')) {
      injected = true
      throw new Error('simulated locked program directory')
    }
    return rename(from, to)
  })
  syncBuiltinESMExports()
  t.after(() => { t.mock.restoreAll(); syncBuiltinESMExports() })
  assert.throws(() => applyUpdate(source, target), /simulated locked program directory/)
  assert.equal(injected, true)
  assert.equal(JSON.parse(readFileSync(join(target, 'BUILD-INFO.json'))).version, '0.2.1-alpha.3')
  assert.equal(existsSync(join(target, 'app/obsolete.dll')), true)
  assert.equal(readFileSync(join(target, 'data/home/.credentials.yaml'), 'utf8'), 'test-only-fake-key')
  assert.equal(existsSync(join(target, '.portable-update.lock')), false)
})

test('failed snapshot leaves original installation unchanged and never starts replacement', t => {
  const { source, target } = fixture(t)
  const copy = fs.copyFileSync
  t.mock.method(fs, 'copyFileSync', (from, to, flags) => {
    if (String(to).includes('snapshot') && String(from).endsWith('.credentials.yaml')) throw new Error('simulated backup write failure')
    return copy(from, to, flags)
  })
  syncBuiltinESMExports()
  t.after(() => { t.mock.restoreAll(); syncBuiltinESMExports() })
  assert.throws(() => applyUpdate(source, target), /simulated backup write failure/)
  assert.equal(existsSync(join(target, 'app/obsolete.dll')), true)
  assert.equal(existsSync(join(target, '.portable-update.lock')), false)
  const [id] = readdirSync(join(target, 'portable-backups'))
  const journal = JSON.parse(readFileSync(join(target, 'portable-backups', id, 'transaction.json')))
  assert.equal(journal.state, 'backing-up')
  assert.equal(restoreUpdate(target, id).restoredVersion, '0.2.1-alpha.3')
})

test('insufficient space aborts before creating a backup or modifying the program', t => {
  const { source, target } = fixture(t)
  t.mock.method(fs, 'statfsSync', () => ({ bavail: 0, bsize: 4096 }))
  syncBuiltinESMExports()
  t.after(() => { t.mock.restoreAll(); syncBuiltinESMExports() })
  assert.throws(() => applyUpdate(source, target), /Insufficient free space/)
  assert.equal(existsSync(join(target, 'portable-backups')), false)
})