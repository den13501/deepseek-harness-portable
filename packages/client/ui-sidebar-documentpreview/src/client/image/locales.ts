import { zoomEn, zoomZh } from '../zoom/locales.ts'

/** Locale-owned image renderer labels and status text. */
export const zh = {
  ...zoomZh,
  title: '图片',
  preview: '图片预览：{name}',
  loading: '文档渲染中...',
  failed: '无法显示这张图片',
  unsupported: '图片预览需要完整文件内容',
} satisfies Record<string, string>

/** Image renderer dictionary keys. */
export type ImagePreviewKey = keyof typeof zh

/** English dictionary with the same keys as the Chinese dictionary. */
export const en = {
  ...zoomEn,
  title: 'Image',
  preview: 'Image preview: {name}',
  loading: 'Rendering document...',
  failed: 'This image could not be displayed.',
  unsupported: 'Image preview requires the complete file contents.',
} satisfies Record<ImagePreviewKey, string>

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Image preview selection, accessible name, and status text. */
    sidebarImage: ImagePreviewKey
  }
}

/** Traditional Chinese (Taiwan), checked against the existing dictionary keys. */
export const zhTW = {
  'zoomControls': '縮放控件',
  'zoomMenu': '選擇縮放比例',
  'zoomOut': '縮小',
  'zoomIn': '放大',
  'zoomFitWidth': '適應寬度',
  'zoomValue': '{percent}%',
  'title': '圖片',
  'preview': '圖片預覽：{name}',
  'loading': '文件渲染中...',
  'failed': '無法顯示這張圖片',
  'unsupported': '圖片預覽需要完整檔案內容',
} satisfies Record<keyof typeof zh, string>
