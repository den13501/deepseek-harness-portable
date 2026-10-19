/** Layout command labels. */
export const zh = { toggle: '展开／收起左侧栏' }
/** English labels for the same layout commands. */
export const en: Record<keyof typeof zh, string> = { toggle: 'Toggle left sidebar' }

/** Traditional Chinese (Taiwan), checked against the existing dictionary keys. */
export const zhTW = {
  'toggle': '展開／收起左側欄',
} satisfies Record<keyof typeof zh, string>
