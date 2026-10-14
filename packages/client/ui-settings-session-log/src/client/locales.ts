/** Copy for the API Session-log upload preference. */
export const en = {
  title: 'Upload Session Log when using the official model API',
  description: 'Help improve DeepSeek models and products.',
  saved: 'Preference saved',
  failed: 'Could not save preference',
}

/** Chinese preference copy. */
export const zh: Record<keyof typeof en, string> = {
  title: '在使用官方模型 API 时上传 Session Log',
  description: '帮助改进 DeepSeek 模型与产品',
  saved: '设置已保存',
  failed: '无法保存设置',
}

/** Traditional Chinese (Taiwan), checked against the existing dictionary keys. */
export const zhTW = {
  'title': '在使用官方模型 API 時上傳 Session Log',
  'description': '幫助改進 DeepSeek 模型與產品',
  'saved': '設定已儲存',
  'failed': '無法儲存設定',
} satisfies Record<keyof typeof zh, string>
