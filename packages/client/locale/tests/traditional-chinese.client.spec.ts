// @vitest-environment jsdom
/** Taiwan selection is distinct from legacy Simplified Chinese and preserves user data. */
import { Context } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { stubConfigForm } from '@deepseek-ai/dsh-client-test-runtime'
import { LocaleRuntime } from '../src/client/index.ts'
import type { LocaleSettings } from '../src/locale-settings.ts'
import { zh, zhTW } from '../src/locales/zh.ts'

afterEach(() => { vi.unstubAllGlobals() })

describe('Traditional Chinese (Taiwan)', () => {
  it.each(['zh-TW', 'zh-Hant', 'zh-Hant-TW', 'zh-HK', 'zh-MO'])('detects %s before the generic Chinese fallback', async (tag) => {
    const ctx = new Context()
    try {
      const locale = new LocaleRuntime(ctx, undefined, { languages: [tag, 'en'], preference: null })
      expect(locale.getSnapshot().active).toBe('zh-TW')
    } finally { await ctx.fiber.dispose() }
  })

  it('keeps Simplified Chinese selectable and persists the explicit Taiwan choice', async () => {
    const ctx = new Context()
    const host = stubConfigForm<LocaleSettings>()
    try {
      const locale = new LocaleRuntime(ctx, host.scope, { languages: ['zh-CN'], preference: null })
      expect(locale.getSnapshot().active).toBe('zh')
      locale.register('common', 'zh', zh)
      locale.register('common', 'zh-TW', zhTW)
      locale.setLocale('zh-TW')
      expect(host.set).toHaveBeenCalledWith('preference', 'zh-TW')
      expect(locale.bind('common')('workspace.defaultName')).toBe('預設工作區')
      expect(locale.resolveText('用户提供的文字')).toBe('用户提供的文字')
      locale.setLocale('zh')
      expect(locale.bind('common')('workspace.defaultName')).toBe('默认工作区')
    } finally { await ctx.fiber.dispose() }
  })

  it('ships identical common keys and interpolation parameters', () => {
    expect(Object.keys(zhTW)).toEqual(Object.keys(zh))
    for (const key of Object.keys(zh) as (keyof typeof zh)[]) {
      expect(zhTW[key].match(/\{\w+\}/gu) ?? [], key).toEqual(zh[key].match(/\{\w+\}/gu) ?? [])
    }
  })
})
