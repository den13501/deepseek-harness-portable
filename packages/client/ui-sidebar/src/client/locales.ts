/** `sidebar` namespace dictionaries for shell controls and global panels. */

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'session.new': '新会话',
  'session.new.label': '新建会话',
  'toggle.open': '打开侧边栏',
  'toggle.collapse': '收起侧边栏',
  'panels.label': '全局面板',
} satisfies Record<string, string>

/** The sidebar namespace key union. */
export type SidebarKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'session.new': 'New Session',
  'session.new.label': 'New session',
  'toggle.open': 'Open sidebar',
  'toggle.collapse': 'Collapse sidebar',
  'panels.label': 'Global panels',
} satisfies Record<SidebarKey, string>

/** Traditional Chinese (Taiwan), checked against the existing dictionary keys. */
export const zhTW = {
  'session.new': '新對話',
  'session.new.label': '新建對話',
  'toggle.open': '開啟側邊欄',
  'toggle.collapse': '收起側邊欄',
  'panels.label': '全局面板',
} satisfies Record<keyof typeof zh, string>
