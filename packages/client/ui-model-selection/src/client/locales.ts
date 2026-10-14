/**
 * `model` namespace dictionaries.
 *
 * `trigger.selectAria` intentionally matches `trigger.fallback` but remains a
 * separate key: the visible fallback label and the accessible name of
 * an unset trigger are free to diverge per locale, and folding it into
 * `trigger.aria` would announce the degenerate "Select model, current Select
 * model".
 */

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'provider.account': 'DeepSeek 账号',
  'command.label': '模型',
  'command.description': '选择本会话使用的模型',
  'option.loadError': '目录加载失败：{message}',
  'trigger.fallback': '请选择模型',
  'trigger.loading': '正在加载模型…',
  'trigger.selectAria': '请选择模型',
  'trigger.aria': '选择模型，当前 {model}',
  'trigger.ariaEffort': '选择模型，当前 {model}，推理等级 {effort}',
  'menu.aria': '模型与推理等级',
  'menu.model': '模型',
  'menu.effort': '推理等级',
  'effort.providerDefault': 'Default',
  'status.loading': '正在刷新模型列表…',
  'error.action': '模型操作失败：{message}',
  'error.sessionInUse': '当前会话已被占用，可能是其他正在运行的 DSH 导致的（如其他 dsh web、桌面端），请退出其他正在运行的 DSH 后重试。',
  'action.reload': '重新加载',
  'warning.groupLoad': '{name} 加载失败：{message}',
  'search.placeholder': '搜索模型…',
  'search.clear': '清除搜索',
  'search.empty': '没有匹配的模型。',
  'empty.models': '暂无可用模型',
  'empty.efforts': '当前模型未提供推理等级。',
} satisfies Record<string, string>

/** The model namespace key union. */
export type ModelKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'provider.account': 'DeepSeek Account',
  'command.label': 'Model',
  'command.description': 'Select the model for this conversation',
  'option.loadError': 'Catalog failed to load: {message}',
  'trigger.fallback': 'Select model',
  'trigger.loading': 'Loading models…',
  'trigger.selectAria': 'Select model',
  'trigger.aria': 'Select model, current {model}',
  'trigger.ariaEffort': 'Select model, current {model}, reasoning effort {effort}',
  'menu.aria': 'Model and reasoning effort',
  'menu.model': 'Model',
  'menu.effort': 'Effort',
  'effort.providerDefault': 'Default',
  'status.loading': 'Refreshing model list…',
  'error.action': 'Model operation failed: {message}',
  'error.sessionInUse': 'This session is already in use, possibly by another running DSH instance (such as dsh web or the desktop app). Quit other running DSH instances and try again.',
  'action.reload': 'Reload',
  'warning.groupLoad': '{name} failed to load: {message}',
  'search.placeholder': 'Search models…',
  'search.clear': 'Clear search',
  'search.empty': 'No matching models.',
  'empty.models': 'No models available.',
  'empty.efforts': 'This model provides no reasoning effort levels.',
} satisfies Record<ModelKey, string>

/** Traditional Chinese (Taiwan), checked against the existing dictionary keys. */
export const zhTW = {
  'provider.account': 'DeepSeek 帳號',
  'command.label': '模型',
  'command.description': '選擇本對話使用的模型',
  'option.loadError': '目錄載入失敗：{message}',
  'trigger.fallback': '請選擇模型',
  'trigger.loading': '正在載入模型…',
  'trigger.selectAria': '請選擇模型',
  'trigger.aria': '選擇模型，目前 {model}',
  'trigger.ariaEffort': '選擇模型，目前 {model}，推理等級 {effort}',
  'menu.aria': '模型與推理等級',
  'menu.model': '模型',
  'menu.effort': '推理等級',
  'effort.providerDefault': 'Default',
  'status.loading': '正在重新整理模型列表…',
  'error.action': '模型操作失敗：{message}',
  'error.sessionInUse': '目前對話已被占用，可能是其他正在執行的 DSH 導致的（如其他 dsh web、桌面端），請結束其他正在執行的 DSH 後重試。',
  'action.reload': '重新載入',
  'warning.groupLoad': '{name} 載入失敗：{message}',
  'search.placeholder': '搜尋模型…',
  'search.clear': '清除搜尋',
  'search.empty': '沒有匹配的模型。',
  'empty.models': '暫無可用模型',
  'empty.efforts': '目前模型未提供推理等級。',
} satisfies Record<keyof typeof zh, string>
