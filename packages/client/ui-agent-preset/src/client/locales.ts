/** Locale bundles for the agent-preset hero chip, header label, and management section. */

import { guideEn, guideJa, guideEs, guideFr, guideDe, guideRu, guidePt, guideZh, type PresetGuideKey } from './guide-locales.ts'

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
    'The agent uses a terminal and image reading, with context compaction. Useful for testing and comparing its basic performance.',
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
  presetMinimalDescription: 'Agent 使用终端和图片读取工具，并支持上下文压缩，适合测试和对比其基础表现。',
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
  'guideExampleTask': '範例任務',
  'guideCopy': '複製',
  'guideCopied': '已複製',
  'guideFootnotes': '註腳',
  'guideStandardIntro': '新建任務時選擇「標準模式」，說明要完成什麼、相關檔案在哪裡，以及怎樣判斷任務完成。',
  'guideStandardExplanation': '### 工作方式\n\nAgent 直接呼叫工具來讀寫檔案、檢索資料和執行終端命令。包含 Skills、計劃、目標、子 Agent、工作流和上下文壓縮等能力。\n\n### 什麼時候選\n\n日常編程、檔案處理和資料整理可以從這裡開始。標準模式也能編寫指令碼、批量處理檔案；PTC 改變的是工具呼叫方式，批量任務並不必須使用 PTC。',
  'guideStandardUsage': '### 修復一個問題\n\n> 搜尋表單連續提交兩次後，結果會消失。請定位原因、修復問題並執行相關測試，最後說明原因和修改內容。\n\n預期產出：程式碼修改、相關測試結果，以及問題原因說明。\n\n### 整理專案資料\n\n> 閱讀專案中的 Markdown 記錄，整理已經達成的結論和仍待確認的問題，並附上對應檔案連結。\n\n預期產出：一份帶來源引用的總結，方便回到原文核對。',
  'guidePtcIntro': '新建任務時選擇「PTC 模式」，說明輸入檔案、處理規則和輸出格式。程式碼由 Agent 編寫。',
  'guidePtcExplanation': '### 怎樣呼叫工具\n\nPTC 是 Programmatic Tool Calling，即透過程式呼叫工具。目前內建預設讓 Agent 透過 run_code 編寫 TypeScript 程式，使用生成的工具 SDK 發起呼叫。程式可以組織循環、條件判斷、錯誤處理，以及適合併發執行的呼叫。\n\n### 哪些結果交給模型\n\n工具返回的資料先交給程式，經過篩選、計算或合併，再透過輸出或返回值交給模型；圖片結果會另行附加。程式中的工具呼叫仍會被記錄，也仍受工具權限約束。\n\n### 與標準模式的區別\n\n兩種模式都能編程、批量處理檔案。標準模式直接向模型提供各個工具；PTC 讓模型用程式碼組織工具呼叫。目前 PTC 預設未啟用 workflow 工具。速度和 token 用量取決於具體任務與結果處理方式。',
  'guidePtcUsage': '### 批量檢查設定檔案\n\n> 檢查 configs/ 下所有 JSON 檔案，按照 schema.json 找出缺失欄位和不合法的值。每個問題寫成 CSV 中的一行；讀取失敗的檔案也記入報告，繼續檢查其餘檔案。保留原檔案。\n\n預期產出：問題匯總和一份 CSV 報告。程式可以對多份檔案執行相同檢查，處理單個檔案的失敗，再匯總結果。\n\n### 匯總錯誤日誌\n\n> 分析 logs/ 下的日誌，按服務和錯誤類型統計次數，列出出現最多的十類錯誤，每類保留一條範例。完整統計另存為 CSV。\n\n預期產出：高頻錯誤摘要和完整統計表。中間資料可以先在程式中聚合，再把匯總交給模型。',
  'guideMinimalIntro': '新建任務時選擇「極簡模式」。做對照測試時，保持模型、權限、任務輸入和工作區起始狀態一致。',
  'guideMinimalExplanation': '### 保留哪些能力\n\n提供持久 Shell 與 read_image 工具，並使用固定系統提示指令。讀取圖片需要支援圖片輸入的模型。上下文壓力達到門檻時，會自動壓縮較早的歷史；Agent 閒置時可輸入 /compact 手動壓縮。內建預設不載入 Skills、計畫，也不注入標準執行時上下文。\n\n### 什麼時候選\n\n適合作為實驗和對照測試的基線。Agent 仍能透過終端命令讀寫檔案、執行指令碼，但缺少管理長任務的內建輔助能力。工具少，不代表對新手更容易。',
  'guideMinimalUsage': '### 對比基礎修復表現\n\n> 執行這個專案的測試，找出失敗原因，做最小修復，再執行相關測試並報告結果。\n\n分別用標準模式和極簡模式，從相同的工作區狀態執行這條任務，對比完成情況、工具呼叫和最終修改。極簡模式會透過終端命令完成這些操作。',
  'guideCordisIntro': '新建任務時選擇「創造模式」，說明希望增加什麼能力、從哪裡使用，以及怎樣驗證效果。',
  'guideCordisExplanation': '### 可以創造什麼\n\n創造模式具備標準任務工具，並增加執行時檢查、持久化外掛管理，以及 Cordis 外掛和 Agent 預設的開發指引。可以編寫外掛來新增功能或介面，也可以組合工具和提示指令，建立適合特定任務的模式。\n\n### 外掛與模式的關係\n\n外掛為 DSH 增加能力，例如工具、服務連接或介面入口。模式是一份 Agent 預設，用來選擇任務可用的工具，並約定 Agent 的工作方式。自訂模式中也可以使用自己開發的外掛。\n\n### 怎樣讓成果生效\n\n可以要求 Agent 完成安裝並驗證實際效果。外掛可能即時載入，也可能需要重新啟動，取決於修改內容；新建的模式在建立新任務時選擇。',
  'guideCordisUsage': '### 新增一個介面\n\n> 幫我寫一個 DSH 外掛，在側欄增加「專案筆記」入口，列出目前工作區的 Markdown 檔案，點擊後能預覽內容。完成安裝並驗證頁面能開啟。\n\n預期產出：帶側欄入口和預覽頁的外掛，以及仍需完成的生效步驟。\n\n### 新增一個工具\n\n> 寫一個外掛，提供讀取專案測試報告、匯總失敗用例的工具。註冊工具，並用一份範例報告驗證呼叫結果。\n\n預期產出：可呼叫的新工具，以及一次範例呼叫的驗證結果。\n\n### 建立自己的模式\n\n> 基於標準模式建立「程式碼審查」模式，優先檢查潛在錯誤和測試缺口，指出檔案與行號，修改檔案前先詢問我。儲存成可選擇的預設。\n\n預期產出：可在新任務中選擇的自訂模式。審查要求用於指導 Agent，實際可執行的操作仍由權限設定決定。',
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
  'presetPtcDescription': '包含標準模式的所有能力，更適合批量呼叫工具，並對結果進行篩選、整理、去重、統計或匯總的任務。',
  'presetMinimalName': '極簡模式',
  'presetMinimalDescription': 'Agent 使用終端與圖片讀取工具，並支援上下文壓縮，適合測試和比較其基礎表現。',
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
  'createPluginDescription': '進入創造模式，製作屬於你的 DSH 外掛',
  'createPluginChecking': '正在確認創造模式是否可用',
  'createPluginUnavailable': '暫時不可用，請重新開啟選單重試',
  'createPluginMissing': '目前設定未提供創造模式',
} satisfies Record<keyof typeof zh, string>

