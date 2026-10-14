/** Locale bundles for the agent-preset hero chip, header label, and management section. */

import { guideEn, guideZh, type PresetGuideKey } from './guide-locales.ts'

/** Locale keys these surfaces render. */
export type AgentPresetSettingsKey =
  | PresetGuideKey
  | 'builtInGroup'
  | 'customGroup'
  | 'seatHint'
  | 'headerHint'
  | 'nav'
  | 'sectionIntro'
  | 'setDefault'
  | 'view'
  | 'presetStandardName'
  | 'presetStandardDescription'
  | 'presetPtcName'
  | 'presetPtcDescription'
  | 'presetMinimalName'
  | 'presetMinimalDescription'
  | 'presetCordisName'
  | 'presetCordisDescription'
  | 'inUse'
  | 'noDescription'
  | 'brokenBadge'
  | 'switchRefused'
  | 'standardUnavailable'
  | 'close'
  | 'creatorDraft'
  | 'createPlugin'
  | 'createPluginDescription'
  | 'createPluginChecking'
  | 'createPluginUnavailable'
  | 'createPluginMissing'

/** English copy. */
export const en: Record<AgentPresetSettingsKey, string> = {
  ...guideEn,
  builtInGroup: 'Built-in', customGroup: 'Custom',
  sectionIntro: 'Choose the agent’s tools and how it works. Use Standard mode for everyday tasks, or Creator mode to add capabilities to DSH.',

  seatHint: 'Choose the agent preset for your new task',
  headerHint: 'The agent preset chosen when this task started',
  nav: 'Agent presets',

  setDefault: 'Set as new task default',
  view: 'View configuration',

  presetStandardName: 'Standard mode',
  presetStandardDescription:
    'Work with code, files, and information. Suitable for most tasks, with search, editing, terminal commands, and other tools available as needed.',
  presetPtcName: 'PTC mode',
  presetPtcDescription:
    'Includes all Standard mode capabilities. Better suited to tasks that call tools in batches and then filter, organize, deduplicate, count, or summarize the results.',
  presetMinimalName: 'Minimal mode',
  presetMinimalDescription:
    'The agent works using only a terminal tool. Useful for testing and comparing its basic performance.',
  presetCordisName: 'Creator mode',
  presetCordisDescription:
    'Customize DSH through conversation. Let the agent write plugins that add features or UI, or combine tools and prompts to create your own mode.',

  inUse: 'New task default',

  noDescription: 'No description.',
  brokenBadge: 'Failed to load',

  switchRefused: 'Could not switch to {name}: {reason}',
  standardUnavailable: 'Standard mode is unavailable. Restore it or choose another available mode.',

  close: 'Close',

  creatorDraft: 'Let the agent help me create a preset',
  createPlugin: 'Let the agent create a plugin',
  createPluginDescription: 'Enter Creator mode and make your own DSH plugin',
  createPluginChecking: 'Checking whether Creator mode is available',
  createPluginUnavailable: 'Temporarily unavailable. Reopen this menu to retry',
  createPluginMissing: 'Creator mode is not included in this configuration',

}

/** Simplified Chinese copy. */
export const zh: Record<AgentPresetSettingsKey, string> = {
  ...guideZh,
  builtInGroup: '内置', customGroup: '自定义',
  sectionIntro: '选择 Agent 的工具和工作方式。日常任务用「标准模式」，扩展 DSH 的能力用「创造模式」。',

  seatHint: '选择新任务使用的 Agent 预设',
  headerHint: '本任务的 Agent 预设，在任务开始时确定',
  nav: 'Agent 预设',

  setDefault: '设为新任务默认',
  view: '查看配置',

  presetStandardName: '标准模式',
  presetStandardDescription: '处理代码、文件和资料，适合大多数任务。Agent 会按需使用检索、编辑和终端等工具。',
  presetPtcName: 'PTC 模式',
  presetPtcDescription: '包含标准模式的所有能力，更适合批量调用工具，并对结果进行筛选、整理、去重、统计或汇总的任务。',
  presetMinimalName: '极简模式',
  presetMinimalDescription: 'Agent 仅使用终端工具完成任务，适合测试和对比其基础表现。',
  presetCordisName: '创造模式',
  presetCordisDescription: '用对话定制 DSH：让 Agent 编写插件，添加新功能或界面；也能组合工具和提示词，创建自己的模式。',

  inUse: '新任务默认',

  noDescription: '暂无描述。',
  brokenBadge: '加载失败',

  switchRefused: '无法切换到「{name}」：{reason}',
  standardUnavailable: '标准模式不可用，请恢复该模式或选择其他可用模式。',

  close: '关闭',

  creatorDraft: '让 Agent 帮我创建预设模式',
  createPlugin: '让 Agent 创建插件',
  createPluginDescription: '进入创造模式，制作属于你的 DSH 插件',
  createPluginChecking: '正在确认创造模式是否可用',
  createPluginUnavailable: '暂时不可用，请重新打开菜单重试',
  createPluginMissing: '当前配置未提供创造模式',

}

