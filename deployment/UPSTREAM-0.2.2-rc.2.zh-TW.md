# v0.2.2-rc.2 同步與免安裝更新

同步目標固定為官方 tag `dsh-v0.2.2-rc.2`（`ddac96760b6edf8fa0fe17cbdcf0b512f4c12b2c`，預發行，2026-11-11 發布），從 `portable/sync-0.2.2-rc.1` 建立 `portable/sync-0.2.2-rc.2`。上游 rc.1 到 rc.2 共 1,568 個提交、4,645 個檔案；本衍生版與上游同時修改的檔案有 70 個，合併產生 12 處衝突。

## 範圍與限制

- 環境有三個：**開發主機**（本文件的建置與驗證都在這台，其測試目錄已於 2026-11-12 更新到 rc.2）、**家裡電腦**（原為 0.2.1，已於 2026-11-19 前更新到 rc.2）、**公司辦公電腦**（原為 0.2.1-rc.5，已更新到 rc.2）。更新結果見「家裡與公司電腦的更新（使用者回報）」。先前文件把開發主機的測試目錄稱為「家用目錄」，指的就是開發主機，不是家裡電腦。
- 家裡與公司辦公電腦**直接更新到 rc.2，不經過 rc.1**：Session 格式版本在 0.2.1-alpha.4 到 0.2.2-rc.2 的 9 個 tag 都是 4，更新工具只要求新版比舊版新，不要求逐版升級。這是更新前依原始碼與工具做的判斷；實際更新結果由使用者回報，見「家裡與公司電腦的更新（使用者回報）」。
- rc.5 的 ZIP 已刪除，所以沒有做 rc.5 → rc.2 的隔離演練；公司端的跨版更新沒有事先演練過（實際更新後由使用者回報順利）。
- 本文件記錄來源合併、來源層級驗證與成品檢查。分支已推送，手動 `Portable Windows (manual)` 在 `9589f102a2` 上通過，見「CI 結果」。

## 保留的政策

- `dshOfflineMode`、離線建置旗標、`DSH_OFFLINE_MODE`／`DSH_TELEMETRY_MODE` 主機變數沿用。`apps/desktop/src/main.ts` 讀到的離線判斷完好：自動檢查開頭即返回，強制更新政策在離線時為 `undefined`。
- 成品靜態政策六項通過（離線、無強制更新政策、無 `app-update.yml`、五個政策模組、Loader 掛鉤、boot 掛鉤）。這是靜態檢查，不是網路沙箱。

## 維運決定

- **Web Fetch 維持不限制目標位址**（使用者決定，沿用 2026-11-05 的決定）。模型可抓取本機與內網位址。沒有經過公司 IT 核准。
- **搜尋預設改變**：上游把 `web` 的 `searchProvider` 由 `deepseek-official` 改為 `deepseek-search-api`，需要 DeepSeek 金鑰與外連。公司端沒有雲端金鑰時，內建搜尋會在呼叫時失敗。
- **外接搜尋與擷取走 MCP**（使用者決定）：不新增 SearXNG 提供方，改用 rc.2 新增的 `mcp-manager`。用法與限制見 `scripts/portable/README.zh-TW.md`。`mcp-manager` 不在五個封鎖模組內，不會被隱私政策擋掉。**尚未實測外接 SearXNG 或擷取服務。**
- **更新通道設定不隱藏**（使用者決定，避免日後合併衝突）。離線包沒有 `app-update.yml`，切換通道時 `doCheck()` 會因 `enabled()` 為假而回報沒有封裝的更新來源，不會對外連線。這是讀程式碼的推論，**未實測**。

## 衝突處理

- 離線建置：`desktop-package-environment.mjs` 保留 `OFFLINE_BUILD` 判斷；上游把 `FILE_SETTINGS` 搬到 `desktop-file-settings.mjs`，刪除本檔重複宣告。
- `ui-open-in-app`、`ui-sidebar`、`ui-subagent`、`session-log-export` 的 `index.ts`：採用上游新增的匯入與行為，保留 `zh-TW` 註冊。
- `ui-context-menu` 字典：採用上游新增的 `back` 鍵並補 `zh-TW`。
- 上游把 `experimental/client-ui-agent-team` 搬到 `packages/client/ui-agent-team` 與 `packages/team/*`，刪除舊目錄中我方改過的檔案，並在新位置重新補 `zh-TW`。`ui-open-in-app` 的 `session-reveal` 測試被上游改名為 `session-open-with`。
- Web 能力座的三份 Agent Note 取用上游版本（我方只動過 3 行）。

## 繁中字典補齊

