# v0.2.1-rc.2 同步與免安裝更新

同步目標固定為官方 tag `dsh-v0.2.1-rc.2`，從已整合 alpha.4 的衍生分支建立 `portable/sync-rc.2`，不直接覆蓋公司維護分支。來源同步、測試、成品建置與實際更新分別驗收；本機測試包已產出，不代表公司環境已驗收或使用者目錄已更新。

## 保留的架構

維持 Windows x64 directory package、相對路徑啟動器、獨立 data／workspace、包內 Node，以及現有離線建置、停用 updater 與五個已知內建收集模組的政策。上游 Windows runner 的排程管理只屬建置機工具，不是 portable 使用者端的安裝步驟。

新包延續 Check-Update、Update-DSH、Restore-DSH 與 portable-update 工具；使用方式與限制以 [portable 說明](../scripts/portable/README.zh-TW.md) 為準。更新不綁定磁碟或根目錄名稱，不搬移既有資料，不改寫外部 Skills／MCP 絕對路徑。交易格式維持 1，備份仍綁定建立時的目標路徑；搬移或改名後的回復明確停止，不修改歷史交易。

## 上游功能與政策審查

alpha.5 包含技能選單、終端查詢、PTC 指引與側欄操作修正；rc.1 調整 vendor 套件版本；rc.2 新增 DeepSeek 模型標籤及 Search／Fetch API。補齊網頁搜尋設定的繁中字典，保留上游多 namespace 控制器；新增模型標籤明確註冊繁中。

新 Search／Fetch provider 的載入只註冊提供者，實際選用由 web 設定控制。原有搜尋設定的新版 API 開關預設關閉，不代表所有網路工具都被封鎖；公司政策不是網路沙箱。不得因版本更新而自動提供雲端憑證或啟用新 provider，實際公司外連仍需獨立驗收。

## 驗證狀態

2026-10-19 已建立更新分支並處理繁中註冊合併衝突。frozen-lockfile 安裝、20 項更新／政策工具測試、1,061 個 Client UI 檔案的 i18n 檢查及 260 項 portable 回歸通過。更新測試涵蓋 alpha.3／alpha.4／alpha.10／rc.1 直接升級 rc.2、任意中文與空白目錄、實際 Windows CMD 入口、版本拒絕與搬移後回復拒絕；使用合成資料，不是真實個人資料升級。

受影響測試初輪為 995 項通過、1 項失敗、1 項平台跳過；失敗為技能外掛新增測試只預期英／簡中字典，補入明確繁中預期後，56 個檔案共 996 項通過、1 項平台跳過。五階段型別檢查全部通過；修改的 TypeScript 檔案 staged lint 無警告或錯誤。

## 本機 rc.2 成品（2026-10-19）

- 建置來源：`f9ced8ec77d4bab62cac3b7f1943c89eb6213808`，`BUILD-INFO.json` 記錄 `dirty: false`、`unsigned: true`。後續文件提交不改變此成品來源。
- 成品：`DSH-portable-0.2.1-rc.2-win-x64-f9ced8ec77d4.zip`，位於來源工作樹的 `.artifacts/portable/`；本機絕對位置另記於不納入 Git 的交接文件。
- ZIP 大小：399,678,688 bytes；SHA-256：`9EB25C46ECCCB9DA6C89E0671F987082CB14A5A23B7C6139F5BE817FC5B7AD72`。
- 九階段編譯、Windows x64 未簽章 directory build、封裝前後 runtime smoke 全部通過；包含 CLI 離線外掛安裝／移除、原生元件、Office runtime 文件 round trips、DOCX／XLSX／PPTX 轉 PDF 與 skill CLI discovery。這些不是互動式 GUI 或真實模型呼叫驗收。
- 封裝內建與獨立重跑的 7-Zip 完整性測試均通過：899 個目錄、7,818 個檔案；另逐一驗證 7,817 筆清單的檔案大小與 SHA-256、ZIP sidecar 雜湊、ASAR 與 primary runtime 版本一致。
- 六項靜態政策檢查全部通過；乾淨包不含 data／workspace，7,809 個 application 檔案的憑證檔名篩檢未發現候選檔案。檔名篩檢不是完整秘密掃描，不等於網路沙箱。
- 對既有 alpha.4 執行唯讀 Check-Update 預檢通過，估算需 2,547,373,741 bytes 可用空間；此數字取決於當時個人 data 大小，不是所有使用者的固定需求。未對實際目錄執行更新或回復。
- 另以乾淨 alpha.4 真實發行包，在含中文、空白、括號及 `&` 的隔離目錄，成功完成 alpha.4 → rc.2 → alpha.4。使用合成憑證、聊天、Skills、profile、Electron preference、workspace 文件與外部 MCP 檔案共 8 個樣本；升級不改資料，回復還原升級前 data，保留升級後編輯的 workspace，並將新增聊天另存於 recovery/displaced。不修改真實使用目錄，也未啟動此演練用應用程式。此演練使用實際更新模組；Windows CMD 入口另由前述工具測試涵蓋。

實際使用目錄、個人資料與舊備份不隨來源同步修改。尚未完成遠端 CI、另一台實體電腦、跨磁碟、LTSC／Proxy／AD、真實模型工具呼叫與公司網路驗收；未新增獨立 Chromium，不宣稱瀏覽器自動化已就緒。