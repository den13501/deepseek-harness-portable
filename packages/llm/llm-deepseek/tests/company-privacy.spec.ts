/** Real loopback inference remains functional without Harness log/inventory contributions. */
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import LlmRuntime from '@deepseek-ai/dsh-llm'
import DeepSeekLlmApiExtensionRegistry from '@deepseek-ai/dsh-deepseek-llm-api-extensions'
import * as DeepSeek from '@deepseek-ai/dsh-llm-deepseek-api-key'
import { expect, it, onTestFinished, vi } from 'vitest'
import { installCompanyPrivacyPolicy } from '../../../boot/app-boot/src/company-privacy-policy.ts'
import { assemble, options, server } from './helpers.ts'

it('sends normal messages but no Session Log or plugin inventory over HTTP', async () => {
  const home = await mkdtemp(join(tmpdir(), 'dsh-company-inference-'))
  const fixture = await server()
  const ctx = new Context()
  onTestFinished(async () => {
    await ctx.fiber.dispose()
    await fixture.close()
    await rm(home, { recursive: true, force: true })
    vi.unstubAllEnvs()
  })
  vi.stubEnv('DSH_HOME', home)
  vi.stubEnv('DEEPSEEK_API_KEY', 'synthetic-test-key')
  await ctx.plugin(Loader)
  installCompanyPrivacyPolicy(ctx)
  await ctx.plugin(LlmRuntime)
  await ctx.plugin(DeepSeekLlmApiExtensionRegistry)
  await ctx.plugin(DeepSeek, { baseURL: fixture.url })
  for (const name of ['@deepseek-ai/dsh-session-log-deepseek', '@deepseek-ai/dsh-plugin-package-inventory-deepseek']) {
    await ctx.loader.create({ name, disabled: false, config: { enabled: true } })
  }
  const result = await assemble(ctx.llm.stream(options()))
  expect(result.assembler.finish.kind).toBe('stop')
  expect(fixture.requests).toHaveLength(1)
  expect(fixture.requests[0]!.body).toMatchObject({ messages: [{ role: 'user', content: [{ type: 'text', text: 'hello' }] }] })
  expect(fixture.requests[0]!.body).not.toHaveProperty('dsh_session_log')
  expect(fixture.requests[0]!.body).not.toHaveProperty('dsh_plugin_packages')
})
