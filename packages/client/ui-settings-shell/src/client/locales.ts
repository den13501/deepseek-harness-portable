/** Locale bundles for the shell executor's settings page. */

import type { SettingsFormLabels } from '@deepseek-ai/dsh-client-ui-primitives'

/** Locale keys the page renders. */
export type ShellSettingsLocaleKey =
  | 'title' | 'description'
  | 'timeoutMs' | 'timeoutMsHint' | 'maxOutputBytes' | 'maxOutputBytesHint'
  | 'overridden' | 'reset' | 'readOnly' | 'unavailable'
  | 'save' | 'saving' | 'saveFailed' | 'invalidNumber'

/** English copy. */
export const en: Record<ShellSettingsLocaleKey, string> = {
  title: 'Shell',
  description: 'Limit how long each command may run and how much it may output.',
  timeoutMs: 'Command timeout (ms)',
  timeoutMsHint: 'How long one command may run before it is terminated.',
  maxOutputBytes: 'Output cap per stream (bytes)',
  maxOutputBytesHint: 'Output beyond this spills to a temporary file rather than being lost.',
  overridden: 'Overridden',
  reset: 'Reset to default',
  readOnly: 'This deployment stores settings read-only.',
  unavailable: 'This plugin is not loaded, so it cannot be configured right now.',
  save: 'Save',
  saving: 'Saving…',
  saveFailed: 'The deployment did not accept these values; they were left for you to correct.',
  invalidNumber: 'Enter a number, or leave blank to use the default.',
}

/** Simplified Chinese copy. */
export const zh: Record<ShellSettingsLocaleKey, string> = {
  title: '终端',
  description: '限制每条命令最多能跑多久、最多输出多少内容。',
  timeoutMs: '命令超时（毫秒）',
  timeoutMsHint: '单条命令允许运行多久，超时即终止。',
  maxOutputBytes: '单流输出上限（字节）',
  maxOutputBytesHint: '超出部分会转存到临时文件，而不是被丢弃。',
  overridden: '已覆盖',
  reset: '恢复默认',
  readOnly: '本部署的设置为只读。',
  unavailable: '该插件当前未加载，暂时无法配置。',
  save: '保存',
  saving: '保存中…',
  saveFailed: '本部署没有接受这些值，已保留供你修改。',
  invalidNumber: '请填数字；留空表示使用默认值。',
}

/**
 * The form frame's copy, read from this page's dictionary.
 * @param t - the page's locale reader.
 * @returns the labels the shared settings form renders.
 */
export function formLabels(t: (key: ShellSettingsLocaleKey) => string): SettingsFormLabels {
  return { unavailable: t('unavailable'), readOnly: t('readOnly'), saveFailed: t('saveFailed'), save: t('save'), saving: t('saving') }
}

/** Traditional Chinese (Taiwan), checked against the existing dictionary keys. */
export const zhTW = {
  'title': '終端',
  'description': '限制每條命令最多能跑多久、最多輸出多少內容。',
  'timeoutMs': '命令超時（毫秒）',
  'timeoutMsHint': '單條命令允許執行多久，超時即終止。',
  'maxOutputBytes': '單流輸出上限（字節）',
  'maxOutputBytesHint': '超出部分會轉存到臨時檔案，而不是被丟棄。',
  'overridden': '已覆蓋',
  'reset': '恢復預設',
  'readOnly': '本部署的設定為唯讀。',
  'unavailable': '該外掛目前未載入，暫時無法設定。',
  'save': '儲存',
  'saving': '儲存中…',
  'saveFailed': '本部署沒有接受這些值，已保留供你修改。',
  'invalidNumber': '請填數字；留空表示使用預設值。',
} satisfies Record<keyof typeof zh, string>
