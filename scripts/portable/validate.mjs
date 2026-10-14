import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
const cwd = fileURLToPath(new URL('../..', import.meta.url))
const tests = [
  'packages/boot/app-boot/tests/company-privacy-policy.spec.ts',
  'packages/boot/app-boot/tests/config-reload.spec.ts',
  'packages/boot/app-boot/tests/profile.spec.ts',
  'packages/boot/hmr/tests/profile.spec.ts',
  'packages/boot/plugin-manager/tests/manager.spec.ts',
  'packages/settings/settings/tests/configuration.spec.ts',
  'packages/llm/llm-deepseek/tests/company-privacy.spec.ts',
  'apps/cli/tests/telemetry-switch.spec.ts',
  'apps/desktop/tests/desktop-offline-build.spec.ts',
  'apps/desktop/tests/desktop-package-environment.spec.ts',
  'apps/desktop/tests/offline-mode.spec.ts',
  'apps/desktop/tests/locale.spec.ts',
]
const commands = [
  ['node_modules/tsx/dist/cli.mjs', 'scripts/verify-client-ui-i18n.ts'],
  ['node_modules/vitest/vitest.mjs', 'run', ...tests, '--maxWorkers=1', '--testTimeout=30000'],
  ['--max-old-space-size=4096', 'node_modules/typescript/bin/tsc', '-b', 'tsconfig.host.json', '--pretty', 'false'],
  ['node_modules/typescript/bin/tsc', '-b', 'tsconfig.client.json', '--pretty', 'false'],
]
for (const args of commands) {
  const result = spawnSync(process.execPath, args, { cwd, stdio: 'inherit', env: { ...process.env, DSH_TELEMETRY_DISABLED: '1', DSH_TELEMETRY_MODE: 'DISABLED' } })
  if (result.error || result.status !== 0) throw new Error(`Validation failed: ${args[0]}`, { cause: result.error })
}
console.log('Portable source validation passed: i18n, regression tests, Host and Client typechecks.')