import { describe, expect, it } from 'vitest'
import { en, formatDesktopMessage, resolveDesktopLocale, resolveDesktopStartupLocale, zh, zhTW } from '../src/locale.ts'

describe('desktop locale dictionaries', () => {
  it('ships the same key set in English and Chinese', () => {
    expect(Object.keys(zh)).toEqual(Object.keys(en))
    expect(Object.keys(zhTW)).toEqual(Object.keys(en))
    expect(resolveDesktopLocale('zh-Hans-CN').messages).toEqual(zh)
    expect(resolveDesktopLocale('en-US').messages).toEqual(en)
    expect(resolveDesktopLocale('fr-FR').messages).toEqual(en)
  })

  it('formats named values without consuming unknown placeholders', () => {
    expect(formatDesktopMessage('{name}@{version} {missing}', { name: 'plugin', version: '1.2.3' }))
      .toBe('plugin@1.2.3 {missing}')
  })

  it('prefers an explicit supported choice, then the first supported system language', () => {
    expect(resolveDesktopStartupLocale('zh', ['en-US']).id).toBe('zh-CN')
    expect(resolveDesktopStartupLocale('EN', ['zh-CN']).id).toBe('en')
    expect(resolveDesktopStartupLocale(null, ['ja-JP', 'zh-Hant', 'en-US']).id).toBe('zh-TW')
    expect(resolveDesktopStartupLocale(null, ['en-US', 'zh-CN']).id).toBe('en')
    expect(resolveDesktopStartupLocale(null, ['ja-JP']).id).toBe('en')
    expect(resolveDesktopStartupLocale(null, []).id).toBe('en')
    expect(resolveDesktopStartupLocale('ja', ['zh-CN']).id).toBe('zh-CN')
  })

  it.each(['zh-TW', 'zh-Hant', 'zh-Hant-TW', 'zh-HK', 'zh-MO'])('preserves Traditional Chinese for %s', (tag) => {
    expect(resolveDesktopLocale(tag)).toEqual({ id: 'zh-TW', messages: zhTW })
    expect(resolveDesktopStartupLocale(tag, ['en-US']).id).toBe('zh-TW')
    expect(resolveDesktopStartupLocale(null, [tag, 'en-US']).id).toBe('zh-TW')
  })

  it('preserves placeholders in the Taiwan dictionary', () => {
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      expect(zhTW[key].match(/\{\w+\}/gu) ?? [], key).toEqual(zh[key].match(/\{\w+\}/gu) ?? [])
    }
    expect(zhTW.copy).toBe('複製')
  })

})
