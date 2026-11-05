# Portable 瀏覽器整合：原型與建置資產

本功能目前是建置原型，不是已整合的發行包。目標是在公司與家中各自解壓相同乾淨包，不依賴全域 Node 或已安裝的瀏覽器；各台電腦各自保留資料，不同步 cookies、憑證或聊天。免安裝與禁止網路是不同需求，既有 updater／遙測停用政策保留。

## 固定依賴與驗證範圍

沿用官方 rc.2 的 browser-use、實驗性 Playwright MCP provider 及其固定 `@playwright/mcp@0.0.80`；該版本依賴 `playwright@1.63.0-alpha-2026-08-31`。Chromium 與輔助元件由此版本的 Playwright installer 在建置機取得，不使用執行期 `npx` 或 `latest`。官方 provider 與預設產品的實驗性隔離邊界不因 portable 而取消。

2026-10-19 原型使用既有 rc.2 包內 Node v24.21.0，通過官方 provider 的 launch／attach 兩項真實 MCP 測試；另以封存瀏覽器執行本機頁面導覽、表單填寫／點擊、截圖與 context cookie 隔離檢查。這不是發行包啟動、影像模型理解、斷網冷啟動、背景網路流量或 LTSC 驗收。

## 資產封存工具

在 Windows x64 建置端，先以固定版 Playwright installer 取得 Chromium（完整瀏覽器，不只 headless shell）、FFmpeg 與 Winldd。再用 `browser-assets.mjs` 收錄三個明確 revision 的目錄，排除 installer 的 `.links`、鎖與無關快取。參數均為絕對路徑；第三個參數必須是不存在的新目錄。

```text
node browser-assets.mjs <cache-absolute-path> <playwright-core-absolute-path> <new-destination-absolute-path>
```

工具拒絕來源與目的互相巢狀、連結與已存在目的，逐檔比對複製前後大小及 SHA-256，再產生 `BROWSER-ASSETS.json`。`verifyBrowserAssets` 驗證新增、刪除或異動檔案；清單只使用相對路徑，不包含建置機快取絕對位置。這是本機完整性清單，不是上游簽章，也不會以清單取代供應鏈或授權審查。此工具目前不會被 `package.mjs` 自動呼叫。

## 可選擴充依賴封裝原型

`browser-extension.mjs` 的 `prepareBrowserExtension(entryDirectory, destination, hostPackages)` 將已建置 provider 的執行期依賴實體化至新目錄的 `node_modules`，不呼叫套件安裝器、不執行套件 scripts、不啟用 plugin。呼叫端必須明確提供 Host 套件名稱與精確版本；這是建置輸入，**不是工具已驗證實際 Electron Host 具備這些套件的證明**。直接依賴若由 Host 供應，會核對建置端解析版本；peer 的精確版本宣告會核對，其他 range／workspace 相容性仍須由既有 profile compatibility 檢查處理。

workspace 套件依 `files` 清單複製；已安裝在 pnpm store、未保留 `files` 的 registry 套件收錄現有套件檔案，但排除 `node_modules`。保留根層 LICENSE／NOTICE／README；這不是完整授權與來源審查。拒絕缺件、尚未建置的入口、相同名稱解析至不同目錄、未明確供應的 peers、optional dependencies、檔案連結及覆寫目的。工具目前採 flat closure，遇到多版本樹會拒絕，不宣稱支援一般 npm dependency tree。

`BROWSER-EXTENSION.json` 記錄精確套件版本、授權欄位、Host 外部需求及相對檔案大小／SHA-256；`verifyBrowserExtension` 比對檔案清單，拒絕新增、異動、刪除與連結。這是本機完整性檢查，不是上游簽章。六項測試涵蓋搬移、排除 Host peers、缺件、版本衝突、registry exports 入口及破壞清單。

