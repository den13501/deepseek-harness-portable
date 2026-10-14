import { createHash } from 'node:crypto'
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../..', import.meta.url))
const source = join(root, 'apps/desktop/.desktop-build/targets/win-x64/unsigned-artifacts/win-unpacked')
const output = join(root, '.artifacts/portable')
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
const version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version
const name = `DSH-portable-${version}-win-x64-${commit.slice(0, 12)}`
const dest = join(output, name)
const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex').toUpperCase()
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
function main() {
  if (process.platform !== 'win32') throw new Error('Windows x64 packaging requires Windows')
  if (existsSync(dest) || existsSync(dest + '.zip')) throw new Error('Refusing to overwrite an existing portable build')
  const report = verifyArtifact(source)
  mkdirSync(output, { recursive: true })
  cpSync(source, join(dest, 'app'), { recursive: true, dereference: false })
  const files = inventory(source)
  if (JSON.stringify(files) !== JSON.stringify(inventory(join(dest, 'app')))) throw new Error('Copy inventory mismatch')
  for (const file of files) if (hash(join(source, file)) !== hash(join(dest, 'app', file))) throw new Error('Copy hash mismatch')
  cpSync(join(root, 'scripts/portable/Start-DSH.cmd'), join(dest, 'Start-DSH.cmd'))
  cpSync(join(root, 'scripts/portable/README.zh-TW.md'), join(dest, 'README.zh-TW.md'))
  writeFileSync(join(dest, 'POLICY-CHECK.json'), JSON.stringify(report, null, 2) + '\n')
  const dirty = execFileSync('git', ['status', '--porcelain=v1', '-uall'], { cwd: root }).length > 0
  writeFileSync(join(dest, 'BUILD-INFO.json'), JSON.stringify({ version, commit, dirty, node: process.version, builtAt: new Date().toISOString(), unsigned: true }, null, 2) + '\n')
  const csv = ['"Path","Length","SHA256"', ...inventory(dest).map(file =>
    [file.replaceAll('\\', '/'), String(statSync(join(dest, file)).size), hash(join(dest, file))].map(value => `"${value.replaceAll('"', '""')}"`).join(','))]
  writeFileSync(join(dest, 'SHA256SUMS.csv'), '\uFEFF' + csv.join('\r\n') + '\r\n')
  if (existsSync(join(dest, 'data')) || existsSync(join(dest, 'workspace'))) throw new Error('User data in clean package')
  const zip = dest + '.zip'
  execFileSync('7z', ['a', '-tzip', '-mx=3', zip, name], { cwd: output, stdio: 'inherit' })
  execFileSync('7z', ['t', zip], { stdio: 'inherit' })
  writeFileSync(zip + '.sha256', `${hash(zip)}  ${name}.zip\r\n`)
  console.log(`Portable created: ${name}.zip`)
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()