- 既有字典補 161 個鍵，移除上游已刪的 17 個鍵。補鍵用人工撰寫，**未經人工審閱**，用語沿用既有字典。
- `ui-agent-team`（30 鍵）與 `ui-account-notifications`（1 鍵）原本沒有 `zh-TW`，已新增並接上註冊。
- Desktop 外殼補 15 個鍵，並依 `en` 重排鍵序。
- **7 個實驗性外掛的 `zh-TW` 由英文字典換成中文，共 983 個鍵**（`client-ui-action-cards`、`creation-recommendations`、`forge`、`plugin-recommendations`、`stats`、`cua`、`liveshare`）。這批是 OpenCC（`opencc-js` 1.0.5，只裝在工具目錄）加詞彙對照的**機器轉換草稿，沒有人工校對**。它們不在公司版載入的 bundle 內。
- 型別檢查抓不到、靠執行期測試才發現的項目：`updateStepInstalling` 的插值變數由 `{registry}` 改名為 `{source}`、`baseUrlHint` 新增 `{path}`、Desktop 外殼 15 個缺鍵，以及兩個上游新增測試與 `client-ui-stats` 測試的 `zh-TW` 註冊。
- **沒有處理**：`auto-review`、`sandbox`、`cua` 的非 client 字典以固定 8 種語言鍵回傳文字，沒有 `zh-TW` 對應鍵，沿用簡體 fallback（使用者同意）。

## 上游變更與外連審查（讀 release 說明與程式碼，未逐項實測）

- 設定頁新增正式版／開發版更新通道、下載進度與 Windows 安裝狀態視窗（見上）。
- 模型請求的 User-Agent 帶入目前 profile；外掛索引可提供 GitHub 星數與 npm 下載量；帳號通知支援公告。這三項是否對外連線、公司版是否預設啟用，**尚未逐項查清楚**。
- Agent 終端移到側欄；獲准讀取的使用者終端內容會進入模型上下文與 Session 紀錄。
- Office 改用原生工具，文件解析在 Host 行程內執行、不在 shell 沙箱內。
- 外掛可動態註冊與移除 MCP 伺服器（`mcp-manager`）。


## 驗證結果

紀錄位於 `deepseek-harness-tools\logs\rc2-0.2.2-20261112`。Node 使用包內 24.21.0（系統 Node 為 22.22.3）。

| 項目 | 結果 |
|---|---|
| `pnpm install --frozen-lockfile` | 通過，5 分 32 秒 |
| `scripts/portable/validate.mjs` | **完整通過**：portable 工具測試 24 項、`verify-client-ui-i18n` 1,310 個檔案、14 檔回歸 389 項、5 個型別 gate |
| `pnpm run build` | 10 個 gate 全過，244.75 秒；建置後工作樹乾淨 |

`validate.mjs` 前兩次沒有通過：第一次是 4 項繁中字典失敗（Desktop 外殼缺 15 鍵、兩個插值變數），第二次是 2 個型別錯誤（上游新增測試沒有 `zh-TW`）。修正後第三次完整通過，前兩次的紀錄保留在 `validate-run1-failed.log` 與 `validate-run2-typecheck-failed.log`。

### 受影響套件分組測試（每組 10 分鐘上限）

| 分組 | 結果 |
|---|---|
| ui-chat／conversation／tool／subagent／agent-team | 通過，148 檔 2,796 項 |
| ui-plugins／schedule／open-in-app／workspace | 通過，65 檔 1,841 項 |
| ui-misc（locale、設定、帳號通知、引用、匯出等） | 通過，97 檔 1,487 項 |
| llm、web、mcp（含 `mcp-manager`）、web-app、listing guard | 通過，62 檔 1,258 項 |
| ui-sidebar 系列 | 1 項失敗（授權打包測試）；改用 pnpm 啟動並在建置後重跑，**通過** |
| 實驗性外掛逐一重跑 | action-cards、creation-recommendations、plugin-recommendations、cua、forge（1,027 項，503 秒）通過；`client-ui-stats` 1 項失敗，修正測試後 215 項通過；`liveshare` 見下 |
| apps/desktop | 11 項失敗（`upload-with-credentials` 10、`windows-token-identity` 1），2,239 項通過 |
| app-boot | 整組 10 分鐘逾時；3 個檔案單獨重跑 361 項通過、4 項失敗 |
| 實驗性外掛整組（7 個一起跑） | 10 分鐘逾時，無結果；改為逐一重跑 |

### 已知失敗與證據等級

