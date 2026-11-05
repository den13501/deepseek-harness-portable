# v0.2.2-rc.1 同步與免安裝更新

同步目標固定為官方 tag `dsh-v0.2.2-rc.1`（`66491b05e3f05ad35bcdd4f6cd7ed26041d9e3db`，預發行），從 `portable/sync-rc.5` 建立 `portable/sync-0.2.2-rc.1`，不直接覆蓋既有分支。上游 rc.5 到 rc.1 共 2,623 個提交、8,120 個檔案。本衍生版與上游同時修改的檔案有 195 個，合併產生 148 個需處理的路徑。

## 範圍與限制

- 本文件記錄來源合併與來源層級驗證。**尚未建置、打包或推送**，沒有成品，也沒有 CI 結果。
- Node 需求由 `^22.19 || >=24` 提高為 `>=24.9.0`。本機建置與驗證改用內嵌的 Node 24.21.0（系統 Node 為 22.22.3）。
- 公司端、LTSC 與家用目錄升級均未驗證。

## 保留的政策

- `dshOfflineMode`、離線建置旗標、`DSH_OFFLINE_MODE` / `DSH_TELEMETRY_MODE` 主機變數沿用，合併後相關檔案仍含離線判斷。
- `company-privacy-policy.ts` 的五個封鎖模組在合併後的 bundle 清單中仍存在，`loader/entry-disabled` 掛鉤保留（vendor 日誌 V28）。
- 工作流程取用上游版本；`portable-windows.yml` 未變動。

## 衝突處理

- 語系註冊：保留上游新增的 ja/es/fr/de/ru/pt，並在每個註冊處補回 `zh-TW`。`LOCALE_IDS` 仍以 `zh-TW` 為必要基準語系，缺字會在型別檢查失敗。
- Desktop 語系解析：上游改為依字典表解析，繁中標籤（`zh-Hant`、`zh-TW/HK/MO`）由 `isTraditionalChinese` 優先判斷。
- `ui-deepseek-model-label-1017` 依上游移除。
- 各套件 README 取用上游文字，繁中用語不另寫入 README。

## 繁中字典補齊

- 補齊既有字典缺少的 223 個鍵，並移除上游已刪除的 51 個鍵。翻譯由人工撰寫，**未經人工審閱**，用語沿用既有字典。
- Desktop 外殼補 9 個鍵，並依 `en` 重新排序。
- **7 個實驗性外掛的 `zh-TW` 暫時指向英文字典**（`client-ui-action-cards`、`client-ui-creation-recommendations`、`client-ui-forge`、`client-ui-plugin-recommendations`、`client-ui-stats`、`cua`、`liveshare`，共 798 個鍵）。它們不在公司版載入的 bundle 內；啟用時繁中介面會顯示英文。待補翻譯。

## 上游變更與外連審查

- Web Fetch 改為不限制目標位址，可連到本機與內網。公司版的 `tool-web` 是否預設掛載尚未逐項確認，需另行決定是否固定關閉。
- 新增 Desktop 診斷報告與操作歷史，程式碼只寫入本機檔案，未發現網路上傳。
- 新增第三方外掛更新與自訂外掛索引，會連網；公司版是否預設啟用尚未驗證。
- `subagent_oar`、個性化推薦、統計、變更請求與工作樹等實驗性外掛不在公司版 bundle 的 manifest 內（`personalized-recommendations` 僅出現在 `apps/cli`）。
- 上游將 `session` 儲存改為可讀取聲明相容的舊版本，並以新版寫入。家用目錄升級與還原需另行演練。

## 驗證結果

紀錄位於 `deepseek-harness-tools\logs\rc1-0.2.2-20261105`。

| 項目 | 結果 |
|---|---|
| `pnpm install --frozen-lockfile`（Node 24.21.0） | 通過，結束碼 0 |
| 型別檢查 5 個 gate | 通過，結束碼 0（合併後兩次修正後重跑） |
| `verify-client-ui-i18n` | 通過，1,254 個檔案 |
| 14 檔回歸（`validate.mjs` 第 3 階段） | 14 檔、376 項通過 |
| portable 工具測試 | 第一次執行（DSH 尚未啟動）24 項、0 失敗；第二次因家用目錄 DSH 正在執行而 22 項失敗（`Close all DSH windows`），**未在 DSH 關閉後重跑** |

- `scripts/portable/validate.mjs` 沒有完整一次跑完：第一次因 `locale.spec.ts` 鍵序失敗（已修正），第二次因上述 DSH 行程失敗。完整指令需在 DSH 關閉後重跑。
### 受影響套件分組測試（每組 10 分鐘上限）

| 分組 | 第一次結果 | 處理後 |
|---|---|---|
| ui-chat、ui-conversation、ui-tool | 通過 | — |
| ui-misc（locale、設定、檔案動作、引用、匯出等） | 通過 | — |
| llm、web-app、mcp、listing guard | 通過 | — |
| ui-sidebar 系列 | 2 項失敗 | `ui-sidebar-files` 期望值漏了 zh-TW，已修正；授權打包測試需經 `pnpm` 啟動才有 `npm_execpath`，改用 pnpm 後通過 |
| ui-plugins-schedule | 1 項失敗 | `ui-schedule` 的 `zhTW` 匯出要以 `zh-TW` 語系 id 註冊，已修正 |
| apps/desktop | 12 項失敗 | 1 項為 `macos-signature` 期望值漏了 `zh_TW`，已修正；其餘 11 項見下 |
| app-boot（整組） | 10 分鐘逾時，無結果 | 見下 |

