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
  'packages/client/locale/tests/traditional-chinese.client.spec.ts',
  'packages/client/ui-secret-mask/tests/browser-plugin.client.spec.ts',
]
const commands = [
  ['--test', 'scripts/portable/package.test.mjs', 'scripts/portable/portable-update.test.mjs'],
  ['node_modules/tsx/dist/cli.mjs', 'scripts/verify-client-ui-i18n.ts'],
  ['node_modules/vitest/vitest.mjs', 'run', ...tests, '--maxWorkers=1', '--testTimeout=30000'],
  ['node_modules/tsx/dist/cli.mjs', 'scripts/build.ts', '--scope', 'typecheck'],
]
for (const args of commands) {
  const result = spawnSync(process.execPath, args, { cwd, stdio: 'inherit', env: { ...process.env, DSH_TELEMETRY_DISABLED: '1', DSH_TELEMETRY_MODE: 'DISABLED' } })
  if (result.error || result.status !== 0) throw new Error(`Validation failed: ${args[0]}`, { cause: result.error })
}
console.log('Portable source validation passed: i18n, regression tests, Host and Client typechecks.')