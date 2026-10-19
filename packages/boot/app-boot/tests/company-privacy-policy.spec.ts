/** Company policy is enforced by Loader, not by editable entry ids or enabled flags. */
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import type { Include } from '@deepseek-ai/cordis-plugin-include'
import { expect, it, onTestFinished, vi } from 'vitest'
import { boot } from '../src/index.ts'
import { COMPANY_BLOCKED_MODULES, installCompanyPrivacyPolicy, isCompanyBlockedModule } from '../src/company-privacy-policy.ts'

it('matches every denied package and subpath without blocking ordinary model adapters', () => {
  for (const name of COMPANY_BLOCKED_MODULES) {
    expect(isCompanyBlockedModule(name)).toBe(true)
    expect(isCompanyBlockedModule(`${name}/client`)).toBe(true)
    expect(isCompanyBlockedModule(`${name}-other`)).toBe(false)
  }
  expect(isCompanyBlockedModule('@deepseek-ai/dsh-llm-deepseek')).toBe(false)
  expect(isCompanyBlockedModule('@deepseek-ai/dsh-deepseek-llm-api-extensions')).toBe(false)
  expect(Object.isFrozen(COMPANY_BLOCKED_MODULES)).toBe(true)
})

it('denies imports before execution, including renamed ids, group flags, updates and direct init', async () => {
  const ctx = new Context()
  onTestFinished(() => ctx.fiber.dispose())
  await ctx.plugin(Loader)
  installCompanyPrivacyPolicy(ctx)
  const imported = vi.spyOn(ctx.loader, 'import')
  for (const [index, name] of COMPANY_BLOCKED_MODULES.entries()) {
    const id = await ctx.loader.create({ name, disabled: false, group: index % 2 === 0, config: { enabled: true } })
    const entry = ctx.loader.resolve(id)
    expect(entry.disabled).toBe(true)
    expect(entry.fiber).toBeUndefined()
    await entry.update({ disabled: false, config: { enabled: true } }, false, true)
    await entry.init()
    expect(entry.disabled).toBe(true)
    expect(entry.fiber).toBeUndefined()
  }
  expect(imported).not.toHaveBeenCalled()
})

it('keeps normal Loader behavior and never overrides explicit disablement', async () => {
  const ctx = new Context()
  onTestFinished(() => ctx.fiber.dispose())
  await ctx.plugin(Loader)
  installCompanyPrivacyPolicy(ctx)
  const apply = vi.fn()
  ctx.loader.builtins.safe = { apply }
  const id = await ctx.loader.create({ name: 'cordis:safe', disabled: true })
  expect(apply).not.toHaveBeenCalled()
  const entry = ctx.loader.resolve(id)
  await entry.update({ disabled: false })
  await ctx.loader.await()
  expect(entry.disabled).toBe(false)
  expect(apply).toHaveBeenCalledTimes(1)
})

it('installs policy at boot and preserves it across Include refresh and nested entries', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-company-privacy-'))
  onTestFinished(() => rmSync(dir, { recursive: true, force: true }))
  const file = join(dir, 'cordis.yml')
  const config = (suffix: string) => JSON.stringify([
    { id: 'nested', name: 'cordis:group', group: true, config: COMPANY_BLOCKED_MODULES.map((name, index) => ({
      id: `renamed-${index}-${suffix}`, name, disabled: false, config: { enabled: true },
    })) },
  ])
  writeFileSync(file, config('before'))
  const ctx = await boot('privacy-test', file)
  onTestFinished(() => ctx.fiber.dispose())
  const assertBlocked = () => {
    const rows = [...ctx.loader.entries()].filter(entry => isCompanyBlockedModule(entry.options.name))
    expect(rows).toHaveLength(COMPANY_BLOCKED_MODULES.length)
    for (const entry of rows) {
      expect(entry.disabled).toBe(true)
      expect(entry.fiber).toBeUndefined()
    }
  }
  assertBlocked()
  const include = [...ctx.loader.entries()].find(entry => entry.subtree)?.subtree as Include
  writeFileSync(file, config('after'))
  await include.refresh()
  await ctx.loader.await()
  assertBlocked()
})
