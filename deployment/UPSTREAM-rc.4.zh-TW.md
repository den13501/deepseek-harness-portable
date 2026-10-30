# v0.2.1-rc.4 同步與免安裝更新

同步目標固定為官方 tag `dsh-v0.2.1-rc.4`（`504a01a9578abc2c6f1fb896b1dc322c9fe24f66`），從 `portable/sync-rc.3` 建立 `portable/sync-rc.4`，不直接覆蓋公司維護分支。上游 rc.3 到 rc.4 共 9 個提交，合併無檔案衝突。

## 保留的架構

維持 Windows x64 directory package、相對路徑啟動器、獨立 data／workspace、包內 Node、離線建置、停用 updater 與五個已知內建收集模組的政策。上游這段期間沒有修改 `apps/desktop/src/main.ts`、`packages/bundle/web-app/cordis.patch.yml` 與 `vendor/loader`。

## 上游變更審查

- 官方說明只有一項：ACP 模式的診斷輸出不再混入 stdout。實際程式修改在 `llm-deepseek-account`（成功載入模型目錄時的 info 訊息改寫到 stderr）與 `mcp-client`（伺服器未宣告 resources 能力時，直接回傳空清單，不呼叫 SDK）。兩處都沒有新增外連。
- UI 修正：檢視分頁的提示只在標籤被截斷時顯示。上游同時刪除 `session.moreViewsCurrent`，繁中字典已同步移除，否則 Client UI i18n 檢查會失敗。
- 其餘變更是各套件的版本號。與本衍生版同時修改的檔案只有 `browser-use-playwright-mcp`、`browser-use-runtime` 的 `package.json` 版本號，以及上述字典。Playwright 與 `@playwright/mcp` 版本未變。

## 瀏覽器升級

瀏覽器本體可沿用既有 payload。擴充內含 DSH 套件，版本由 rc.3 變為 rc.4，必須由 rc.4 來源重新準備。已啟用瀏覽器的 rc.3 包更新到 rc.4 後，需沿用 rc.3 的流程執行一次 `Enable-Browser.cmd`。

## 驗證狀態

驗證結果記錄於本機交接文件與 `deepseek-harness-tools\logs\rc4-20261030`。
