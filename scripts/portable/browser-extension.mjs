/** Materialize a flat, pinned extension closure without installing or executing packages. */
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, isAbsolute, join, matchesGlob, relative, resolve, sep } from 'node:path'

const manifestName = 'BROWSER-EXTENSION.json'
const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex').toUpperCase()
const readJson = file => JSON.parse(readFileSync(file, 'utf8'))
const packageName = name => typeof name === 'string' && /^(?:@[a-z0-9._-]+\/)?[a-z0-9][a-z0-9._-]*$/.test(name)
function inside(root, path) {
  const suffix = relative(root, path)
  return suffix === '' || (!isAbsolute(suffix) && suffix !== '..' && !suffix.startsWith('..' + sep))
}
function files(root, prefix = '', skipModules = false) {
  return readdirSync(join(root, prefix), { withFileTypes: true }).flatMap(entry => {
    if (skipModules && entry.name === 'node_modules') return []
    const path = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isSymbolicLink()) throw new Error('Extension payload must not contain links: ' + path)
    if (entry.isDirectory()) return files(root, path, skipModules)
    if (!entry.isFile()) throw new Error('Unsupported extension file: ' + path)
    return [path]
  }).sort()
}
function inventory(root) {
  return files(root).filter(path => path !== manifestName).map(path => ({
    path, bytes: lstatSync(join(root, path)).size, sha256: hash(join(root, path)),
  }))
}
function locate(anchor, name) {
  for (const modules of createRequire(join(anchor, 'package.json')).resolve.paths(name) ?? []) {
    const path = join(modules, name)
    if (existsSync(join(path, 'package.json'))) return realpathSync(path)
  }
  throw new Error('Missing extension dependency: ' + name)
}

/**
 * Copy declared published files of each dependency into a new flat payload.
 * hostPackages is an explicit exact-version map, not an implicit peer-install policy.
 * Conflicting resolutions, unresolved peers and unbuilt main entries fail before writing.
 */
