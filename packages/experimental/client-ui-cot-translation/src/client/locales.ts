/** Locale-owned copy for reasoning translation and its preferences. */
import type { SettingsFormLabels } from '@deepseek-ai/dsh-client-ui-primitives'

/** Dictionary namespace for this plugin. */
export const NS = 'cotTranslation'

/** English copy and key source. */
export const en = {
  provider: 'Translation service', google: 'Google', bing: 'Bing',
  deepseekAccount: 'DeepSeek Flash — Account (paid)', deepseekOfficial: 'DeepSeek Flash — Official API (paid)',
  providerUnavailableOption: '{provider} — unavailable',
  providerUnavailable: 'This provider is unavailable. Configure your DeepSeek account or Official API provider, or choose an available service.',
  paidNotice: 'Each uncached fragment sends a separate paid DeepSeek Flash request through the selected account or Official API credentials. Reopening reasoning reuses saved results; changing the provider, language, source text, or request settings may send a new paid request.',
  anonymousNotice: 'Bing and Google need no translation login or API key. Their anonymous endpoints may reject or limit requests.', targetLanguage: 'Target language',
  targetLanguageHint: 'auto follows the UI language; language codes such as zh, en, and ja also work.',
  privacy: 'Expanded reasoning is sent to the selected service. It may contain private code or conversation details.',
  translation: 'View translation', original: 'View original', retry: 'Retry', failed: 'Translation failed. Showing the original.',
  translating: 'Translating reasoning', invalidProvider: 'Choose a translation service.', invalidLanguage: 'Enter auto or a language code, such as zh, en, or ja.',
  overridden: 'Overridden', reset: 'Reset to default',
  unavailable: 'Translation preferences are unavailable.', readOnly: 'This deployment stores settings read-only.',
  saveFailed: 'The deployment did not accept these values; they were left for you to correct.', save: 'Save', saving: 'Saving…',
  copy: 'Copy', copied: 'Copied', codeTitle: 'Code block', wrap: 'Wrap lines', unwrap: 'Unwrap lines', footnotes: 'Footnotes',
}

/** Locale dictionary key union. */
export type CotTranslationKey = keyof typeof en

/** Chinese copy. */
export const zh: Record<CotTranslationKey, string> = {
  provider: '翻译服务', google: 'Google', bing: 'Bing',
  deepseekAccount: 'DeepSeek Flash · 账号（付费）', deepseekOfficial: 'DeepSeek Flash · 官方 API（付费）',
  providerUnavailableOption: '{provider} — 不可用',
  providerUnavailable: '此服务暂不可用，请配置 DeepSeek 账号或官方 API 服务，或选择可用的翻译服务',
  paidNotice: '每个未缓存片段都会通过所选账号或官方 API 凭据单独发送一次付费的 DeepSeek Flash 请求；重新展开会复用已保存的译文，更改服务、语言、原文或请求设置可能发送新的付费请求',
  anonymousNotice: 'Bing 和 Google 翻译无需额外登录或 API key，但匿名接口可能拒绝或限制请求', targetLanguage: '目标语言',
  targetLanguageHint: 'auto 使用界面语言；也可填写语言代码，例如 zh、en、ja',
  privacy: '展开的思考内容会发送给所选翻译服务，可能包含私有代码或对话细节。',
  translation: '查看译文', original: '查看原文', retry: '重试', failed: '翻译暂不可用，已显示原文',
  translating: '正在翻译思考内容', invalidProvider: '请选择翻译服务', invalidLanguage: '请填写 auto 或语言代码，例如 zh、en、ja',
  overridden: '已覆盖', reset: '恢复默认',
  unavailable: '翻译设置暂不可用', readOnly: '本部署的设置为只读',
  saveFailed: '本部署没有接受这些值，已保留供你修改', save: '保存', saving: '保存中…',
  copy: '复制', copied: '已复制', codeTitle: '代码块', wrap: '自动换行', unwrap: '不换行', footnotes: '脚注',
}

/**
 * Read shared form chrome from the plugin dictionary.
 * @param t - current locale reader.
 * @returns localized form labels.
 */
export function formLabels(t: (key: CotTranslationKey) => string): SettingsFormLabels {
  return { unavailable: t('unavailable'), readOnly: t('readOnly'), saveFailed: t('saveFailed'), save: t('save'), saving: t('saving') }
}

/** Traditional Chinese (Taiwan), checked against the existing dictionary keys. */
export const zhTW = {
  'provider': '翻譯服務',
  'google': 'Google',
  'bing': 'Bing',
  'deepseekAccount': 'DeepSeek Flash · 帳號（付費）',
  'deepseekOfficial': 'DeepSeek Flash · 官方 API（付費）',
  'providerUnavailableOption': '{provider} — 不可用',
  'providerUnavailable': '此服務暫不可用，請設定 DeepSeek 帳號或官方 API 服務，或選擇可用的翻譯服務',
  'paidNotice': '每個未快取片段都會透過所選帳號或官方 API 憑據單獨發送一次付費的 DeepSeek Flash 請求；重新展開會復用已儲存的譯文，更改服務、語言、原文或請求設定可能發送新的付費請求',
  'anonymousNotice': 'Bing 和 Google 翻譯無需額外登入或 API key，但匿名介面可能拒絕或限制請求',
  'targetLanguage': '目標語言',
  'targetLanguageHint': 'auto 使用介面語言；也可填寫語言程式碼，例如 zh、en、ja',
  'privacy': '展開的思考內容會發送給所選翻譯服務，可能包含私有程式碼或對話細節。',
  'translation': '檢視譯文',
  'original': '檢視原文',
  'retry': '重試',
  'failed': '翻譯暫不可用，已顯示原文',
  'translating': '正在翻譯思考內容',
  'invalidProvider': '請選擇翻譯服務',
  'invalidLanguage': '請填寫 auto 或語言程式碼，例如 zh、en、ja',
  'overridden': '已覆蓋',
  'reset': '恢復預設',
  'unavailable': '翻譯設定暫不可用',
  'readOnly': '本部署的設定為唯讀',
  'saveFailed': '本部署沒有接受這些值，已保留供你修改',
  'save': '儲存',
  'saving': '儲存中…',
  'copy': '複製',
  'copied': '已複製',
  'codeTitle': '程式碼區塊',
  'wrap': '自動換行',
  'unwrap': '不換行',
  'footnotes': '註腳',
} satisfies Record<keyof typeof zh, string>