/** Japanese copy, checked against the English keys. */
export const ja = {
  ...guideJa,
  'builtInGroup': '組み込み',
  'customGroup': 'カスタム',
  'sectionIntro': 'エージェントのツールと動作を選択します。日々のタスクには標準モードを、DSH に機能を追加するにはクリエイターモードを使用してください。',
  'seatHint': '新しいタスクで使用するエージェントプリセットを選択',
  'headerHint': 'このタスクの開始時に選択されたエージェントプリセット',
  'nav': 'エージェントプリセット',
  'setDefault': '新しいタスクの既定に設定',
  'view': '設定を表示',
  'presetStandardName': '標準モード',
  'presetStandardDescription': 'コード、ファイル、情報を扱います。検索、編集、ターミナルコマンドなどのツールを必要に応じて利用でき、ほとんどのタスクに適しています。',
  'presetPtcName': 'PTC モード',
  'presetPtcDescription': '標準モードのすべての機能を含みます。ツールを一括で呼び出し、その結果を絞り込み、整理、重複排除、集計、要約するタスクに適しています。',
  'presetMinimalName': '最小モード',
  'presetMinimalDescription': 'エージェントはターミナルと画像読み取りを使用し、コンテキスト圧縮にも対応します。基本的な性能のテストや比較に役立ちます。',
  'presetCordisName': 'クリエイターモード',
  'presetCordisDescription': '会話を通じて DSH をカスタマイズします。機能や UI を追加するプラグインをエージェントに書かせたり、ツールとプロンプトを組み合わせて独自のモードを作成したりできます。',
  'inUse': '新しいタスクの既定',
  'noDescription': '説明はありません。',
  'brokenBadge': '読み込みに失敗',
  'switchRefused': '{name} に切り替えられませんでした: {reason}',
  'standardUnavailable': '標準モードは利用できません。復元するか、利用可能な別のモードを選択してください。',
  'close': '閉じる',
  'creatorDraft': 'エージェントにプリセット作成を手伝ってもらう',
  'createPlugin': 'エージェントにプラグインを作成してもらう',
  'createPluginDescription': 'クリエイターモードに入り、独自の DSH プラグインを作成',
  'createPluginChecking': 'クリエイターモードが利用可能か確認中',
  'createPluginUnavailable': '一時的に利用できません。このメニューを開き直して再試行してください',
  'createPluginMissing': 'この構成にはクリエイターモードが含まれていません',
} satisfies Record<keyof typeof en, string>

