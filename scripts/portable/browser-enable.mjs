/** Explicit opt-in deployment of the verified browser extension payload; never enables silently. */
import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { cpSync } from 'node:fs'
import { createHash, randomUUID } from 'node:crypto'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { verifyBrowserExtension } from './browser-extension.mjs'

const beginMarker = '# dsh-portable-browser begin'
const endMarker = '# dsh-portable-browser end'
const receiptName = 'enable.json'
const entryName = '@deepseek-ai/dsh-experimental-browser-use-playwright-mcp'
const browserUseName = '@deepseek-ai/dsh-browser-use'
const quote = value => `'${String(value).replaceAll('\'', '\'\'')}'`
const fail = message => { throw new Error(message) }
function inside(root, path) {
  const suffix = relative(root, path)
  return suffix === '' || (!isAbsolute(suffix) && suffix !== '..' && !suffix.startsWith('..' + sep))
}
function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8').replace(/^\uFEFF/, ''))
}
function portablePaths(root) {
  return {
    runtimeJson: join(root, 'app', 'resources', 'runtime', 'primary-runtime', 'runtime.json'),
    payload: join(root, 'data', 'browser', 'extension'),
    profile: join(root, 'data', 'home', 'profiles', 'desktop'),
    receipt: join(root, 'data', 'browser', receiptName),
  }
}

/** Read the packaged runtime identity; the only Host-side version evidence readable without Electron. */
export function verifyPortableRuntime(root) {
  const { runtimeJson } = portablePaths(root)
  let manifest
  try {
    manifest = readJson(runtimeJson)
  } catch (error) {
    fail(`Missing or unreadable packaged runtime identity ${runtimeJson}: ${String(error)}`)
  }
  if (typeof manifest.desktopVersion !== 'string') fail('Packaged runtime identity has no desktopVersion')
  if (manifest.platform !== 'win32' || manifest.arch !== 'x64') fail('Packaged runtime is not Windows x64')
  return { desktopVersion: manifest.desktopVersion }
}

/** Copy a verified payload into portable data; an identical existing deployment is reused, others refuse. */
export function deployBrowserExtension(root, payloadDirectory) {
  const { desktopVersion } = verifyPortableRuntime(root)
  const manifest = verifyBrowserExtension(payloadDirectory)
  for (const pkg of manifest.packages) {
    if (pkg.name.startsWith('@deepseek-ai/dsh-') && pkg.version !== desktopVersion) {
      fail(`Payload package ${pkg.name} version ${pkg.version} does not match packaged desktop ${desktopVersion}`)
    }
  }
  for (const [name, version] of Object.entries(manifest.hostPackages)) {
    if (name.startsWith('@deepseek-ai/dsh-') && version !== desktopVersion) {
      fail(`Host requirement ${name} version ${version} does not match packaged desktop ${desktopVersion}`)
    }
  }
  const { payload } = portablePaths(root)
  if (existsSync(payload)) {
    const deployed = verifyBrowserExtension(payload)
    if (JSON.stringify(deployed) !== JSON.stringify(manifest)) {
      const receiptFile = join(root, 'data', 'browser', receiptName)
      if (!existsSync(receiptFile) || readJson(receiptFile).deployment !== 'files') fail('A different unmanaged extension payload is already deployed')
      const previous = join(dirname(payload), `.extension-previous-${randomUUID()}`)
      renameSync(payload, previous)
      try {
        stagePayload(payloadDirectory, payload, manifest)
      } catch (error) {
        rmSync(payload, { recursive: true, force: true })
        renameSync(previous, payload)
        throw error
      }
      return { ...manifest, previousPayload: previous }
    }
    return manifest
  }
  stagePayload(payloadDirectory, payload, manifest)
  return manifest
}
function stagePayload(source, destination, manifest) {
  const staging = join(dirname(destination), `.extension-staging-${randomUUID()}`)
  rmSync(staging, { recursive: true, force: true })
  try {
    cpSync(source, staging, { recursive: true })
    if (JSON.stringify(verifyBrowserExtension(staging)) !== JSON.stringify(manifest)) fail('Deployed copy differs from verified payload')
    mkdirSync(dirname(destination), { recursive: true })
    renameSync(staging, destination)
  } finally {
    rmSync(staging, { recursive: true, force: true })
  }
}