- 上述三個測試修正與授權打包測試已重跑：4 個檔案、60 項通過。這三個遺漏屬於執行期比對語系集合，型別檢查抓不到。
- **desktop 其餘 11 項未通過**：`upload-with-credentials` 10 項與 `windows-token-identity` 1 項。本機沒有安裝 `pwsh`（`Get-Command pwsh` 找不到），後者的錯誤是 `spawnSync pwsh ENOENT`，前者的錯誤是結束碼型別不符，與找不到程式一致。rc.5 的 `upload-with-credentials` 也呼叫 `pwsh`。**沒有在 rc.5 基準上重跑比對**，也沒有裝 `pwsh` 重跑，因此這是推論。
- **app-boot 3 個檔案單獨重跑**：366 項中 361 通過、4 失敗、1 跳過。失敗的是 `profile-resolution` 1 項、`package-meta` 2 項、`compatibility-preflight` 1 項，標題都與符號連結有關。實測本帳號以 Node 建立符號連結會得到 `EPERM`。失敗訊息本身未被記錄下來（vitest 輸出沒有失敗詳情段落），所以「失敗原因是 `EPERM`」是由標題與實測推得，不是逐項讀到的。同樣**沒有在 rc.5 基準上比對**。
- **`linked-resolution-matrix.spec.ts` 沒有結果**：整組逾時被終止時它沒有回報，單獨重跑的三個檔案也不含它。
- 整組 app-boot 逾時的原因未查明。

### DSH 關閉後的重跑

- `scripts/portable/validate.mjs` **完整通過**，結束碼 0：portable 工具測試 45 項、`verify-client-ui-i18n` 1,254 個檔案、14 檔回歸 376 項、5 個型別 gate。

## 建置與成品

成品的建置來源是提交 `1037e02a1e`（本節之前的最後一個提交）。本節文字在成品建置之後才提交，因此分支 HEAD 會比 `BUILD-INFO` 記錄的 commit 多一個只改文件的提交；兩者程式碼相同。

- `pnpm run build`：10 個 gate 全部通過，結束碼 0，建置後工作樹乾淨。
- 離線 Windows directory build（`DSH_DESKTOP_OFFLINE_BUILD=1`，`--unsigned --dir`）與 portable 打包：管線結束碼 0；打包後 `.env.windows` 雜湊未變、原始碼未被修改。包內 smoke 通過：離線外掛安裝與移除、DOCX／XLSX／PPTX 轉 PDF、skill CLI 探索。
- 成品（本機，未簽章）：`.artifacts\portable\DSH-portable-0.2.2-rc.1-p1-win-x64-1037e02a1e83.zip`，622,190,995 bytes，SHA-256 `570BA108512BD7796807C61E5FF02B66D7AFB7F90668C4CEDCD204CFBB258665`，與 `.sha256` 一致。`BUILD-INFO` 為 `0.2.2-rc.1`、revision 1、commit `1037e02a1e83f0f79a93b5e10be2242621e75ac9`、`dirty: false`。
- 靜態政策六項通過：offline、無 mandatory policy、無 `app-update.yml`、五個政策模組、Loader 掛鉤、boot 掛鉤。這是靜態檢查，不是網路沙箱。
- 7-Zip `t` 回報 `Everything is Ok`（963 個資料夾、8,343 個檔案）。清單 8,342 筆以 Node 逐筆核對：大小與雜湊全部相符，無清單外檔案、無缺漏，沒有 `app-update.yml`、`data`、`workspace`。209 個路徑達 260 字元，與 rc.5 相同。
- `app.asar` 字串抽查 15 項預期全部符合：新增繁中用字存在、舊用字（`并願意繼續`、`取決于`、`注冊` 等）皆 0 處、日文與俄文存在、`ui-deepseek-model-label-1017` 不在包內。這是字串層級抽查。
- 瀏覽器擴充已用 rc.1 來源重新準備（`browser-assets\extension-rc1-0.2.2-20261105`，222 個檔案，DSH 套件皆 `0.2.2-rc.1`），瀏覽器本體沿用 `sealed-rc2-win-x64`（Playwright `1.63.0-alpha-2026-08-31`、chromium-1243）。包內有 `app\browser\assets\chromium-1243\chrome-win64\chrome.exe`；`package.mjs` 在 Playwright 版本與擴充不一致時會中止，管線通過即表示兩者一致。

## 仍未驗證

- 應用程式實際啟動、Host 內瀏覽器工具呼叫、離線冷啟動、授權、公司環境（LTSC、Strata、Proxy、AD、網路稽核）。
- 隔離演練（從 rc.5 更新到 0.2.2-rc.1、`Enable-Browser.cmd`、`Restore`）。
- 家用目錄升級與 Session 儲存格式變動的影響。
- Web Fetch 預設不限制目標位址（公司版 `base/cordis.patch.yml` 預設掛載 `web-fetch-http` 與 `tool-web`，`fetch: true`）。外掛更新與自訂外掛索引是否預設啟用。**需要決定是否固定關閉。**
- Desktop 11 項（`pwsh` 相關）與 app-boot 4 項（符號連結）在 rc.5 基準上的比對。
- 推送與 CI。