/** Spanish dictionary, checked against the English keys. */
export const es = {
  ...guideEs,
  builtInGroup: 'Incorporado', customGroup: 'personalizado',
  sectionIntro: 'Elija las herramientas del agente y cómo funciona. Utilice el modo Estándar para las tareas diarias o el modo Creador para agregar capacidades a DSH.',

  seatHint: 'Elija el agente preestablecido para su nueva tarea',
  headerHint: 'El agente preestablecido elegido cuando comenzó esta tarea',
  nav: 'Ajustes preestablecidos del agente',

  setDefault: 'Establecer como nueva tarea predeterminada',
  view: 'Ver configuración',

  presetStandardName: 'Modo estándar',
  presetStandardDescription:
    'Trabaje con código, archivos e información. Adecuado para la mayoría de las tareas, con búsqueda, edición, comandos de terminal y otras herramientas disponibles según sea necesario.',
  presetPtcName: 'Modo PTC',
  presetPtcDescription:
    'Incluye todas las capacidades del modo Estándar. Más adecuado para tareas que llaman a herramientas en lotes y luego filtran, organizan, deduplican, cuentan o resumen los resultados.',
  presetMinimalName: 'modo mínimo',
  presetMinimalDescription:
    'El agente utiliza un terminal y lectura de imágenes, con compactación de contexto. Útil para probar y comparar su rendimiento básico.',
  presetCordisName: 'Modo creador',
  presetCordisDescription:
    'Personaliza DSH a través de la conversación. Deje que el agente escriba complementos que agreguen funciones o interfaz de usuario, o combine herramientas e indicaciones para crear su propio modo.',

  inUse: 'Nueva tarea predeterminada',

  noDescription: 'Sin descripción.',
  brokenBadge: 'No se pudo cargar',

  switchRefused: 'No se pudo cambiar a {name}: {reason}',
  standardUnavailable: 'El modo estándar no está disponible. Restáuralo o elige otro modo disponible.',

  close: 'Cerrar',

  creatorDraft: 'Deja que el agente me ayude a crear un preset',
  createPlugin: 'Deje que el agente cree un complemento',
  createPluginDescription: 'Ingrese al modo Creador y cree su propio complemento DSH',
  createPluginChecking: 'Comprobando si el modo Creador está disponible',
  createPluginUnavailable: 'Temporalmente no disponible. Vuelve a abrir este menú para volver a intentarlo.',
  createPluginMissing: 'El modo creador no está incluido en esta configuración.',

} satisfies Record<keyof typeof en, string>