2026-10-19 以包內 Node 建置後，在獨立 tools 目錄實體化 6 個套件、208 個檔案：官方 provider、browser runtime、`@deepseek-ai/dsh-browser-use`、`@playwright/mcp@0.0.80`、`playwright`／`playwright-core@1.63.0-alpha-2026-08-31`；9 個共用套件列為外部需求。runtime 實際 import `@deepseek-ai/dsh-browser-use/brand`，但 rc.2 Host 安裝範圍（app deps）不含該套件，故將其在 experimental runtime 由 peerDependencies 改為 dependencies（provider 移除無引用的 peer 宣告），由 payload 自帶；其 peers `cordis`／`dsh-brand` 仍由 Host 供應。以包內 Electron 的 Node 模式（`ELECTRON_RUN_AS_NODE=1`，與 Host 子程序相同、可讀 app.asar）從 `app.asar/dsh` anchor逐一 resolve 驗證：9 個外部需求套件全數存在且版本相符。此 payload 尚未通過完整 Electron Host 載入、離線啟動及授權驗收，不能直接視為可發行擴充。未改動預設產品依賴清單、bundle 宣告、使用者 profiles 或既有 ZIP。

## 待完成整合

### 2026-10-19 後續進度

- 資產封存工具已提交為 `6661b8a`，提交 hooks 正常執行，未略過檢查。
- `browser-runtime.mjs` 提供尚未接入產品的路徑解析工具：驗證封存資產及 Playwright 版本，依解壓位置解析 `app/browser/assets`，建立 `data/browser/temp`、`data/browser/output`，明確提供 isolated/headless MCP 參數及 Electron Node 模式環境。拒絕資料 junction 指向包外；這不是防止並行惡意修改的檔案系統沙箱。
- 新增三項測試，涵蓋中文特殊路徑搬移、版本／完整性拒絕及資料 junction。既有 staged lint 設定忽略 `.mjs`，故 lint hooks 成功不代表這些檔案已接受 lint；另以 Node 語法檢查與行為測試驗證。
- 以原 rc.2 包內 Electron 的 Node 模式啟動固定 MCP CLI，於獨立中文、空白、`&`、括號路徑完成 initialize、24 項工具列舉、本機導覽與 snapshot 內容檢查，MCP stderr 為空。後續已驗證實體 PNG 檔頭：明確指定的相對檔名寫入工作目錄，未指定檔名則寫入 output；`outputDir` 不是所有檔案的強制圍欄。這不等同於完整 DSH Host 已載入官方 provider。
- 官方實驗性 provider 新增絕對 `outputDir`／`tempDir` 設定，portable 路徑工具輸出對應的 `providerConfig`。六項單元測試及三項真實 MCP 測試通過；其中 Loader composition 測試確認 temp 在執行時被使用，且 Session 正常 dispose 後清空。先前工具逾時強制中斷留下的舊 artifacts／profile 目錄仍保留；正常清理通過不代表崩潰後零殘留，不會自動刪除未確認歸屬的舊目錄。
- 已查核外部 profile bundle 載入及依賴解析機制，可選部署尚未實作；預設產品的依賴與 bundle 清單未改動。完整封裝前仍須解決依賴閉包、不可變 app 資產與資料目錄之間的可重定位參照。
- 新增 `browser-enable.mjs` 明確 opt-in 部署／啟用／停用入口：`deploy` 先以 `verifyBrowserExtension` 驗證 payload，並以包內 `runtime.json` 的 `desktopVersion`（plain Node 唯一可讀的 Host 版本證據，Host 其餘依賴在 app.asar 內）核對 payload 內 `@deepseek-ai/dsh-*` 套件與 Host 需求版本，再以暫存目錄複製後更名部署至 `data/browser/extension`；已存在相同 payload 時重用，不同則拒絕。`enable` 僅在 `data/home/profiles/desktop` 已存在時運作，以附加方式寫入 profile `dependencies`、建立指向 payload 的 node_modules junction，並在 `cordis.patch.yml` 以 `# dsh-portable-browser begin/end` 標記區塊插入 `- insert:` 兩個 entry（`dsh-browser-use` 與 provider，隔離 launch、絕對 `executablePath`／`outputDir`／`tempDir`）；既有非標記內容逐位元保留，衝突時拒絕不覆寫。`disable` 依收據 `data/browser/enable.json` 反向移除，保留 payload 與使用者其他內容。junction 與 patch 內均為絕對路徑，搬移可攜目錄後必須重跑 `enable`（冪等）。三項單元測試涵蓋部署版本閘、冪等／改址重啟用、停用還原、缺 profile、外來 node_modules 與依賴衝突。尚未驗證真實 Electron Host 載入該 profile 後的完整行為。
- 首輪合併工具測試與 Electron smoke 並行，11 項 updater 測試因其既有「必須關閉全部 DSH」保護而失敗。這些測試必須與 Electron smoke 串行，不能放寬更新程序檢查來消除衝突。

