/** Offline, same-directory portable upgrades with verified local recovery snapshots. */
import { createHash, randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  constants, copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync,
  realpathSync, renameSync, rmSync, statfsSync, writeFileSync,
} from 'node:fs'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createInterface } from 'node:readline/promises'

const required = ['app', 'Start-DSH.cmd', 'Check-Update.cmd', 'Update-DSH.cmd', 'Restore-DSH.cmd', 'portable-update.mjs', 'README.zh-TW.md', 'BUILD-INFO.json', 'POLICY-CHECK.json', 'SHA256SUMS.csv']
const browserTools = ['Enable-Browser.cmd', 'Disable-Browser.cmd', 'browser-enable.mjs', 'browser-runtime.mjs', 'browser-extension.mjs', 'browser-assets.mjs']
const managed = [...required, ...browserTools]
const lockName = '.portable-update.lock'
const recoveryName = 'portable-backups'
const digest = file => createHash('sha256').update(readFileSync(file)).digest('hex').toUpperCase()
const fail = message => { throw new Error(message) }
function json(file) { return JSON.parse(readFileSync(file, 'utf8').replace(/^\uFEFF/, '')) }
function save(file, value) {
  const temporary = `${file}.${randomUUID()}.tmp`
  writeFileSync(temporary, JSON.stringify(value, null, 2) + '\n', { mode: 0o600, flag: 'wx' })
  renameSync(temporary, file)
}
function plainDirectory(path) {
  const stat = lstatSync(path)
  if (!stat.isDirectory() || stat.isSymbolicLink()) fail('Expected a real directory, not a link: ' + path)
  return realpathSync(path)
}
function contained(parent, child) {
  const value = relative(parent, child)
  return value === '' || (!isAbsolute(value) && value !== '..' && !value.startsWith('..' + sep))
}
function inventory(root, prefix = '') {
  return readdirSync(join(root, prefix), { withFileTypes: true }).flatMap(entry => {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name
    const file = join(root, path)
    if (entry.isSymbolicLink()) fail('Cannot safely snapshot a link; no links are followed: ' + file)
    if (entry.isDirectory()) return [{ path, directory: true }, ...inventory(root, path)]
    if (!entry.isFile()) fail('Unsupported filesystem entry: ' + file)
    return [{ path, bytes: lstatSync(file).size, sha256: digest(file) }]
  }).sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0)
}
function snapshot(root, names) {
  return names.filter(name => existsSync(join(root, name))).map(name => {
    const path = join(root, name)
    const stat = lstatSync(path)
    if (stat.isSymbolicLink()) fail('Cannot snapshot a linked root: ' + path)
    return stat.isDirectory()
      ? { name, directory: true, entries: inventory(path) }
      : { name, directory: false, bytes: stat.size, sha256: digest(path) }
  })
}
function verifySnapshot(root, expected) {
  if (JSON.stringify(snapshot(root, expected.map(entry => entry.name))) !== JSON.stringify(expected)) {
    fail('Snapshot verification failed; do not discard the backup: ' + root)
  }
}
function sizeOf(entries) {
  return entries.reduce((total, entry) => total + (entry.directory
    ? entry.entries.reduce((bytes, file) => bytes + (file.bytes ?? 0), 0) : entry.bytes), 0)
}
function copyNames(source, destination, names) {
  for (const name of names) {
    if (!existsSync(join(source, name))) continue
    const from = join(source, name), to = join(destination, name)
    const stat = lstatSync(from)
    if (stat.isSymbolicLink()) fail('Cannot copy a linked entry: ' + from)
    if (stat.isDirectory()) {
      mkdirSync(to)
      copyNames(from, to, readdirSync(from))
    } else if (stat.isFile()) copyFileSync(from, to, constants.COPYFILE_EXCL)
    else fail('Unsupported copy entry: ' + from)
  }
}
function releaseInfo(root) {
  const info = json(join(root, 'BUILD-INFO.json'))
  if (!/^[a-f0-9]{40}$/i.test(info.commit) || typeof info.dirty !== 'boolean') fail('Invalid build metadata')
  const identity = releaseIdentity(info)
  return { ...info, ...identity }
}
function releaseIdentity(info) {
  versionParts(info.version)
  const revision = info.portableRevision ?? 0
  if (!Number.isSafeInteger(revision) || revision < 0) fail('Invalid portable revision')
  return { version: info.version, portableRevision: revision, label: `${info.version}+portable.${revision}` }
}
function versionParts(version) {
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z.-]+))?$/.exec(version)
  if (!match || (match[4] && match[4].split('.').some(value => value === '' || /^0\d+$/.test(value)))) fail('Unsupported release version')
  return { core: match.slice(1, 4).map(BigInt), pre: match[4]?.split('.') }
}
function compareVersions(left, right) {
  const a = versionParts(left), b = versionParts(right)
  for (let index = 0; index < 3; index++) if (a.core[index] !== b.core[index]) return a.core[index] > b.core[index] ? 1 : -1
  if (!a.pre || !b.pre) return a.pre ? -1 : b.pre ? 1 : 0
  for (let index = 0; index < Math.max(a.pre.length, b.pre.length); index++) {
    const x = a.pre[index], y = b.pre[index]
    if (x === y) continue
    if (x === undefined || y === undefined) return x === undefined ? -1 : 1
    const xn = /^\d+$/.test(x), yn = /^\d+$/.test(y)
    if (xn && yn) return BigInt(x) > BigInt(y) ? 1 : -1
    if (xn !== yn) return xn ? -1 : 1
    return x > y ? 1 : -1
  }
  return 0
}
function compareReleases(left, right) {
  const versions = compareVersions(left.version, right.version)
  return versions || (left.portableRevision > right.portableRevision ? 1 : left.portableRevision < right.portableRevision ? -1 : 0)
}
function packageInventory(root) {
  const rows = readFileSync(join(root, 'SHA256SUMS.csv'), 'utf8').replace(/^\uFEFF/, '').trimEnd().split(/\r?\n/)
  if (rows.shift() !== '"Path","Length","SHA256"') fail('Invalid package inventory header')
  const seen = new Set()
  for (const row of rows) {
    const match = /^"((?:[^"]|"")*)","(\d+)","([A-F0-9]{64})"$/.exec(row)
    if (!match) fail('Invalid package inventory row')
    const path = match[1].replaceAll('""', '"')
    if (path.split('/').some(part => !part || part === '.' || part === '..' || /[\\:<>"|?*\x00-\x1f]/.test(part) || /[ .]$/.test(part))) fail('Unsafe inventory path')
    if (seen.has(path.toLowerCase()) || path.toLowerCase() === 'sha256sums.csv') fail('Duplicate or self-referencing inventory path')
    seen.add(path.toLowerCase())
    const file = join(root, path)
    if (!contained(root, file) || !existsSync(file) || !lstatSync(file).isFile() || lstatSync(file).isSymbolicLink()
      || lstatSync(file).size !== Number(match[2]) || digest(file) !== match[3]) fail('Package checksum mismatch: ' + path)
  }
  const actual = inventory(root).filter(entry => !entry.directory && entry.path !== 'SHA256SUMS.csv')
  if (actual.length !== seen.size || actual.some(entry => !seen.has(entry.path.toLowerCase()))) fail('Package contains unlisted files')
  if (readdirSync(root).some(name => !managed.includes(name))) fail('Use a clean extracted release, without data, workspace, or extra files')
  const browserEnabled = existsSync(join(root, 'app/browser/assets/BROWSER-ASSETS.json'))
  for (const name of [...required, ...(browserEnabled ? browserTools : [])]) if (!existsSync(join(root, name))) fail('Incomplete update package: ' + name)
  const info = releaseInfo(root)
  const policy = json(join(root, 'POLICY-CHECK.json'))
  const checks = ['offline', 'noMandatoryPolicy', 'noUpdaterYaml', 'policyModules', 'loaderHook', 'bootHook']
  if (policy.version !== info.version || checks.some(name => policy.checks?.[name] !== true)
    || existsSync(join(root, 'app/resources/app-update.yml'))) fail('Package offline policy verification failed')
  const runtime = json(join(root, 'app/resources/runtime/primary-runtime/runtime.json'))
  if (runtime.desktopVersion !== info.version || runtime.platform !== 'win32' || runtime.arch !== 'x64') fail('Package runtime version or target mismatch')
  return info
}
function assertStopped(target) {
  if (existsSync(join(target, 'data/home/profiles/desktop/lock'))) fail('Desktop profile is locked. Close DSH; investigate stale locks without deleting them blindly.')
  if (process.platform !== 'win32') return
  const command = "$ErrorActionPreference='Stop'; $p=@(Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'DeepSeek Harness.exe' -or ($_.Name -eq 'node.exe' -and $_.CommandLine -match 'dsh-desktop-host') }); $p.Count"
  const count = execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', command], { encoding: 'utf8', windowsHide: true, timeout: 15000 }).trim()
  if (!/^\d+$/.test(count) || Number(count) !== 0) fail('Close all DSH windows and Desktop Host processes before updating or restoring')
}
function assertLauncher(target) {
  const text = readFileSync(join(target, 'Start-DSH.cmd'), 'utf8')
  if (!text.includes('DSH_HOME=%ROOT%data\\home') || !text.includes('DSH_DESKTOP_USER_DATA_DIR=%ROOT%data\\user-data')) fail('Unsupported launcher; refusing to guess where personal data is stored')
  if (!lstatSync(join(target, 'app/DeepSeek Harness.exe')).isFile()) fail('Not a portable installation')
}
function inspect(sourcePath, targetPath, allowLock = false) {
  const source = plainDirectory(sourcePath), target = plainDirectory(targetPath)
  if (contained(source, target) || contained(target, source)) fail('Source and target must be separate, non-nested directories')
  if (!allowLock && existsSync(join(target, lockName))) fail('An update is active or interrupted. Use Restore-DSH.cmd with its recorded backup ID.')
  assertLauncher(target)
  assertStopped(target)
  const next = packageInventory(source), current = releaseInfo(target)
  if (compareReleases(next, current) <= 0) fail('Only a newer release can be applied; use a recovery snapshot for rollback')
  const data = snapshot(target, ['data'])
  const previous = snapshot(target, managed)
  const payload = snapshot(source, managed)
  const requiredBytes = sizeOf(previous) + sizeOf(data) + sizeOf(payload) + 64 * 1024 * 1024
  const disk = statfsSync(target)
  if (disk.bavail * disk.bsize < requiredBytes) fail('Insufficient free space for verified program staging and a complete data snapshot')
  return { source, target, current, next, previous, data, payload, requiredBytes }
}
function privateDirectory(path) {
  mkdirSync(path, { mode: 0o700 })
  if (process.platform === 'win32') {
    const user = execFileSync('whoami.exe', ['/user', '/fo', 'csv', '/nh'], { encoding: 'utf8', windowsHide: true }).match(/S-1-5-[\d-]+/)
    if (!user) fail('Cannot identify the Windows user for private recovery backups')
    execFileSync('icacls.exe', [path, '/inheritance:r', '/grant:r', `*${user[0]}:(OI)(CI)F`, '*S-1-5-18:(OI)(CI)F'], { stdio: 'pipe', windowsHide: true })
  }
}
function acquire(target, backup, action, recovering = false) {
  const path = join(target, lockName)
  if (existsSync(path)) {
    plainDirectory(path)
    const owner = json(join(path, 'owner.json'))
    if (!recovering || owner.backup !== backup || !Number.isInteger(owner.pid) || owner.pid < 1) fail('An unrelated update lock exists')
    let running = true
    try { process.kill(owner.pid, 0) } catch (error) {
      if (error.code !== 'ESRCH') throw error
      running = false
    }
    if (running) fail('The recorded update process is still running; wait for it to finish')
    rmSync(path, { recursive: true })
  }
  mkdirSync(path)
  save(join(path, 'owner.json'), { pid: process.pid, backup, action })
  return () => rmSync(path, { recursive: true })
}
function backupPath(target, id) {
  if (!/^[0-9T.Z-]+-[a-f0-9-]{36}$/.test(id)) fail('Invalid backup ID')
  const parent = plainDirectory(join(target, recoveryName))
  const result = plainDirectory(join(parent, id))
  if (!contained(parent, result)) fail('Recovery path escapes the backup directory')
  return result
}
function recoveryRecord(target, id) {
  const backup = backupPath(target, id)
  const journal = json(join(backup, 'transaction.json'))
  if (journal.target !== target) fail('Recovery target moved. Restore the original directory path recorded for this backup; do not edit the transaction journal.')
  if (journal.format !== 1 || journal.id !== id
    || !['backing-up', 'prepared', 'applying', 'applied', 'failed', 'restoring', 'restored'].includes(journal.state)
    || !Array.isArray(journal.previous) || !Array.isArray(journal.data)
    || journal.previous.some(entry => !managed.includes(entry.name)) || journal.data.some(entry => entry.name !== 'data')) fail('Invalid recovery journal')
  for (const group of [journal.previous, journal.data]) {
    for (const entry of group) {
      for (const file of entry.entries ?? []) {
        if (!file.path || isAbsolute(file.path) || file.path.split(/[\\/]/).some(part => !part || part === '.' || part === '..' || part.includes(':'))) fail('Unsafe recovery inventory path')
      }
    }
  }
  verifySnapshot(journal.state === 'backing-up' ? target : join(backup, 'snapshot'), [...journal.previous, ...journal.data])
  return { backup, journal }
}
function restoreFiles(target, backup, journal, includeData) {
  const attempt = join(backup, 'recovery-' + randomUUID())
  mkdirSync(attempt)
  const stage = join(attempt, 'stage'), displaced = join(attempt, 'displaced')
  mkdirSync(stage); mkdirSync(displaced)
  const expected = [...journal.previous, ...(includeData ? journal.data : [])]
  copyNames(join(backup, 'snapshot'), stage, expected.map(entry => entry.name))
  verifySnapshot(stage, expected)
  const names = [...new Set([...managed, ...expected.map(entry => entry.name), ...(includeData ? ['data'] : [])])]
  for (const name of names) {
    if (existsSync(join(target, name))) renameSync(join(target, name), join(displaced, name))
    if (existsSync(join(stage, name))) renameSync(join(stage, name), join(target, name))
  }
  verifySnapshot(target, expected)
  return attempt
}

/**
 * Validate an extracted new release and a stopped, older portable without writing either.
 * @param source - Clean extracted release directory.
 * @param target - Existing portable root, kept at its original path.
 * @returns Version, space, preservation, and external-path notices without credential contents.
 */
export function checkUpdate(source, target) {
  const plan = inspect(source, target)
  return {
    from: plan.current.label, to: plan.next.label, requiredBytes: plan.requiredBytes,
    target: plan.target, preserved: ['data', 'workspace', 'other unmanaged root entries'],
    notices: ['External Skills, MCP commands, and workspace paths are not moved or rewritten.',
      'No plugins or MCP dependencies are downloaded. Compatibility still requires a post-upgrade check.',
      'Browser remains opt-in. Existing browser state is preserved only when it contains no links.',
      'Backups contain credentials and chats. Keep them private; never redistribute the used portable.'],
  }
}

/**
 * Apply a newer release after a complete verified snapshot; leave data and workspace in place.
 * Failed program replacement attempts automatic program recovery and retains all evidence.
 * @param source - Trusted, clean extracted release directory.
 * @param target - Stopped existing portable root.
 * @returns Backup ID required for explicit recovery, including pre-upgrade data recovery.
 */
export function applyUpdate(source, target) {
  const plan = inspect(source, target)
  const id = new Date().toISOString().replaceAll(':', '-') + '-' + randomUUID()
  const parent = join(plan.target, recoveryName)
  if (!existsSync(parent)) privateDirectory(parent)
  plainDirectory(parent)
  const backup = join(parent, id)
  const unlock = acquire(plan.target, backup, 'update')
  let journal
  let safeToUnlock = true
  try {
    privateDirectory(backup)
    console.log('Private recovery backup ID: ' + id)
    journal = { format: 1, id, target: plan.target, from: plan.current.label, to: plan.next.label,
      previous: plan.previous, data: plan.data, state: 'backing-up' }
    save(join(backup, 'transaction.json'), journal)
    const saved = join(backup, 'snapshot'), stage = join(backup, 'stage'), displaced = join(backup, 'displaced')
    mkdirSync(saved); mkdirSync(stage); mkdirSync(displaced)
    copyNames(plan.target, saved, [...plan.previous, ...plan.data].map(entry => entry.name))
    verifySnapshot(saved, [...plan.previous, ...plan.data])
    copyNames(plan.source, stage, managed)
    verifySnapshot(stage, plan.payload)
    assertStopped(plan.target)
    verifySnapshot(plan.target, [...plan.previous, ...plan.data])
    journal.state = 'prepared'
    save(join(backup, 'transaction.json'), journal)
    journal.state = 'applying'; save(join(backup, 'transaction.json'), journal)
    safeToUnlock = false
    for (const name of managed) {
      if (existsSync(join(plan.target, name))) renameSync(join(plan.target, name), join(displaced, name))
      renameSync(join(stage, name), join(plan.target, name))
    }
    verifySnapshot(plan.target, plan.payload)
    verifySnapshot(plan.target, plan.data)
    journal.state = 'applied'; save(join(backup, 'transaction.json'), journal)
    safeToUnlock = true
    return { backupId: id, from: plan.current.label, to: plan.next.label, target: plan.target }
  } catch (error) {
    if (journal && !safeToUnlock) {
      try {
        restoreFiles(plan.target, backup, journal, false)
        journal.state = 'failed'; save(join(backup, 'transaction.json'), journal)
        safeToUnlock = true
      } catch (recoveryError) {
        throw new AggregateError([error, recoveryError], `Update and recovery failed. Keep DSH closed. Run Restore-DSH.cmd using backup ID ${id}`)
      }
    }
    throw new Error(`Update stopped. Backup ID: ${id}. ${error.message}`, { cause: error })
  } finally { if (safeToUnlock) unlock() }
}

/**
 * Restore both program and pre-upgrade data; preserve displaced newer data for manual retrieval.
 * Workspace and unmanaged external files are never rolled back. Interrupted restores can be retried.
 * @param targetPath - Original portable root; moving it invalidates recovery ownership.
 * @param id - Backup ID printed by the updater.
 * @returns Recovery evidence path; its displaced directory can contain newer private data.
 */
export function restoreUpdate(targetPath, id) {
  const target = plainDirectory(targetPath)
  assertStopped(target)
  const { backup, journal } = recoveryRecord(target, id)
  if (journal.state === 'restored') fail('This backup has already been restored')
  const unlock = acquire(target, backup, 'restore', true)
  let complete = false
  try {
    if (journal.state === 'backing-up') {
      journal.state = 'restored'; save(join(backup, 'transaction.json'), journal)
      complete = true
      return { restoredVersion: journal.from, target, evidence: backup, workspace: 'unchanged', outcome: 'Incomplete backup cancelled; verified original installation unchanged' }
    }
    journal.state = 'restoring'; save(join(backup, 'transaction.json'), journal)
    const evidence = restoreFiles(target, backup, journal, true)
    journal.state = 'restored'; save(join(backup, 'transaction.json'), journal)
    complete = true
    return { restoredVersion: journal.from, target, evidence, workspace: 'unchanged' }
  } finally { if (complete) unlock() }
}

async function main() {
  if (process.platform !== 'win32') fail('Portable update commands require Windows')
  const args = process.argv.slice(2), action = args.shift()
  if (!['check', 'update', 'restore'].includes(action)) fail('Usage: portable-update.mjs check|update|restore [--target DIRECTORY] [--backup ID]')
  const options = {}
  while (args.length) {
    const key = args.shift()
    if (!['--target', '--backup'].includes(key) || !args.length || options[key]) fail('Invalid or repeated command option')
    options[key] = args.shift()
  }
  const input = createInterface({ input: process.stdin, output: process.stdout })
  try {
    const target = (options['--target'] ?? await input.question('Existing portable directory (keep its current location): ')).trim().replace(/^"(.*)"$/, '$1')
    const source = dirname(fileURLToPath(import.meta.url))
    if (action === 'restore') {
      const id = options['--backup'] ?? (await input.question('Backup ID printed by the updater: ')).trim()
      console.log('Restore replaces settings/chats with their pre-upgrade snapshot. Newer data is archived, not merged. Workspace is unchanged.')
      if (await input.question('Type RESTORE to confirm: ') !== 'RESTORE') fail('Recovery cancelled; no changes made')
      console.log(JSON.stringify(restoreUpdate(target, id), null, 2))
    } else {
      console.log(JSON.stringify(checkUpdate(source, target), null, 2))
      if (action === 'check') return
      if (await input.question('Type UPDATE to confirm: ') !== 'UPDATE') fail('Update cancelled; no changes made')
      console.log(JSON.stringify(applyUpdate(source, target), null, 2))
      console.log('Update complete. Launch Start-DSH.cmd from the EXISTING portable directory. The clean source package is unchanged.')
    }
  } finally { input.close() }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1 })
}