/** French dictionary, checked against the English keys. */
export const fr = {
  ...guideFr,
  builtInGroup: 'Intégré', customGroup: 'Personnalisé',
  sectionIntro: 'Choisissez les outils de l’agent et son fonctionnement. Utilisez le mode Standard pour les tâches quotidiennes ou le mode Créateur pour ajouter des fonctionnalités à DSH.',

  seatHint: "Choisissez le préréglage d'agent pour votre nouvelle tâche",
  headerHint: "Le préréglage d'agent choisi au démarrage de cette tâche",
  nav: "Préréglages d'agent",

  setDefault: 'Définir comme nouvelle tâche par défaut',
  view: 'Afficher la configuration',

  presetStandardName: 'Mode standard',
  presetStandardDescription:
    'Travaillez avec du code, des fichiers et des informations. Convient à la plupart des tâches, avec recherche, édition, commandes de terminal et autres outils disponibles selon les besoins.',
  presetPtcName: 'Mode PTC',
  presetPtcDescription:
    'Inclut toutes les fonctionnalités du mode Standard. Mieux adapté aux tâches qui appellent des outils par lots, puis filtrent, organisent, dédupliquent, comptent ou résument les résultats.',
  presetMinimalName: 'Mode minimal',
  presetMinimalDescription:
    "L'agent utilise un terminal et une lecture d'image, avec compactage du contexte. Utile pour tester et comparer ses performances de base.",
  presetCordisName: 'Mode Créateur',
  presetCordisDescription:
    "Personnalisez DSH via la conversation. Laissez l'agent écrire des plugins qui ajoutent des fonctionnalités ou une interface utilisateur, ou combinez des outils et des invites pour créer votre propre mode.",

  inUse: 'Nouvelle tâche par défaut',

  noDescription: 'Aucune description.',
  brokenBadge: 'Échec du chargement',

  switchRefused: 'Impossible de passer à {name} : {reason}',
  standardUnavailable: "Le mode standard n'est pas disponible. Restaurez-le ou choisissez un autre mode disponible.",

  close: 'Fermer',

  creatorDraft: "Laissez l'agent m'aider à créer un préréglage",
  createPlugin: "Laissez l'agent créer un plugin",
  createPluginDescription: 'Entrez en mode Créateur et créez votre propre plugin DSH',
  createPluginChecking: 'Vérifier si le mode Créateur est disponible',
  createPluginUnavailable: 'Temporairement indisponible. Rouvrez ce menu pour réessayer',
  createPluginMissing: "Le mode Créateur n'est pas inclus dans cette configuration",

} satisfies Record<keyof typeof en, string>