| 項目 | 數量 | 原因 | 證據 |
|---|---|---|---|
| `app-boot`（`profile-resolution` 1、`package-meta` 2、`compatibility-preflight` 1） | 4 | 本帳號建立符號連結得到 `EPERM` | **已逐項讀到錯誤訊息** |
| `liveshare`（符號連結） | 24 | 同上 `EPERM` | **已逐項讀到錯誤訊息** |
| `liveshare/shareable-catalog` | 2 | 測試要找 `@deepseek-ai/dsh-experimental-client-ui-forge`，該連結只存在於 `forge-bundle\node_modules`，Node 的 11 個搜尋路徑都找不到；上游 `liveshare` 與根 `package.json` 沒有宣告這個依賴 | 直接原因已確認；**上游基準是否同樣失敗未驗證** |
| `apps/desktop`（`upload-with-credentials`、`windows-token-identity`） | 11 | 推論為本機沒有 `pwsh`（與 rc.1 的檔案與數量相同） | **這次沒有讀到 `pwsh` 錯誤訊息，是推論** |
| `app-boot/linked-resolution-matrix` | — | rc.1 起整組逾時、沒有結果，這次沒有重跑 | 沒有結果 |

以上都沒有在上游基準上重跑比對。

## 建置與成品

成品的建置來源是提交 `259ea2dc35`（`dirty: false`）。管線依序為 `pnpm run build`、離線 Windows directory build（`DSH_DESKTOP_OFFLINE_BUILD=1`、`--unsigned --dir`）、擴充準備、`scripts/portable/package.mjs`，退出碼 0；總計約 1 小時 55 分鐘，其中 directory build 27 分鐘、打包約 85 分鐘（打包段耗時的原因未查）。

- 成品（本機，未簽章）：`.artifacts\portable\DSH-portable-0.2.2-rc.2-p1-win-x64-259ea2dc3592.zip`，631,308,977 bytes，SHA-256 `CB3F72CCC570B2F416F70CA884E809E197774AD6CD5632A79CEA19693DDF9604`，與 `.sha256` 一致。`BUILD-INFO` 為 `0.2.2-rc.2`、revision 1、commit `259ea2dc35924cbd99e92166626801dea3def3cd`。
- 7-Zip 建立與測試皆 `Everything is Ok`（985 個資料夾、8,461 個檔案）。
- 解壓目錄逐筆核對 `SHA256SUMS.csv`：清單 8,460 筆、磁碟 8,460 筆，大小與雜湊全部相符，無清單外檔案，沒有 `app-update.yml`、`data`、`workspace`。225 個路徑達 260 字元（rc.1 為 209）。
- `app.asar` 字串抽查：17 項預期全部符合（新補的繁中用字存在，舊用字與修正掉的兩項字串皆 0 處，`ja`／`ru` 存在）。「智能體」「會話」兩個資訊探針為 0，但這只是事先挑的幾個詞，**不代表 983 鍵草稿整體沒有問題**。
- 瀏覽器：本體沿用 `sealed-rc2-win-x64`（Playwright `1.63.0-alpha-2026-08-31`），擴充以 rc.2 來源重新準備為 `extension-rc2-0.2.2-20261112`；`package.mjs` 沒有因版本不一致中止。

## 開發主機測試目錄的更新（2026-11-12）

開發主機的測試目錄由 rc.1 更新到 rc.2。更新前預檢（`check`）通過：`from 0.2.2-rc.1+portable.1` → `to 0.2.2-rc.2+portable.1`，需要空間 3,764,041,284 bytes，無拒絕訊息。

- 更新由使用者執行。唯讀查核：`BUILD-INFO` 為 `0.2.2-rc.2`、commit `259ea2dc35`；備份交易（ID 不記錄於此）狀態為 `applied`，轉換為 `0.2.2-rc.1+portable.1` → `0.2.2-rc.2+portable.1`；無更新鎖；11/5 的舊備份仍在。
- `cordis.patch.yml` 內 `rea-mcp`、`die-mcp` 與兩個帶 `id` 的瀏覽器列都保留。
- **使用者回報：更新後功能正常**，並提供一張畫面：已載入 8 個 Skills、3 個 MCP（`diec`、`playwright-mcp`、`rea`）都連上、瀏覽器開啟 google.com 並取得 snapshot 與截圖（`google-smoke-2026-11-12`，1280×720）。**這是使用者提供的畫面與口頭回報，我沒有取得日誌，也沒有在磁碟上找到那張截圖檔。**
- **瀏覽器套件曾停在 rc.1 版本**：2026-11-12 時 `data\browser\enable.json` 的 `desktopVersion` 為 `0.2.2-rc.1`（修改時間 2026-11-05），三個 DSH 套件也是 `0.2.2-rc.1`。更新預檢提示需要重新執行 `Enable-Browser.cmd`，當時尚未執行，畫面是 rc.2 程式搭配 rc.1 瀏覽器套件的混合狀態。此問題已於 2026-11-19 解決，見下節。

