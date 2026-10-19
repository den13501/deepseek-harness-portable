/** Locale bundles for the web-search provider's settings page. */

import type { SettingsFormLabels } from '@deepseek-ai/dsh-client-ui-primitives'

/** Locale keys the page renders. */
export type WebSearchSettingsLocaleKey =
  | 'title' | 'description' | 'useSearchApi' | 'useSearchApiHint' | 'searchGuide' | 'searchGuideUrl'
  | 'apiKey' | 'apiKeyHint' | 'apiKeySet' | 'apiKeyUnset'
  | 'baseUrl' | 'baseUrlHint' | 'searchApiBaseUrl' | 'searchApiBaseUrlHint' | 'maxUses' | 'maxUsesHint' | 'count' | 'countHint'
  | 'overridden' | 'reset' | 'readOnly' | 'unavailable'
  | 'save' | 'saving' | 'saveFailed' | 'invalidNumber' | 'invalidCount'

/** English copy. */
export const en: Record<WebSearchSettingsLocaleKey, string> = {
  title: 'Web search',
  description: 'Set up the DeepSeek search provider.',
  useSearchApi: 'Use the new Web Search API',
  useSearchApiHint: 'Off by default: search runs through DeepSeek Messages. For the new Web Search API\'s features and pricing, see the ',
  searchGuide: 'Search & Fetch guide',
  searchGuideUrl: 'https://api-docs.deepseek.com/guides/search',
  apiKey: 'API key',
  apiKeyHint: 'Stored outside the settings file. Leave blank to keep the current key.',
  apiKeySet: 'A key is configured.',
  apiKeyUnset: 'No key is configured; only conversations using a DeepSeek Account model can search, through the default endpoint.',
  baseUrl: 'Messages API base URL',
  baseUrlHint: 'Include the API prefix, such as https://api.deepseek.com/anthropic/v1. The provider appends /messages. Leave blank to restore the default.',
  searchApiBaseUrl: 'Search / Fetch API base URL',
  searchApiBaseUrlHint: 'Include the API prefix, such as https://api.deepseek.com/v1/tools. The provider appends /search or /fetch. Leave blank to restore the default.',
  maxUses: 'Max searches per request',
  maxUsesHint: 'How many searches the auxiliary model may run within one Messages request. Applies only to the Messages API.',
  count: 'Results per search',
  countHint: 'Results returned per query: an integer from 1 to 50, default 10. This controls result count, not search calls. web_search keeps no more sources than its own result limit.',
  overridden: 'Overridden',
  reset: 'Reset to default',
  readOnly: 'This deployment stores settings read-only.',
  unavailable: 'This plugin is not loaded, so it cannot be configured right now.',
  save: 'Save',
  saving: 'Saving…',
  saveFailed: 'The deployment did not accept these values; they were left for you to correct.',
  invalidNumber: 'Enter a number, or leave blank to use the default.',
  invalidCount: 'Enter an integer from 1 to 50, or leave blank to use the default.',
}

