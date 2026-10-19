import { createHash } from 'node:crypto'
import { cpSync, createReadStream, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { verifyBrowserAssets } from './browser-assets.mjs'
import { verifyBrowserExtension } from './browser-extension.mjs'

const root = fileURLToPath(new URL('../..', import.meta.url))
const source = join(root, 'apps/desktop/.desktop-build/targets/win-x64/unsigned-artifacts/win-unpacked')
const output = join(root, '.artifacts/portable')
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
const version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version
const portableRevision = 1
const name = `DSH-portable-${version}-p${portableRevision}-win-x64-${commit.slice(0, 12)}`
const dest = join(output, name)
const hash = file => new Promise((resolveHash, reject) => {
  const digest = createHash('sha256')
  createReadStream(file).on('error', reject).on('data', chunk => digest.update(chunk)).on('end', () => resolveHash(digest.digest('hex').toUpperCase()))
})
function inventory(directory, prefix = '') {
  return readdirSync(join(directory, prefix), { withFileTypes: true }).flatMap(entry => {
    const relative = join(prefix, entry.name)
    if (entry.isSymbolicLink()) throw new Error('Portable must not contain links')
    if (entry.isDirectory()) return inventory(directory, relative)
    if (!entry.isFile()) throw new Error('Unexpected filesystem entry')
    return [relative]
  }).sort()
}
// Read ASAR's JSON header without introducing a new dependency or executing packaged code.
export function readAsar(archive) {
  const data = readFileSync(archive)
  const headerSize = data.readUInt32LE(4)
  const jsonSize = data.readUInt32LE(12)
  if (16 + jsonSize > 8 + headerSize || 8 + headerSize > data.length) throw new Error('Invalid ASAR header')
  const header = JSON.parse(data.subarray(16, 16 + jsonSize).toString('utf8'))
  const members = []
  function walk(tree, prefix = '') {
    for (const [name, entry] of Object.entries(tree.files ?? {})) {
      const relative = prefix + name
      if (entry.files) walk(entry, relative + '/')
      else if (entry.link) throw new Error('ASAR links are not supported by the policy inspector')
      else {
        const contents = entry.unpacked
          ? readFileSync(join(archive + '.unpacked', ...relative.split('/')))
          : data.subarray(8 + headerSize + Number(entry.offset), 8 + headerSize + Number(entry.offset) + entry.size)
        if (contents.length !== entry.size) throw new Error('Truncated ASAR member')
        members.push({ path: relative, contents })
      }
    }
  }
  walk(header)
  return members
}
export function verifyArtifact(directory) {
  const members = readAsar(join(directory, 'resources/app.asar'))
  const manifest = JSON.parse(members.find(m => m.path === 'package.json')?.contents.toString('utf8') ?? 'null')
  const code = members.filter(m => /\.[cm]?js$/.test(m.path)).map(m => m.contents.toString('utf8')).join('\n')
  const policy = readFileSync(join(root, 'packages/boot/app-boot/src/company-privacy-policy.ts'), 'utf8')
  const modules = [...policy.matchAll(/'(@deepseek-ai\/dsh-[^']+)'/g)].map(m => m[1])
  const checks = {
    offline: manifest?.dshOfflineMode === true,
    noMandatoryPolicy: manifest !== null && !Object.hasOwn(manifest, 'dshMandatoryUpdatePolicy'),
    noUpdaterYaml: !existsSync(join(directory, 'resources/app-update.yml')),
    policyModules: modules.length === 5 && modules.every(name => code.includes(name)),
    loaderHook: code.includes('loader/entry-disabled'),
    bootHook: code.includes('installCompanyPrivacyPolicy'),
  }
  if (Object.values(checks).some(value => !value)) throw new Error(`Artifact checks failed: ${JSON.stringify(checks)}`)
  return { checkedAt: new Date().toISOString(), version: manifest.version, checks, scope: 'Static packaged-artifact checks; not a network sandbox or company acceptance.' }
}
async function main() {
  if (process.platform !== 'win32') throw new Error('Windows x64 packaging requires Windows')
  if (existsSync(dest) || existsSync(dest + '.zip')) throw new Error('Refusing to overwrite an existing portable build')
  const report = verifyArtifact(source)
  if (report.version !== version) throw new Error('Packaged application version differs from the source version')
  mkdirSync(output, { recursive: true })
  const files = inventory(source)
  cpSync(source, join(dest, 'app'), { recursive: true, dereference: false })
  if (JSON.stringify(files) !== JSON.stringify(inventory(join(dest, 'app')))) throw new Error('Copy inventory mismatch')
  for (const file of files) if (await hash(join(source, file)) !== await hash(join(dest, 'app', file))) throw new Error('Copy hash mismatch')
  const browserRoot = join(dest, 'app', 'browser')
  const assets = process.env.DSH_PORTABLE_BROWSER_ASSETS
  const extension = process.env.DSH_PORTABLE_BROWSER_EXTENSION
  if (Boolean(assets) !== Boolean(extension)) throw new Error('Browser assets and extension payload must be supplied together')
  if (assets && extension) {
    const assetManifest = verifyBrowserAssets(assets)
    const extensionManifest = verifyBrowserExtension(extension)
    const playwright = extensionManifest.packages.find(pkg => pkg.name === 'playwright-core')?.version
    if (playwright !== assetManifest.playwrightVersion) throw new Error('Browser asset and extension Playwright versions differ')
    cpSync(assets, join(browserRoot, 'assets'), { recursive: true, dereference: false })
    cpSync(extension, join(browserRoot, 'extension'), { recursive: true, dereference: false })
    verifyBrowserAssets(join(browserRoot, 'assets'))
    verifyBrowserExtension(join(browserRoot, 'extension'))
  }
  for (const file of ['Start-DSH.cmd', 'Check-Update.cmd', 'Update-DSH.cmd', 'Restore-DSH.cmd', 'Enable-Browser.cmd', 'Disable-Browser.cmd', 'portable-update.mjs', 'browser-enable.mjs', 'browser-runtime.mjs', 'browser-extension.mjs', 'browser-assets.mjs']) {
    cpSync(join(root, 'scripts/portable', file), join(dest, file))
  }
  cpSync(join(root, 'scripts/portable/README.zh-TW.md'), join(dest, 'README.zh-TW.md'))
  writeFileSync(join(dest, 'POLICY-CHECK.json'), JSON.stringify(report, null, 2) + '\n')
  const dirty = execFileSync('git', ['status', '--porcelain=v1', '-uall'], { cwd: root }).length > 0
  writeFileSync(join(dest, 'BUILD-INFO.json'), JSON.stringify({ version, portableRevision, commit, dirty, node: process.version, builtAt: new Date().toISOString(), unsigned: true }, null, 2) + '\n')
  const rows = ['"Path","Length","SHA256"']
  for (const file of inventory(dest)) rows.push([file.replaceAll('\\', '/'), String(statSync(join(dest, file)).size), await hash(join(dest, file))].map(value => `"${value.replaceAll('"', '""')}"`).join(','))
  writeFileSync(join(dest, 'SHA256SUMS.csv'), '\uFEFF' + rows.join('\r\n') + '\r\n')
  if (existsSync(join(dest, 'data')) || existsSync(join(dest, 'workspace'))) throw new Error('User data in clean package')
  const zip = dest + '.zip'
  execFileSync('7z', ['a', '-tzip', '-mx=3', zip, name], { cwd: output, stdio: 'inherit' })
  execFileSync('7z', ['t', zip], { stdio: 'inherit' })
  writeFileSync(zip + '.sha256', `${await hash(zip)}  ${name}.zip\r\n`)
  console.log(`Portable created: ${name}.zip`)
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main()