/** German dictionary, checked against the English keys. */
export const de = {
  ...guideDe,
  builtInGroup: 'Eingebaut', customGroup: 'Benutzerdefiniert',
  sectionIntro: 'Wählen Sie die Tools des Agenten und deren Funktionsweise aus. Verwenden Sie den Standardmodus für alltägliche Aufgaben oder den Creator-Modus, um DSH Funktionen hinzuzufügen.',

  seatHint: 'Wählen Sie die Agentenvoreinstellung für Ihre neue Aufgabe',
  headerHint: 'Die Agentenvoreinstellung, die beim Start dieser Aufgabe ausgewählt wurde',
  nav: 'Agentenvoreinstellungen',

  setDefault: 'Als Standard für neue Aufgabe festlegen',
  view: 'Konfiguration anzeigen',

  presetStandardName: 'Standardmodus',
  presetStandardDescription:
    'Arbeiten Sie mit Code, Dateien und Informationen. Geeignet für die meisten Aufgaben, da bei Bedarf Suche, Bearbeitung, Terminalbefehle und andere Tools verfügbar sind.',
  presetPtcName: 'PTC-Modus',
  presetPtcDescription:
    'Beinhaltet alle Funktionen des Standardmodus. Besser geeignet für Aufgaben, bei denen Tools stapelweise aufgerufen und die Ergebnisse dann gefiltert, organisiert, dedupliziert, gezählt oder zusammengefasst werden.',
  presetMinimalName: 'Minimalmodus',
  presetMinimalDescription:
    'Der Agent verwendet ein Terminal und das Lesen von Bildern mit Kontextkomprimierung. Nützlich zum Testen und Vergleichen der Grundleistung.',
  presetCordisName: 'Erstellermodus',
  presetCordisDescription:
    'Passen Sie DSH durch Gespräche an. Lassen Sie den Agenten Plugins schreiben, die Funktionen oder Benutzeroberflächen hinzufügen, oder kombinieren Sie Tools und Eingabeaufforderungen, um Ihren eigenen Modus zu erstellen.',

  inUse: 'Neuer Aufgabenstandard',

  noDescription: 'Keine Beschreibung.',
  brokenBadge: 'Laden fehlgeschlagen',

  switchRefused: 'Konnte nicht zu {name} wechseln: {reason}',
  standardUnavailable: 'Der Standardmodus ist nicht verfügbar. Stellen Sie es wieder her oder wählen Sie einen anderen verfügbaren Modus.',

  close: 'Schließen',

  creatorDraft: 'Lassen Sie sich vom Agenten beim Erstellen einer Voreinstellung helfen',
  createPlugin: 'Lassen Sie den Agenten ein Plugin erstellen',
  createPluginDescription: 'Wechseln Sie in den Erstellermodus und erstellen Sie Ihr eigenes DSH-Plugin',
  createPluginChecking: 'Prüfen, ob der Creator-Modus verfügbar ist',
  createPluginUnavailable: 'Vorübergehend nicht verfügbar. Öffnen Sie dieses Menü erneut, um es erneut zu versuchen',
  createPluginMissing: 'Der Creator-Modus ist in dieser Konfiguration nicht enthalten',

} satisfies Record<keyof typeof en, string>