### 重新啟用瀏覽器（2026-11-19）

- 使用者在開發主機執行 `Enable-Browser.cmd`。唯讀查核 `data\browser\enable.json`（修改時間 2026-11-19 11:08）：`desktopVersion` 為 `0.2.2-rc.2`；三個 DSH 瀏覽器套件與 `hostPackages` 皆為 `0.2.2-rc.2`；`playwright` 與 `playwright-core` 為 `1.63.0-alpha-2026-08-31`，與 `sealed-rc2-win-x64` 相符；`providerConfig` 為 `headless` 的 `launch` 模式，`executablePath` 指向 `app\browser\assets\chromium-1243\chrome-win64\chrome.exe`。`data\browser\extension` 維持 11/12 的內容，符合預期。
- **使用者回報：啟動後沒有看到 `browserUse` 警告。** 這是口頭回報，我沒有取得日誌，也沒有逐一比對 `enable.json` 內的檔案雜湊與磁碟檔案。
- 這次回報只涵蓋「沒有警告」。重新啟用後瀏覽器實際開頁、snapshot 與截圖是否正常，沒有另行回報，不當作已驗證。

## 家裡與公司電腦的更新（使用者回報）

- 家裡電腦（原 0.2.1）與公司辦公電腦（原 0.2.1-rc.5）都已直接更新到 rc.2。**使用者回報：兩台都順利更新、順利使用，沒有出現需要手動處理的問題。**
- 證據等級：全部是使用者的口頭回報。我沒有取得這兩台的 `BUILD-INFO`、更新日誌或備份交易狀態，也沒有親自檢查它們的 Session 與設定。更新工具只接受較新的版本且會拒絕 alpha.4 之前的 portable 包，更新成功代表通過了這些檢查，這是推論。
- 先前列為風險的「rc.2 讀取真實 0.2.1／0.2.1-rc.5 資料」，現在有使用者回報可正常使用，但沒有針對舊 Session 內容的逐項檢查，不能當作完整驗證。

## 仍未驗證

- 兩台電腦更新後的 `BUILD-INFO`、備份交易與舊 Session 內容的逐項檢查（目前只有使用者口頭回報）。
- 開發主機重新啟用瀏覽器後，開頁、snapshot 與截圖的實際結果。
- 離線冷啟動、授權、重啟後設定保存、多輪與取消、Office／PDF 工具、公司環境（LTSC、Strata、Proxy、AD、網路稽核）。
- 外接 SearXNG／擷取 MCP 的實際運作；更新通道設定頁在離線包內的實際行為。
- 983 鍵實驗性外掛繁中的人工校對。
- 純 push 或 pull request 的上游 CI（`ci.yml` 等）：未執行，見「CI 結果」。

## CI 結果

> 2026-11-19 更新：`Portable Windows (manual)` workflow 已移除，成品以本機建置為準，CI 成品不保留（11/20 過期）。以下是移除前的歷史紀錄，之後沒有新的 CI 結果。

- 分支 `portable/sync-0.2.2-rc.2` 已推送到 `origin`，本機與遠端同為 `9589f102a2`。
- 手動 run `Portable Windows (manual)` #43368786615（2026-11-13，`workflow_dispatch`，`windows-2022`）在 `9589f102a2` 上**成功**，約 10 分鐘。依步驟紀錄：
  - 安裝鎖定依賴、portable 工具測試與 `scripts/portable/validate.mjs`：通過（約 4 分鐘）。
  - `scripts/portable/build.ps1`：通過（約 5 分鐘）。日誌顯示 Office 往返轉換、CLI 離線外掛安裝與移除、DOCX／XLSX／PPTX 轉 PDF 通過，7-Zip 建立與測試皆為 `Everything is Ok`。
  - 成品 `DSH-portable-0.2.2-rc.2-p1-win-x64-9589f102a2d4.zip`（約 415 MB），Actions 保存期限到 2026-11-20 05:07 UTC。
- 證據等級：這只證明來源驗證與建置打包在託管 runner 上通過。它不能取代上方本機成品（`259ea2dc35`，631 MB）的驗收。CI 包比本機包小的原因，以及 CI 約 10 分鐘、本機約 1 小時 55 分的差距，**都沒有查證**。
- 上游的 `ci.yml` 只在 `pull_request` 觸發，本分支沒有開 pull request，所以沒有執行過。
- **移除原因**：GitHub Actions 免費額度接近用完，且成品一向以本機建置為準。日後若重新啟用雲端建置，額度不足造成的失敗視為已知環境限制，不當作程式碼回歸；證據改用本機 `validate.mjs` 與 `pnpm run build`。
- 已移除的 workflow 固定的 4 個 Action（`checkout`、`pnpm/action-setup`、`setup-node`、`upload-artifact`）以 Node 20 為目標，當時被強制改用 Node 24 執行，GitHub 已標示棄用。重建 workflow 時要用新版本。

