/** Seal explicitly selected Playwright browser assets without importing a user's cache. */
import { createHash } from 'node:crypto'
import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { isAbsolute, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const manifestName = 'BROWSER-ASSETS.json'
const components = ['chromium', 'ffmpeg', 'winldd']
const digest = path => createHash('sha256').update(readFileSync(path)).digest('hex').toUpperCase()
function inventory(root, prefix = '') {
  return readdirSync(join(root, prefix), { withFileTypes: true }).flatMap(entry => {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isSymbolicLink()) throw new Error('Browser assets must not contain links: ' + path)
    if (entry.isDirectory()) return inventory(root, path)
    if (!entry.isFile()) throw new Error('Unsupported browser asset: ' + path)
    if (path === manifestName) return []
    const file = join(root, path)
    return [{ path, bytes: lstatSync(file).size, sha256: digest(file) }]
  }).sort((a, b) => a.path.localeCompare(b.path, 'en'))
}
function separate(source, target) {
  const path = relative(source, target)
  return path !== '' && (path === '..' || path.startsWith('..' + sep) || isAbsolute(path))
}

/** Copy only pinned Chromium and its helper assets to a new immutable staging directory. */
export function prepareBrowserAssets(cachePath, corePath, destination) {
  const cache = resolve(cachePath), core = resolve(corePath), dest = resolve(destination)
  if (!separate(cache, dest) || !separate(dest, cache)) throw new Error('Browser source and destination must be separate')
  if (existsSync(dest)) throw new Error('Refusing to overwrite browser assets')
  if (!lstatSync(cache).isDirectory() || lstatSync(cache).isSymbolicLink()) throw new Error('Invalid browser cache directory')
  const pkg = JSON.parse(readFileSync(join(core, 'package.json'), 'utf8'))
  if (pkg.name !== 'playwright-core') throw new Error('Expected pinned playwright-core package')
  const browsers = JSON.parse(readFileSync(join(core, 'browsers.json'), 'utf8')).browsers
  const selected = components.map(name => {
    const item = browsers.find(browser => browser.name === name)
    if (!item || !/^\d+$/.test(item.revision)) throw new Error('Missing pinned browser component: ' + name)
    const directory = `${name}-${item.revision}`
    const path = join(cache, directory)
    if (!lstatSync(path).isDirectory() || lstatSync(path).isSymbolicLink()) throw new Error('Invalid browser component: ' + name)
    inventory(path)
    return { name, revision: item.revision, ...(item.browserVersion ? { version: item.browserVersion } : {}), directory }
  })
  const executable = `${selected[0].directory}/chrome-win64/chrome.exe`
  if (!existsSync(join(cache, executable))) throw new Error('Missing Windows x64 Chromium executable')
  const expectedFiles = selected.flatMap(item => inventory(join(cache, item.directory))
    .map(file => ({ ...file, path: `${item.directory}/${file.path}` })))
    .sort((a, b) => a.path.localeCompare(b.path, 'en'))
  mkdirSync(dest, { recursive: true })
  for (const item of selected) cpSync(join(cache, item.directory), join(dest, item.directory), { recursive: true, dereference: false })
  const files = inventory(dest)
  if (JSON.stringify(files) !== JSON.stringify(expectedFiles)) throw new Error('Browser asset copy mismatch')
  const manifest = {
    schemaVersion: 1, platform: 'win32', arch: 'x64', playwrightVersion: pkg.version,
    executable, components: selected, files,
    scope: 'Local SHA-256 inventory of assets obtained by the pinned Playwright installer; not an upstream signature.',
  }
  writeFileSync(join(dest, manifestName), JSON.stringify(manifest, null, 2) + '\n')
  verifyBrowserAssets(dest)
  return manifest
}

/** Reject changed, missing, extra or linked files before using the staged browser. */
export function verifyBrowserAssets(directory) {
  const root = resolve(directory)
  if (!lstatSync(root).isDirectory() || lstatSync(root).isSymbolicLink()
    || !lstatSync(join(root, manifestName)).isFile() || lstatSync(join(root, manifestName)).isSymbolicLink()) {
    throw new Error('Invalid browser asset directory or manifest')
  }
  const manifest = JSON.parse(readFileSync(join(root, manifestName), 'utf8'))
  if (manifest.schemaVersion !== 1 || manifest.platform !== 'win32' || manifest.arch !== 'x64'
    || typeof manifest.playwrightVersion !== 'string' || !Array.isArray(manifest.components)
    || manifest.components.length !== components.length || manifest.components.some((item, index) =>
      item.name !== components[index] || !/^\d+$/.test(item.revision)
      || item.directory !== `${item.name}-${item.revision}`)
    || manifest.executable !== `${manifest.components[0].directory}/chrome-win64/chrome.exe`) {
    throw new Error('Invalid browser asset manifest')
  }
  if (JSON.stringify(inventory(root)) !== JSON.stringify(manifest.files)) throw new Error('Browser asset integrity mismatch')
  if (!manifest.files.some(file => file.path === manifest.executable)) throw new Error('Missing browser executable')
  return manifest
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [cache, core, dest] = process.argv.slice(2)
  if (!cache || !core || !dest || process.argv.length !== 5) throw new Error('Usage: node browser-assets.mjs <cache> <playwright-core-directory> <new-destination>')
  const result = prepareBrowserAssets(cache, core, dest)
  console.log(JSON.stringify({ playwrightVersion: result.playwrightVersion, executable: result.executable, files: result.files.length }, null, 2))
}