export function prepareBrowserExtension(entryDirectory, destination, hostPackages) {
  const entry = realpathSync(entryDirectory), dest = resolve(destination)
  if (existsSync(dest)) throw new Error('Refusing to overwrite extension payload')
  if (inside(entry, dest) || inside(dest, entry)) throw new Error('Extension source and destination must be separate')
  if (!hostPackages || Object.entries(hostPackages).some(([name, version]) => !packageName(name) || typeof version !== 'string' || !version)) {
    throw new Error('Expected explicit host package versions')
  }
  const selected = new Map(), external = new Map(), queue = [entry]
  while (queue.length) {
    const directory = queue.shift()
    const manifest = readJson(join(directory, 'package.json'))
    if (!packageName(manifest.name) || typeof manifest.version !== 'string') throw new Error('Invalid extension package identity')
    const previous = selected.get(manifest.name)
    if (previous) {
      if (previous.directory !== directory) throw new Error('Conflicting flat extension dependency: ' + manifest.name)
      continue
    }
    if (Object.hasOwn(hostPackages, manifest.name)) throw new Error('Entry conflicts with host package: ' + manifest.name)
    const patterns = manifest.files ?? (directory.split(sep).includes('.pnpm') ? ['**/*'] : undefined)
    if (!Array.isArray(patterns) || patterns.some(pattern => typeof pattern !== 'string' || pattern.includes('..') || pattern.startsWith('/') || pattern.includes('\\') || pattern.startsWith('!'))) {
      throw new Error('Extension package requires an explicit supported files list: ' + manifest.name)
    }
    const published = files(directory, '', true).filter(path => path === 'package.json'
      || /^(?:licen[cs]e|notice|copying|readme)(?:[.-]|$)/i.test(path)
      || patterns.some(pattern => {
        const clean = pattern.replace(/^\.\//, '').replace(/\/$/, '')
        return path === clean || path.startsWith(clean + '/') || matchesGlob(path, clean)
      }))
    const main = manifest.main ?? manifest.exports?.['.']?.default
    if (typeof main !== 'string' || !published.includes(main.replace(/^\.\//, ''))) {
      throw new Error('Missing published main entry; build package first: ' + manifest.name)
    }
    selected.set(manifest.name, { directory, manifest, published })
    for (const name of Object.keys(manifest.dependencies ?? {})) {
      if (!packageName(name)) throw new Error('Invalid dependency name')
      const resolved = locate(directory, name)
      const dependency = readJson(join(resolved, 'package.json'))
      if (dependency.name !== name) throw new Error('Dependency identity mismatch: ' + name)
      if (Object.hasOwn(hostPackages, name)) {
        if (hostPackages[name] !== dependency.version) throw new Error('Host dependency version mismatch: ' + name)
        external.set(name, hostPackages[name])
      } else queue.push(resolved)
    }
    for (const [name, spec] of Object.entries(manifest.peerDependencies ?? {})) {
      if (!packageName(name)) throw new Error('Invalid peer name')
      if (!Object.hasOwn(hostPackages, name)) throw new Error('Peer must be supplied explicitly by host: ' + name)
      if (/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(spec) && spec !== hostPackages[name]) throw new Error('Host peer version mismatch: ' + name)
      external.set(name, hostPackages[name])
      // Version-range admission is owned by the existing profile compatibility checks.
      if (typeof spec !== 'string') throw new Error('Invalid peer declaration')
    }
    if (Object.keys(manifest.optionalDependencies ?? {}).length) throw new Error('Optional dependency selection requires explicit packaging policy: ' + manifest.name)
  }
  // Canonicalize the nearest existing parent to reject a destination routed into a source through a junction.
  let parent = dirname(dest)
  while (!existsSync(parent)) parent = dirname(parent)
  const canonicalDestination = resolve(realpathSync(parent), relative(parent, dest))
  for (const { directory } of selected.values()) {
    if (inside(directory, canonicalDestination) || inside(canonicalDestination, directory)) throw new Error('Extension source and destination must be separate')
  }
  mkdirSync(dest, { recursive: true })
  for (const [name, { directory, published }] of selected) {
    for (const path of published) {
      const target = join(dest, 'node_modules', name, path)
      mkdirSync(dirname(target), { recursive: true })
      copyFileSync(join(directory, path), target)
      if (hash(join(directory, path)) !== hash(target)) throw new Error('Extension copy mismatch')
    }
  }
  const manifest = {
    schemaVersion: 1, entry: readJson(join(entry, 'package.json')).name,
    packages: [...selected.values()].map(({ manifest: pkg }) => ({ name: pkg.name, version: pkg.version, license: pkg.license ?? null })).sort((a, b) => a.name.localeCompare(b.name)),
    hostPackages: Object.fromEntries([...external].sort(([a], [b]) => a.localeCompare(b))), files: inventory(dest),
    scope: 'Local materialized dependency inventory; not an upstream signature, license approval, or enabled DSH plugin.',
  }
  writeFileSync(join(dest, manifestName), JSON.stringify(manifest, null, 2) + '\n')
  verifyBrowserExtension(dest)
  return manifest
}

/** Verify local payload inventory before installation; this does not activate the extension. */
export function verifyBrowserExtension(directory) {
  const root = resolve(directory)
  if (!lstatSync(root).isDirectory() || lstatSync(root).isSymbolicLink()
    || !lstatSync(join(root, manifestName)).isFile() || lstatSync(join(root, manifestName)).isSymbolicLink()) throw new Error('Invalid extension root or manifest')
  const manifest = readJson(join(root, manifestName))
  if (manifest.schemaVersion !== 1 || !packageName(manifest.entry) || !Array.isArray(manifest.packages)
    || !manifest.packages.some(pkg => pkg.name === manifest.entry) || manifest.packages.some(pkg => !packageName(pkg.name) || typeof pkg.version !== 'string')
    || !manifest.hostPackages || typeof manifest.hostPackages !== 'object' || Array.isArray(manifest.hostPackages)
    || Object.entries(manifest.hostPackages).some(([name, version]) => !packageName(name) || typeof version !== 'string')
    || new Set(manifest.packages.map(pkg => pkg.name)).size !== manifest.packages.length) throw new Error('Invalid extension manifest')
  if (JSON.stringify(inventory(root)) !== JSON.stringify(manifest.files)) throw new Error('Extension integrity mismatch')
  return manifest
}