/** Russian dictionary, checked against the English keys. */
export const ru = {
  ...guideRu,
  builtInGroup: 'Встроенный', customGroup: 'Пользовательский',
  sectionIntro: 'Выбирайте инструменты агента и то, как они работают. Используйте стандартный режим для повседневных задач или режим Creator, чтобы расширить возможности DSH.',

  seatHint: 'Выберите предустановку агента для вашей новой задачи',
  headerHint: 'Предварительная настройка агента, выбранная при запуске этой задачи',
  nav: 'Настройки агента',

  setDefault: 'Установить в качестве новой задачи по умолчанию',
  view: 'Посмотреть конфигурацию',

  presetStandardName: 'Стандартный режим',
  presetStandardDescription:
    'Работайте с кодом, файлами и информацией. Подходит для большинства задач, с поиском, редактированием, командами терминала и другими инструментами, доступными по мере необходимости.',
  presetPtcName: 'Режим PTC',
  presetPtcDescription:
    'Включает все возможности стандартного режима. Лучше подходит для задач, которые вызывают инструменты в пакетном режиме, а затем фильтруют, организуют, дедуплицируют, подсчитывают или суммируют результаты.',
  presetMinimalName: 'Минимальный режим',
  presetMinimalDescription:
    'Агент использует терминал и чтение изображений со сжатием контекста. Полезно для тестирования и сравнения его базовой производительности.',
  presetCordisName: 'Режим автора',
  presetCordisDescription:
    'Настройте DSH через разговор. Позвольте агенту писать плагины, которые добавляют функции или пользовательский интерфейс, или комбинируйте инструменты и подсказки для создания собственного режима.',

  inUse: 'Новая задача по умолчанию',

  noDescription: 'Нет описания.',
  brokenBadge: 'Не удалось загрузить',

  switchRefused: 'Не удалось переключиться на {name}: {reason}',
  standardUnavailable: 'Стандартный режим недоступен. Восстановите его или выберите другой доступный режим.',

  close: 'Закрыть',

  creatorDraft: 'Позвольте агенту помочь мне создать пресет',
  createPlugin: 'Позвольте агенту создать плагин',
  createPluginDescription: 'Войдите в режим Creator и создайте свой собственный плагин DSH.',
  createPluginChecking: 'Проверка доступности режима Creator',
  createPluginUnavailable: 'Временно недоступен. Откройте это меню еще раз, чтобы повторить попытку.',
  createPluginMissing: 'Режим Creator не включен в эту конфигурацию.',

} satisfies Record<keyof typeof en, string>

/** Portuguese dictionary, checked against the English keys. */
export const pt = {
  ...guidePt,
  builtInGroup: 'Integrado', customGroup: 'Personalizado',
  sectionIntro: 'Escolha as ferramentas do agente e como funciona. Use o modo Padrão para tarefas diárias ou o modo Criador para adicionar recursos ao DSH.',

  seatHint: 'Escolha a predefinição de agente para sua nova tarefa',
  headerHint: 'A predefinição do agente escolhida quando esta tarefa foi iniciada',
  nav: 'Predefinições de agente',

  setDefault: 'Definir como nova tarefa padrão',
  view: 'Ver configuração',

  presetStandardName: 'Modo padrão',
  presetStandardDescription:
    'Trabalhe com código, arquivos e informações. Adequado para a maioria das tarefas, com pesquisa, edição, comandos de terminal e outras ferramentas disponíveis conforme necessário.',
  presetPtcName: 'modo PTC',
  presetPtcDescription:
    'Inclui todos os recursos do modo Padrão. Mais adequado para tarefas que chamam ferramentas em lotes e depois filtram, organizam, desduplicam, contam ou resumem os resultados.',
  presetMinimalName: 'Modo mínimo',
  presetMinimalDescription:
    'O agente utiliza terminal e leitura de imagens, com compactação de contexto. Útil para testar e comparar seu desempenho básico.',
  presetCordisName: 'Modo criador',
  presetCordisDescription:
    'Personalize DSH por meio de conversa. Deixe o agente escrever plug-ins que adicionem recursos ou UI, ou combine ferramentas e prompts para criar seu próprio modo.',

  inUse: 'Novo padrão de tarefa',

  noDescription: 'Nenhuma descrição.',
  brokenBadge: 'Falha ao carregar',

  switchRefused: 'Não foi possível mudar para {name}: {reason}',
  standardUnavailable: 'O modo padrão não está disponível. Restaure-o ou escolha outro modo disponível.',

  close: 'Fechar',

  creatorDraft: 'Deixe o agente me ajudar a criar uma predefinição',
  createPlugin: 'Deixe o agente criar um plugin',
  createPluginDescription: 'Entre no modo Criador e crie seu próprio plug-in DSH',
  createPluginChecking: 'Verificando se o modo Criador está disponível',
  createPluginUnavailable: 'Temporariamente indisponível. Reabra este menu para tentar novamente',
  createPluginMissing: 'O modo criador não está incluído nesta configuração',

} satisfies Record<keyof typeof en, string>