/** Simplified Chinese copy. */
export const zh: Record<WebSearchSettingsLocaleKey, string> = {
  title: '网页搜索',
  description: '设置 DeepSeek 的搜索提供方。',
  useSearchApi: '启用新版 Web 搜索 API',
  useSearchApiHint: '默认关闭，搜索通过 DeepSeek Messages 完成。新版 Web 搜索 API 功能与计费详见',
  searchGuide: '网页搜索与抓取指南',
  searchGuideUrl: 'https://api-docs.deepseek.com/zh-cn/guides/search',
  apiKey: 'API Key',
  apiKeyHint: '不写入设置文件。留空表示保持当前密钥。',
  apiKeySet: '已配置密钥。',
  apiKeyUnset: '未配置密钥；仅使用 DeepSeek 账号模型的对话可以通过默认接口地址搜索。',
  baseUrl: 'Messages API 基础地址',
  baseUrlHint: '填写含 API 前缀的地址，例如 https://api.deepseek.com/anthropic/v1；程序追加 /messages，留空恢复默认。',
  searchApiBaseUrl: 'Search / Fetch API 基础地址',
  searchApiBaseUrlHint: '填写含 API 前缀的地址，例如 https://api.deepseek.com/v1/tools；程序追加 /search 或 /fetch，留空恢复默认。',
  maxUses: '单次请求最多搜索次数',
  maxUsesHint: '辅助模型在一次 Messages 请求内最多可执行的搜索次数，仅适用于 Messages API。',
  count: '每次搜索结果数',
  countHint: '每个查询返回的结果条数，须为 1–50 的整数，默认 10；不控制搜索调用次数。web_search 保留的来源数不超过其自身的结果上限。',
  overridden: '已覆盖',
  reset: '恢复默认',
  readOnly: '本部署的设置为只读。',
  unavailable: '该插件当前未加载，暂时无法配置。',
  save: '保存',
  saving: '保存中…',
  saveFailed: '本部署没有接受这些值，已保留供你修改。',
  invalidNumber: '请填数字；留空表示使用默认值。',
  invalidCount: '请填 1–50 的整数；留空表示使用默认值。',
}

/**
 * The form frame's copy, read from this page's dictionary.
 * @param t - the page's locale reader.
 * @returns the labels the shared settings form renders.
 */
export function formLabels(t: (key: WebSearchSettingsLocaleKey) => string): SettingsFormLabels {
  return { unavailable: t('unavailable'), readOnly: t('readOnly'), saveFailed: t('saveFailed'), save: t('save'), saving: t('saving') }
}

/** Traditional Chinese (Taiwan), checked against the existing dictionary keys. */
export const zhTW = {
  'title': '網頁搜尋',
  'description': '設定 DeepSeek 的搜尋提供方。',
  'useSearchApi': '啟用新版網頁搜尋 API',
  'useSearchApiHint': '預設關閉，搜尋透過 DeepSeek Messages 執行。新版網頁搜尋 API 的功能與計費詳見',
  'searchGuide': '網頁搜尋與擷取指南',
  'searchGuideUrl': 'https://api-docs.deepseek.com/zh-cn/guides/search',
  'apiKey': 'API Key',
  'apiKeyHint': '不寫入設定檔案。留空表示保持目前金鑰。',
  'apiKeySet': '已設定金鑰。',
  'apiKeyUnset': '未設定金鑰；僅使用 DeepSeek 帳號模型的對話可以透過預設介面位址搜尋。',
  'baseUrl': 'Messages API 基底網址',
  'baseUrlHint': '填入含 API 前綴的網址，例如 https://api.deepseek.com/anthropic/v1；程式會附加 /messages，留空則恢復預設值。',
  'searchApiBaseUrl': 'Search / Fetch API 基底網址',
  'searchApiBaseUrlHint': '填入含 API 前綴的網址，例如 https://api.deepseek.com/v1/tools；程式會附加 /search 或 /fetch，留空則恢復預設值。',
  'maxUses': '單次請求最多搜尋次數',
  'maxUsesHint': '輔助模型在一次 Messages 請求內最多可執行的搜尋次數，僅適用於 Messages API。',
  'count': '每次搜尋結果數',
  'countHint': '每個查詢傳回的結果筆數，須為 1–50 的整數，預設為 10；不控制搜尋呼叫次數。web_search 保留的來源數不超過其本身的結果上限。',
  'overridden': '已覆蓋',
  'reset': '恢復預設',
  'readOnly': '本部署的設定為唯讀。',
  'unavailable': '該外掛目前未載入，暫時無法設定。',
  'save': '儲存',
  'saving': '儲存中…',
  'saveFailed': '本部署沒有接受這些值，已保留供你修改。',
  'invalidNumber': '請填數字；留空表示使用預設值。',
  'invalidCount': '請填入 1–50 的整數；留空表示使用預設值。',
} satisfies Record<keyof typeof zh, string>