function renderBlock(providerConfig) {
  const { executablePath, outputDir, tempDir } = providerConfig
  for (const [key, value] of Object.entries({ executablePath, outputDir, tempDir })) {
    if (typeof value !== 'string' || !isAbsolute(value)) fail(`Provider config ${key} must be an absolute path`)
  }
  return [
    beginMarker,
    '- insert:',
    `    - name: ${quote(browserUseName)}`,
    `    - name: ${quote(entryName)}`,
    '      config:',
    '        mode: launch',
    '        headless: true',
    `        executablePath: ${quote(executablePath)}`,
    `        outputDir: ${quote(outputDir)}`,
    `        tempDir: ${quote(tempDir)}`,
    endMarker,
  ].join('\n')
}

function replaceBlock(content, block) {
  const begin = content.indexOf(beginMarker), end = content.indexOf(endMarker)
  if ((begin === -1) !== (end === -1)) fail('Corrupted portable browser marker block; fix the patch file manually')
  if (begin === -1) {
    if (content.includes(entryName)) fail('Patch file already mentions the browser provider outside the managed block')
    // The overlay must stay a single YAML document: a flow-style empty list cannot be followed by block entries.
    const normalized = content.replace(/^((?:#[^\n]*\n)*)\[\]\s*\n?/, '$1')
    const prefix = normalized === '' ? '' : normalized.endsWith('\n') ? normalized : `${normalized}\n`
    return `${prefix}${block}\n`
  }
  if (content.indexOf(beginMarker, begin + 1) !== -1) fail('Multiple portable browser marker blocks')
  return content.slice(0, begin) + block + content.slice(end + endMarker.length)
}

function stripBlock(content) {
  const begin = content.indexOf(beginMarker), end = content.indexOf(endMarker)
  if (begin === -1) return content
  if (end === -1) fail('Corrupted portable browser marker block; fix the patch file manually')
  let stripped = content.slice(0, begin) + content.slice(end + endMarker.length)
  if (stripped.endsWith('\n') && (begin === 0 || content[begin - 1] === '\n')) stripped = stripped.slice(0, -1)
  if (stripped.startsWith('\n')) stripped = stripped.slice(1)
  return stripped
}

function lstatSyncSafe(path) {
  try {
    return lstatSync(path)
  } catch {
    return undefined
  }
}
function removeInstalled(profile, names) {
  for (const name of names) {
    const installed = join(profile, 'node_modules', ...name.split('/'))
    if (lstatSyncSafe(installed)?.isDirectory() && !lstatSync(installed).isSymbolicLink()) rmSync(installed, { recursive: true })
  }
}

/** Copy payload packages as real files; refuse links and foreign entries, reuse identical copies. */
function installPayloadPackages(profileDir, payload, packages, previousPayload) {
  const modules = join(profileDir, 'node_modules')
  const created = [], replaced = []
  for (const pkg of packages) {
    const source = join(payload, 'node_modules', pkg.name)
    const destination = join(modules, ...pkg.name.split('/'))
    const current = lstatSyncSafe(destination)
    let backup
    if (current !== undefined) {
      if (current.isSymbolicLink() || !current.isDirectory()) fail(`Profile node_modules entry is not a real directory: ${destination}`)
      const same = JSON.stringify(fileInventory(destination)) === JSON.stringify(fileInventory(source))
      const previous = previousPayload ? join(previousPayload, 'node_modules', ...pkg.name.split('/')) : undefined
      const owned = previous && existsSync(previous) && JSON.stringify(fileInventory(destination)) === JSON.stringify(fileInventory(previous))
      if (!same && !owned) fail(`Profile node_modules entry differs from payload: ${destination}`)
      if (same) continue
      backup = `${destination}.${randomUUID()}.previous`
      renameSync(destination, backup)
    }
    const parent = dirname(destination)
    mkdirSync(parent, { recursive: true })
    const staging = join(parent, `.${pkg.name.split('/').at(-1)}.${randomUUID()}.staging`)
    try {
      copyTree(source, staging)
      if (JSON.stringify(fileInventory(staging)) !== JSON.stringify(fileInventory(source))) fail('Installed package copy differs from payload')
      renameSync(staging, destination)
      if (backup) { replaced.push(backup); rmSync(backup, { recursive: true }) }
      else created.push(pkg.name)
    } catch (error) {
      rmSync(staging, { recursive: true, force: true })
      rmSync(destination, { recursive: true, force: true })
      if (backup && existsSync(backup)) renameSync(backup, destination)
      removeInstalled(profileDir, created)
      throw error
    }
  }
  return { created, replaced }
}
function fileInventory(root, prefix = '') {
  return readdirSync(join(root, prefix), { withFileTypes: true }).flatMap(entry => {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name
    const file = join(root, path)
    if (entry.isSymbolicLink()) fail('Browser package files must not contain links: ' + file)
    if (entry.isDirectory()) return fileInventory(root, path)
    if (!entry.isFile()) fail('Unsupported browser package file: ' + file)
    return [{ path, bytes: lstatSync(file).size, sha256: createHash('sha256').update(readFileSync(file)).digest('hex').toUpperCase() }]
  }).sort((a, b) => a.path < b.path ? -1 : 1)
}
function copyTree(source, destination) {
  mkdirSync(destination)
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    const from = join(source, entry.name), to = join(destination, entry.name)
    if (entry.isSymbolicLink()) fail('Cannot install a linked browser package file: ' + from)
    if (entry.isDirectory()) copyTree(from, to)
    else if (entry.isFile()) copyFileSync(from, to)
    else fail('Unsupported browser package file: ' + from)
  }
}

/**
 * Enable the deployed extension on the Desktop profile: dependency rows, real package copies,
 * and a marker-delimited user patch layer. Additive and idempotent; existing foreign entries
 * are preserved or refused, never overwritten. Changes are staged and rolled back on failure.
 */
export function enableBrowserExtension(root, runtime) {
  const paths = portablePaths(root)
  if (!existsSync(join(paths.profile, 'package.json'))) {
    fail(`Desktop profile does not exist yet at ${paths.profile}; start DSH once, then enable`)
  }
  const manifest = verifyBrowserExtension(paths.payload)
  const config = runtime?.providerConfig
  if (config?.mode !== 'launch') fail('Runtime resolution must provide a launch providerConfig')
  const block = renderBlock(config)
  const manifestFile = join(paths.profile, 'package.json')
  const patchFile = join(paths.profile, 'cordis.patch.yml')
  const beforeManifest = readFileSync(manifestFile)
  const beforePatch = existsSync(patchFile) ? readFileSync(patchFile) : undefined
  const before = readJson(manifestFile)
  const profileManifest = structuredClone(before)
  const added = {}
  for (const pkg of manifest.packages) {
    const existing = profileManifest.dependencies?.[pkg.name]
    if (existing !== undefined && existing !== pkg.version) fail(`Profile already depends on ${pkg.name}@${existing}, payload has ${pkg.version}`)
    if (existing === undefined) {
      profileManifest.dependencies ??= {}
      profileManifest.dependencies[pkg.name] = pkg.version
      added[pkg.name] = pkg.version
    }
  }
  const content = beforePatch?.toString('utf8') ?? ''
  const patched = replaceBlock(content, block)
  const previousPayload = existsSync(paths.receipt) && readJson(paths.receipt).deployment === 'files' ? manifest.previousPayload : undefined
  const installed = []
  try {
    installed.push(...installPayloadPackages(paths.profile, paths.payload, manifest.packages, previousPayload).created)
    if (JSON.stringify(profileManifest) !== JSON.stringify(before)) writeFileSync(manifestFile, `${JSON.stringify(profileManifest, null, 2)}\n`)
    if (patched !== content) writeFileSync(patchFile, patched)
    const receipt = {
      schemaVersion: 2, deployment: 'files',
      desktopVersion: verifyPortableRuntime(root).desktopVersion,
      payload: manifest,
      dependencies: { ...(existsSync(paths.receipt) ? readJson(paths.receipt).dependencies ?? {} : {}), ...added },
      providerConfig: config,
      profile: paths.profile,
      note: 'Absolute paths; rerun enable after relocating the portable directory.',
    }
    writeFileSync(paths.receipt, `${JSON.stringify(receipt, null, 2)}\n`)
    if (previousPayload) rmSync(previousPayload, { recursive: true })
    return receipt
  } catch (error) {
    if (beforePatch === undefined) rmSync(patchFile, { force: true })
    else writeFileSync(patchFile, beforePatch)
    writeFileSync(manifestFile, beforeManifest)
    removeInstalled(paths.profile, installed)
    throw error
  }
}

/** Undo exactly the entries enable wrote; foreign profile content and the deployed payload stay. */
export function disableBrowserExtension(root) {
  const paths = portablePaths(root)
  if (!existsSync(paths.receipt)) return
  const receipt = readJson(paths.receipt)
  const manifestFile = join(paths.profile, 'package.json')
  if (existsSync(manifestFile)) {
    const profileManifest = readJson(manifestFile)
    for (const [name, version] of Object.entries(receipt.dependencies ?? {})) {
      if (profileManifest.dependencies?.[name] === version) delete profileManifest.dependencies[name]
    }
    if (profileManifest.dependencies !== undefined && Object.keys(profileManifest.dependencies).length === 0) delete profileManifest.dependencies
    writeFileSync(manifestFile, `${JSON.stringify(profileManifest, null, 2)}\n`)
  }
  const modules = join(paths.profile, 'node_modules')
  const payloadModules = join(paths.payload, 'node_modules')
  const owned = receipt.deployment === 'files' || receipt.schemaVersion === 2
  for (const name of Array.isArray(receipt.payload?.packages) ? receipt.payload.packages.map(pkg => pkg.name) : Object.keys(receipt.payload?.packages ?? {})) {
    const installed = join(modules, ...name.split('/'))
    const source = join(payloadModules, ...name.split('/'))
    if (lstatSyncSafe(installed) === undefined) continue
    if (lstatSync(installed).isSymbolicLink()) {
      if (owned) fail('Legacy browser junction remains; rerun enable from the current package before disabling')
      continue
    }
    if (!owned || !lstatSync(installed).isDirectory() || !existsSync(source)) continue
    if (JSON.stringify(fileInventory(installed)) !== JSON.stringify(fileInventory(source))) continue
    removeInstalled(paths.profile, [name])
  }
  const patchFile = join(paths.profile, 'cordis.patch.yml')
  if (existsSync(patchFile)) {
    const stripped = stripBlock(readFileSync(patchFile, 'utf8'))
    if (stripped === '') rmSync(patchFile)
    else {
      // Restore the default empty overlay when only comments remain: the Host requires one YAML document.
      const withoutComments = stripped.replace(/#[^\n]*/g, '').trim()
      writeFileSync(patchFile, withoutComments === '' ? `${stripped}[]\n` : stripped)
    }
  }
  rmSync(paths.receipt)
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command, root, payload] = process.argv.slice(2)
  if (command === 'deploy' && root !== undefined && payload !== undefined) {
    console.log(JSON.stringify(deployBrowserExtension(root, payload).packages, null, 2))
  } else if (command === 'enable' && root !== undefined) {
    const { resolveBrowserRuntime } = await import('./browser-runtime.mjs')
    const resolvedRoot = resolve(root)
    const manifest = readJson(join(portablePaths(resolvedRoot).payload, 'BROWSER-EXTENSION.json'))
    const entries = Array.isArray(manifest.packages) ? manifest.packages : Object.entries(manifest.packages ?? {}).map(([name, value]) => ({ name, version: typeof value === 'string' ? value : value?.version }))
    const playwright = entries.find(pkg => pkg?.name === 'playwright-core')?.version
    if (typeof playwright !== 'string' || !playwright) fail('Deployed payload manifest has no playwright-core version')
    const receipt = enableBrowserExtension(resolvedRoot, resolveBrowserRuntime(resolvedRoot, playwright))
    console.log(JSON.stringify({ enabled: true, dependencies: Object.keys(receipt.dependencies), profile: receipt.profile }, null, 2))
  } else if (command === 'disable' && root !== undefined) {
    disableBrowserExtension(root)
    console.log('disabled')
  } else {
    fail('Usage: node browser-enable.mjs deploy <root> <payload> | enable <root> | disable <root>')
  }
}