/** Locale-owned Browser tab copy. */
export const zh = {
  'type.label': '浏览器',
  'guide.title': '浏览器',
  'guide.description': '浏览网页',
  'shortcut.noSession': '请先打开一个会话',
  'address.placeholder': '输入 HTTP(S) 地址',
  'address.changed': 'URL 已变化',
  back: '后退',
  forward: '前进',
  reload: '刷新',
  go: '前往',
  external: '在系统浏览器中打开',
  'sandbox.disable': '关闭沙箱限制',
  'sandbox.enable': '恢复沙箱限制',
  'sandbox.warning': '沙箱限制已关闭；页面可以导航顶层应用，并使用下载、模态对话框与输入锁定。',
  start: '输入 HTTP(S) 地址开始浏览',
  loading: '正在打开…',
  'restore.previous': '上次打开',
  'restore.action': '恢复页面',
  'error.empty': '请输入地址。',
  'error.invalid': '这个地址无效或过长。',
  'error.protocol': '只支持 HTTP 和 HTTPS 地址；本地文件请使用文档预览。',
  'error.credentials': '地址不能包含用户名或密码。',
  'error.application-origin': '不能在嵌入浏览器中打开 DSH 应用自身。',
  'load.failed': '页面加载失败；请刷新重试或在系统浏览器中打开。',
  'load.failed.detail': '页面加载失败 ({code}): {description}',
  'address.unknown': '页面已跳转；当前载体无法读取新的 URL。',
} satisfies Record<string, string>

/** Browser dictionary key union. */
export type SidebarBrowserKey = keyof typeof zh

/** English dictionary with the same keys. */
export const en = {
  'type.label': 'Browser',
  'guide.title': 'Browser',
  'guide.description': 'Browse web pages',
  'shortcut.noSession': 'Open a session first',
  'address.placeholder': 'Enter an HTTP(S) address',
  'address.changed': 'URL changed',
  back: 'Back',
  forward: 'Forward',
  reload: 'Reload',
  go: 'Go',
  external: 'Open in system browser',
  'sandbox.disable': 'Disable sandbox restrictions',
  'sandbox.enable': 'Restore sandbox restrictions',
  'sandbox.warning': 'Sandbox restrictions are disabled; the page can navigate the top-level app and use downloads, modal dialogs, and input locks.',
  start: 'Enter an HTTP(S) address to start browsing',
  loading: 'Opening…',
  'restore.previous': 'Previously opened',
  'restore.action': 'Restore page',
  'error.empty': 'Enter an address.',
  'error.invalid': 'That address is invalid or too long.',
  'error.protocol': 'Only HTTP and HTTPS addresses are supported; use Document Preview for local files.',
  'error.credentials': 'Addresses cannot contain a username or password.',
  'error.application-origin': 'The embedded browser cannot open the DSH application itself.',
  'load.failed': 'The page could not load; reload or open it in the system browser.',
  'load.failed.detail': 'Page load failed ({code}): {description}',
  'address.unknown': 'The page navigated; this carrier cannot read its new URL.',
} satisfies Record<SidebarBrowserKey, string>

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Sidebar Browser labels, navigation controls, and failures. */
    sidebarBrowser: SidebarBrowserKey
  }
}

/** Traditional Chinese (Taiwan), checked against the existing dictionary keys. */
export const zhTW = {
  'type.label': '瀏覽器',
  'guide.title': '瀏覽器',
  'guide.description': '瀏覽網頁',
  'shortcut.noSession': '請先開啟一個對話',
  'address.placeholder': '輸入 HTTP(S) 位址',
  'address.changed': 'URL 已變化',
  'back': '後退',
  'forward': '前進',
  'reload': '重新整理',
  'go': '前往',
  'external': '在系統瀏覽器中開啟',
  'sandbox.disable': '關閉沙箱限制',
  'sandbox.enable': '恢復沙箱限制',
  'sandbox.warning': '沙箱限制已關閉；頁面可以導航頂層應用程式，并使用下載、模態對話框與輸入鎖定。',
  'start': '輸入 HTTP(S) 位址開始瀏覽',
  'loading': '正在開啟…',
  'restore.previous': '上次開啟',
  'restore.action': '恢復頁面',
  'error.empty': '請輸入位址。',
  'error.invalid': '這個位址無效或過長。',
  'error.protocol': '只支援 HTTP 和 HTTPS 位址；本機檔案請使用文件預覽。',
  'error.credentials': '位址不能包含使用者名或密碼。',
  'error.application-origin': '不能在嵌入瀏覽器中開啟 DSH 應用程式自身。',
  'load.failed': '頁面載入失敗；請重新整理重試或在系統瀏覽器中開啟。',
  'load.failed.detail': '頁面載入失敗 ({code}): {description}',
  'address.unknown': '頁面已跳轉；目前載體無法讀取新的 URL。',
} satisfies Record<keyof typeof zh, string>