## 上游 rc.3 到 rc.5 評估（2026-11-19，讀提交、diff 與升級指南，未建置、未測試）

- 上游在 `dsh-v0.2.2-rc.2` 之後發了 rc.3（11/13）、rc.4（11/17）、rc.5（11/18），共 19 個提交、580 個檔案。Session 格式仍為 4，`SESSION_QUERY_SQLITE_SCHEMA_VERSION` 為 8、`STORAGE_SQLITE_SCHEMA_VERSION` 為 1，三者與 rc.2 相同；`vendor/` 沒有變更。
- 與本衍生版同時修改的檔案有 10 個（`docs/config-catalog*`、`ui-directory-picker-browse`、`ui-settings-web-search`、`ui-sidebar`、`ui-workspace` 的 `index.ts` 或字典、兩個瀏覽器實驗性套件的 `package.json`、`pnpm-lock.yaml` 等）。
- **決定：暫不跟進，也不等上游正式版。** 沒有找到會影響離線、隱私或繁中政策的安全修補。
- **版本命名依據（2026-11-19 查本機 42 個 tag）**：全部是 `dsh-v*`，從 `0.1.0-rc.7`（2026-08-17）到 `0.2.2-rc.5`（2026-11-18）**沒有任何不帶 `-alpha` 或 `-rc` 的 tag**。多數版本線的最後一個 tag 是 `-rc.N`（0.1.0 為 rc.8、0.1.1 為 rc.2、0.1.2 為 rc.1、0.1.5 為 rc.3、0.1.7 為 rc.2、0.2.0 為 rc.2、0.2.1 為 rc.5）；例外是 0.1.3 與 0.1.6，最後一個 tag 是 `-alpha.2`，沒有轉成 rc。新版本線通常先發 `-alpha.N` 再轉 `-rc.N`，因此不等待正式版，也不能假設每條版本線都會有 rc。沒有查上游的發行腳本或政策，無法判斷這是刻意命名還是尚未發行。
- **跟進條件**：出現安全修補，或 Session 格式、SQLite schema 版本變動，或 `vendor/` 更新，或需要新版的功能，或上游換到下一條版本線（例如 `0.2.3-alpha.N`）。同步目標選該版本線最後一個 rc；沒有 rc 的版本線選最後一個 alpha 前，先確認內容再決定。不選中途的 alpha 或 rc。
- rc.3 到 rc.5 的內容為（不逐項標註屬於哪個 rc，升級指南的版本資料夾與合併日期未對齊，未釐清）：
  - DeepSeek 拒答錯誤碼改為 `CONTENT_REFUSED`；中間加入又移除的 `safety_check` 請求欄位，在 rc.5 已不送出（測試檢查不含該欄位）。
  - 新增實驗性套件 `deepseek-chat-import`（選用 bundle，原始碼沒有 `fetch(` 或寫死網址，未實測）。
  - `liveshare` 的 tunnel worker 修正（實驗性外掛，不在公司版 bundle）。
  - Desktop 安裝程式重啟視窗鎖住安裝目錄的修正；我們的免安裝包不走安裝程式，預計用不到。
  - CI 的 bubblewrap 快取與下載驗證。
  - **搜尋預設改變**，見下。
- **跟進時的風險：搜尋預設。** rc.5 的基礎組合不再設定 `searchProvider`。使用 DeepSeek 模型路由（`deepseek-official`、`deepseek-account`）時改走 Messages 搜尋，其他路由與非模型請求仍走 `deepseek-search-api`。上游升級指南說明，Messages 搜尋端點不跟隨模型提供方的基礎地址，指向閘道的部署會把 `DEEPSEEK_API_KEY` 送往官方端點。跟進時必須決定公司版是否在 `@deepseek-ai/dsh-web` 的 `config` 固定 `searchProvider`，並確認不會出現非預期的外連。我們的外接搜尋走 MCP，不受此變更改善。
- 跟進時需為「網頁搜索提供方」設定頁新增的「自動選擇」補 `zh-TW`。
- 跟進流程沿用本次：從目前分支建立 `portable/sync-0.2.2-rc.5`、合併、補 `zh-TW`、執行 `validate.mjs` 與 `pnpm run build`。