// The resolution itself is the shared fold in `dsh-agent-preset-registry/display`,
// re-exported here so every surface in this plugin reads one path; the
// Settings plugin list inlines the same fold over this plugin's dictionaries.
export { isBuiltInPreset, presetDisplayText } from '@deepseek-ai/dsh-agent-preset-registry/display'
export type { PresetDisplaySource, PresetDisplayText } from '@deepseek-ai/dsh-agent-preset-registry/display'

/** Traditional Chinese (Taiwan), checked against the existing dictionary keys. */
export const zhTW = {
  'modeExplanation': '模式說明',
  'howToUse': '如何使用',
  'guideSections': '幫助內容',
  'guideExampleTask': '示例任務',
  'guideCopy': '複製',
  'guideCopied': '已複製',
  'guideFootnotes': '註腳',
  'guideStandardIntro': '新建任務時選擇「標準模式」，說明要完成什么、相關檔案在哪里，以及怎樣判斷任務完成。',
  'guideStandardExplanation': '### 工作方式\n\nAgent 直接呼叫工具來讀寫檔案、檢索資料和執行終端命令。包含 Skills、計劃、目標、子 Agent、工作流和上下文壓縮等能力。\n\n### 什么時候選\n\n日常編程、檔案處理和資料整理可以從這里開始。標準模式也能編寫腳本、批量處理檔案；PTC 改變的是工具呼叫方式，批量任務并不必須使用 PTC。',
  'guideStandardUsage': '### 修復一個問題\n\n> 搜尋表單連續提交兩次後，結果會消失。請定位原因、修復問題并執行相關測試，最後說明原因和修改內容。\n\n預期產出：程式碼修改、相關測試結果，以及問題原因說明。\n\n### 整理項目資料\n\n> 閱讀項目中的 Markdown 記錄，整理已經達成的結論和仍待確認的問題，并附上對應檔案連結。\n\n預期產出：一份帶來源引用的總結，方便回到原文核對。',
  'guidePtcIntro': '新建任務時選擇「PTC 模式」，說明輸入檔案、處理規則和輸出格式。程式碼由 Agent 編寫。',
  'guidePtcExplanation': '### 怎樣呼叫工具\n\nPTC 是 Programmatic Tool Calling，即透過程序呼叫工具。目前內建預設讓 Agent 透過 run_code 編寫 TypeScript 程序，使用生成的工具 SDK 發起呼叫。程序可以組織循環、條件判斷、錯誤處理，以及適合并發執行的呼叫。\n\n### 哪些結果交給模型\n\n工具返回的資料先交給程序，經過篩選、計算或合并，再透過輸出或返回值交給模型；圖片結果會另行附加。程序中的工具呼叫仍會被記錄，也仍受工具權限約束。\n\n### 與標準模式的區別\n\n兩種模式都能編程、批量處理檔案。標準模式直接向模型提供各個工具；PTC 讓模型用程式碼組織工具呼叫。目前 PTC 預設未啟用 workflow 工具。速度和 token 用量取決于具體任務與結果處理方式。',
  'guidePtcUsage': '### 批量檢查設定檔案\n\n> 檢查 configs/ 下所有 JSON 檔案，按照 schema.json 找出缺失字段和不合法的值。每個問題寫成 CSV 中的一行；讀取失敗的檔案也記入報告，繼續檢查其余檔案。保留原檔案。\n\n預期產出：問題匯總和一份 CSV 報告。程序可以對多份檔案執行相同檢查，處理單個檔案的失敗，再匯總結果。\n\n### 匯總錯誤日誌\n\n> 分析 logs/ 下的日誌，按服務和錯誤類型統計次數，列出出現最多的十類錯誤，每類保留一條示例。完整統計另存為 CSV。\n\n預期產出：高頻錯誤摘要和完整統計表。中間資料可以先在程序中聚合，再把匯總交給模型。',
  'guideMinimalIntro': '新建任務時選擇「極簡模式」。做對照測試時，保持模型、權限、任務輸入和工作區起始狀態一致。',
  'guideMinimalExplanation': '### 保留哪些能力\n\n僅提供一個持久 Shell 工具，并使用固定系統提示指令。內建預設不載入 Skills、計劃、上下文壓縮，也不注入標準執行時上下文。\n\n### 什么時候選\n\n適合作為實驗和對照測試的基線。Agent 仍能透過終端命令讀寫檔案、執行腳本，但缺少管理長任務的內建輔助能力。工具少，不代表對新手更容易。',
  'guideMinimalUsage': '### 對比基礎修復表現\n\n> 執行這個項目的測試，找出失敗原因，做最小修復，再執行相關測試并報告結果。\n\n分別用標準模式和極簡模式，從相同的工作區狀態執行這條任務，對比完成情況、工具呼叫和最終修改。極簡模式會透過終端命令完成這些操作。',
  'guideCordisIntro': '新建任務時選擇「創造模式」，說明希望增加什么能力、從哪里使用，以及怎樣驗證效果。',
  'guideCordisExplanation': '### 可以創造什么\n\n創造模式具備標準任務工具，并增加執行時檢查、持久化外掛管理，以及 Cordis 外掛和 Agent 預設的開發指引。可以編寫外掛來新增功能或介面，也可以組合工具和提示指令，建立適合特定任務的模式。\n\n### 外掛與模式的關系\n\n外掛為 DSH 增加能力，例如工具、服務連接或介面入口。模式是一份 Agent 預設，用來選擇任務可用的工具，并約定 Agent 的工作方式。自訂模式中也可以使用自己開發的外掛。\n\n### 怎樣讓成果生效\n\n可以要求 Agent 完成安裝并驗證實際效果。外掛可能即時載入，也可能需要重新啟動，取決于修改內容；新建的模式在建立新任務時選擇。',
  'guideCordisUsage': '### 新增一個介面\n\n> 幫我寫一個 DSH 外掛，在側欄增加「項目筆記」入口，列出目前工作區的 Markdown 檔案，點擊後能預覽內容。完成安裝并驗證頁面能開啟。\n\n預期產出：帶側欄入口和預覽頁的外掛，以及仍需完成的生效步驟。\n\n### 新增一個工具\n\n> 寫一個外掛，提供讀取項目測試報告、匯總失敗用例的工具。注冊工具，并用一份示例報告驗證呼叫結果。\n\n預期產出：可呼叫的新工具，以及一次示例呼叫的驗證結果。\n\n### 建立自己的模式\n\n> 基于標準模式建立「程式碼審查」模式，優先檢查潛在錯誤和測試缺口，指出檔案與行號，修改檔案前先詢問我。儲存成可選擇的預設。\n\n預期產出：可在新任務中選擇的自訂模式。審查要求用於指導 Agent，實際可執行的操作仍由權限設定決定。',
  'builtInGroup': '內建',
  'customGroup': '自訂',
  'sectionIntro': '選擇 Agent 的工具和工作方式。日常任務用「標準模式」，擴展 DSH 的能力用「創造模式」。',
  'seatHint': '選擇新任務使用的 Agent 預設',
  'headerHint': '本任務的 Agent 預設，在任務開始時確定',
  'nav': 'Agent 預設',
  'setDefault': '設為新任務預設',
  'view': '檢視設定',
  'presetStandardName': '標準模式',
  'presetStandardDescription': '處理程式碼、檔案和資料，適合大多數任務。Agent 會按需使用檢索、編輯和終端等工具。',
  'presetPtcName': 'PTC 模式',
  'presetPtcDescription': '包含標準模式的所有能力，更適合批量呼叫工具，并對結果進行篩選、整理、去重、統計或匯總的任務。',
  'presetMinimalName': '極簡模式',
  'presetMinimalDescription': 'Agent 僅使用終端工具完成任務，適合測試和對比其基礎表現。',
  'presetCordisName': '創造模式',
  'presetCordisDescription': '用對話定制 DSH：讓 Agent 編寫外掛，新增新功能或介面；也能組合工具和提示指令，建立自己的模式。',
  'inUse': '新任務預設',
  'noDescription': '暫無描述。',
  'brokenBadge': '載入失敗',
  'switchRefused': '無法切換到「{name}」：{reason}',
  'standardUnavailable': '標準模式不可用，請恢復該模式或選擇其他可用模式。',
  'close': '關閉',
  'creatorDraft': '讓 Agent 幫我建立預設模式',
  'createPlugin': '讓 Agent 建立外掛',
  'createPluginDescription': '進入創造模式，製作屬于你的 DSH 外掛',
  'createPluginChecking': '正在確認創造模式是否可用',
  'createPluginUnavailable': '暫時不可用，請重新開啟選單重試',
  'createPluginMissing': '目前設定未提供創造模式',
} satisfies Record<keyof typeof zh, string>
