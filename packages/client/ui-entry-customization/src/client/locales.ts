/** Copy for the More menu rows: navigation actions, and Creator draft prompts per region. */
export const en = {
  install: 'Browse other plugins',
  create: 'Create your plugin',
  'createPrompt.sidebar': 'Create a DSH plugin with a left sidebar entry.',
  'createPrompt.conversation': 'Create a DSH conversation view plugin.',
  'createPrompt.rightbar': 'Create a DSH plugin with a right sidebar entry.',
} as const

/** Chinese counterpart of the entry-customization dictionary. */
export const zh: Record<keyof typeof en, string> = {
  install: '浏览更多插件',
  create: '创建你的插件',
  'createPrompt.sidebar': '创建一个带左侧栏入口的 DSH 插件。',
  'createPrompt.conversation': '创建一个 DSH 会话视图插件。',
  'createPrompt.rightbar': '创建一个带右侧栏入口的 DSH 插件。',
}

/** Traditional Chinese (Taiwan), checked against the existing dictionary keys. */
export const zhTW = {
  install: '瀏覽更多外掛',
  create: '建立你的外掛',
  'createPrompt.sidebar': '建立一個帶左側欄入口的 DSH 外掛。',
  'createPrompt.conversation': '建立一個 DSH 對話檢視外掛。',
  'createPrompt.rightbar': '建立一個帶右側欄入口的 DSH 外掛。',
} satisfies Record<keyof typeof en, string>