### 2026-10-19 真機 Host 煙燒結果（rc.2 副本）

- 修兩個 enable glue 缺陷後完成真機驗證：(1) CLI 誤以 `desktopVersion` 充當 Playwright 版本 pin，改為自部署 payload manifest 取 `playwright-core` 版本（封存資產版本不符仍由 `resolveBrowserRuntime` 拒絕）；(2) Host 的 overlay 解析器要求單一 YAML 文件，既有 `[]`（flow 空列表）後附加 block entries 會以 `YAMLException: end of the stream or a document separator is expected` 使 Host 啟動失敗——enable 現於保留註解時移除空 `[]` token，disable 則在僅剩註解時還原 `[]`。
- 實測循環：enable 寫入 6 個 profile dependencies、6 個 junction、標記區塊（launch＋絕對路徑）與收據；帶此狀態啟動 Host，視窗正常（先前缺陷版曾出現 `DeepSeek Harness is unavailable` 錯誤視窗與 crash log，修復後無新 crash）；關閉後 disable 完整還原（patch 回 `[]` 預設形、deps 清空、junction 歸零、收據移除），再啟動亦正常。`resolveBrowserRuntime` 實際輸出 `mode: launch` 與絕對 `executablePath`／`outputDir`／`tempDir`，與 glue 假設一致。
- 仍未驗證：Host 內實際呼叫 browser 工具的端到端對話、MCP 子程序於 Host 環境的啟動證據；授權、updater 整合、離線與搬移後重啟用仍列待辦。
- 2026-11-05（0.2.2-rc.1）：`browser-enable.mjs` 寫入的標記區塊兩個列改為帶明確 `id`（`portable-browser-use`、`portable-browser-use-playwright-mcp`）。0.2.2 起，沒有 `id` 的兩列在設定頁會出現 `service "browserUse" has been registered at <BrowserUseRegistry>` 並使 `dsh-browser-use` 列沒有啟動；使用者在家用目錄手動補上兩個 `id` 後警告消失（使用者回報）。因為 `Enable-Browser.cmd` 每次整段改寫標記區塊，手動補的 `id` 會被抹掉，所以改在產生區塊的地方補。`browser-enable.test.mjs` 新增兩項斷言檢查區塊含這兩個 `id`，6 項測試通過。**根因只由「加 `id` 後警告消失」推得，沒有讀 Loader 的重複偵測程式碼逐步證實。**已啟用瀏覽器的既有目錄需重新執行 `Enable-Browser.cmd` 才會得到帶 `id` 的區塊。

- 獨立的可選擴充部署與啟用入口，依包位置解析 executablePath，不覆寫使用者既有 profile；預設採隔離 launch，不附加個人瀏覽器。
- 將元件納入受 updater 管理的 app 範圍、封裝清單與授權；驗證 Electron Host 啟動 MCP 的 Node 模式與環境，而非只測獨立 Node。
- 將 profile、下載、截圖與暫存導向可攜資料範圍，查核離開目錄後的清理及殘留程序。既有官方 provider 的 isolated 模式本身不保證所有暫存位於 portable 目錄。
- 識別不同於原 rc.2 的衍生發行版本，不放寬同版拒絕檢查；完成 alpha.4／rc.2 更新及回復、中文特殊路徑與資料保存演練。
- 真正斷網冷啟動、背景流量、授權、可見視窗、截圖模型路由與第二台實體電腦驗收。瀏覽器工具與來源清單不是網路沙箱。