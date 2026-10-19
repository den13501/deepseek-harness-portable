import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { readAsar, verifyArtifact } from './package.mjs'

const modules = ['client-product-analytics', 'host-product-telemetry-otel', 'session-telemetry-otel', 'session-log-deepseek', 'plugin-package-inventory-deepseek']
function fixture(directory, manifest, code) {
  const contents = [Buffer.from(JSON.stringify(manifest)), Buffer.from(code)]
  const header = Buffer.from(JSON.stringify({ files: {
    'package.json': { size: contents[0].length, offset: '0' },
    'main.js': { size: contents[1].length, offset: String(contents[0].length) },
  } }))
  const headerSize = 8 + Math.ceil(header.length / 4) * 4
  const prefix = Buffer.alloc(8 + headerSize)
  prefix.writeUInt32LE(4, 0)
  prefix.writeUInt32LE(headerSize, 4)
  prefix.writeUInt32LE(headerSize - 4, 8)
  prefix.writeUInt32LE(header.length, 12)
  header.copy(prefix, 16)
  mkdirSync(join(directory, 'resources'), { recursive: true })
  writeFileSync(join(directory, 'resources/app.asar'), Buffer.concat([prefix, ...contents]))
}
test('artifact checks reject update settings and missing hooks', () => {
  const directory = mkdtempSync(join(tmpdir(), 'portable-policy-'))
  const code = modules.map(m => '@deepseek-ai/dsh-' + m).join('\n') + '\nloader/entry-disabled\ninstallCompanyPrivacyPolicy'
  try {
    fixture(directory, { version: 'test', dshOfflineMode: true }, code)
    assert.equal(readAsar(join(directory, 'resources/app.asar')).length, 2)
    assert.ok(Object.values(verifyArtifact(directory).checks).every(Boolean))
    fixture(directory, { dshOfflineMode: false }, code)
    assert.throws(() => verifyArtifact(directory), /Artifact checks failed/)
    fixture(directory, { dshOfflineMode: true, dshMandatoryUpdatePolicy: {} }, code)
    assert.throws(() => verifyArtifact(directory), /Artifact checks failed/)
    fixture(directory, { dshOfflineMode: true }, code.replace('installCompanyPrivacyPolicy', ''))
    assert.throws(() => verifyArtifact(directory), /Artifact checks failed/)
    fixture(directory, { dshOfflineMode: true }, code)
    writeFileSync(join(directory, 'resources/app-update.yml'), 'test')
    assert.throws(() => verifyArtifact(directory), /Artifact checks failed/)
    writeFileSync(join(directory, 'resources/app.asar'), Buffer.alloc(16, 255))
    assert.throws(() => readAsar(join(directory, 'resources/app.asar')), /Invalid ASAR header/)
  } finally { rmSync(directory, { recursive: true, force: true }) }
})