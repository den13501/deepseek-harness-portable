// @vitest-environment jsdom
/** Taiwan selection is distinct from legacy Simplified Chinese and preserves user data. */
import { Context } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { stubConfigForm } from '@deepseek-ai/dsh-client-test-runtime'
import { LocaleRuntime } from '../src/client/index.ts'
import type { LocaleSettings } from '../src/locale-settings.ts'
import { zh, zhTW } from '../src/locales/zh.ts'
import * as chat from '../../ui-chat/src/client/locale.ts'
import * as conversation from '../../ui-conversation/src/client/locales.ts'
import * as plugins from '../../ui-plugin-manager/src/client/locales.ts'
import * as references from '../../ui-reference/src/client/locales.ts'
import * as models from '../../ui-settings-models/src/client/locales.ts'
import * as workspaces from '../../ui-workspace/src/client/locales.ts'
import * as secrets from '../../ui-secret-mask/src/client/locales.ts'
import * as inventory from '../../ui-settings-plugin-inventory/src/client/locales.ts'
import * as market from '../../ui-plugin-market/src/client/locales.ts'
import * as general from '../../ui-settings-general/src/client/locales.ts'
import * as webSearch from '../../ui-settings-web-search/src/client/locales.ts'
import * as modelLabel from '../../ui-deepseek-model-label-1017/src/client/locales.ts'
import { guideZh, guideZhTW } from '../../ui-agent-preset/src/client/guide-locales.ts'

afterEach(() => { vi.unstubAllGlobals() })

const updatedDictionaries: [string, Record<string, string>, Record<string, string>][] = [
  ['chat', chat.zh, chat.zhTW],
  ['conversation', conversation.zh, conversation.zhTW],
  ['plugins', plugins.zh, plugins.zhTW],
  ['references', references.zh, references.zhTW],
  ['models', models.zh, models.zhTW],
  ['workspaces', workspaces.zh, workspaces.zhTW],
  ['secrets', secrets.zh, secrets.zhTW],
  ['inventory', inventory.zh, inventory.zhTW],
  ['market', market.zh, market.zhTW],
  ['general', general.zh, general.zhTW],
  ['web search', webSearch.zh, webSearch.zhTW],
  ['model release label', modelLabel.zh, modelLabel.zhTW],
  ['preset guide', guideZh, guideZhTW],
]

describe('Traditional Chinese (Taiwan)', () => {
  it.each(updatedDictionaries)('keeps %s keys and interpolation parameters aligned', (_name, source, translated) => {
    expect(Object.keys(translated).sort()).toEqual(Object.keys(source).sort())
    for (const [key, value] of Object.entries(source)) {
      expect(translated[key]?.match(/\{\w+\}/gu)?.sort() ?? [], key).toEqual(value.match(/\{\w+\}/gu)?.sort() ?? [])
    }
  })

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
