# v0.2.1-rc.3 同步與免安裝更新

同步目標固定為官方 tag `dsh-v0.2.1-rc.3`（`1f81c047fc48fa190a683e469daa699857e9afe8`），從已整合 rc.2 的 `portable/sync-rc.2` 建立 `portable/sync-rc.3`，不直接覆蓋公司維護分支。來源同步、測試、成品建置、隔離演練與實際更新分別驗收。

## 保留的架構

維持 Windows x64 directory package、相對路徑啟動器、獨立 data／workspace、包內 Node、離線建置、停用 updater 與五個已知內建收集模組的政策。Desktop product telemetry 與 product analytics 在 `DSH_OFFLINE_MODE=1` 下仍由 `cordis.patch.yml` 停用。

## 上游功能與政策審查

- 新增 `ui-entry-customization`：左側欄、對話檢視與右側欄的「更多」選單，可瀏覽外掛或以 Creator preset 建立外掛草稿。新會話會重新使用工作區內的空白 Session 與其草稿。已補齊繁中字典並註冊 `zh-TW`；`ui-sidebar`、`ui-conversation`、`ui-sidebar-right` 新增的 key 也已補齊。
- 新增選單點擊、preset 切換、送出等 product analytics 事件。所有呼叫都透過 `ctx.get('productAnalytics')?.`，公司政策封鎖該模組時不送出也不報錯。
- DeepSeek API Key 路線（`deepseek-official`）在 Messages origin 為 `https://api.deepseek.com` 且 `models` 等於內建清單時，會以 API Key 請求 `GET https://api.deepseek.com/models`，每 10 分鐘於下次存取時背景更新。本機 Strata 或其他自訂 endpoint、自訂模型清單都不會送出此請求。這是新的雲端外連條件；第一階段不設定雲端 API Key 時，也不會取得憑證送出請求。

## 瀏覽器升級

已啟用 browser 的舊包更新程式後，profile 仍記錄舊版 DSH 瀏覽器套件。`Enable-Browser.cmd` 的部署步驟現在會先驗證舊版收據、profile 依賴、已安裝套件與舊 payload 均未被修改，再移除舊版依賴、套件、設定區塊與 payload，最後部署並啟用新版。任一檢查不符即在變更前停止；版本不符的新 payload 也不會觸發移除。預檢與更新結果會提示需執行一次 Enable-Browser.cmd。

## 驗證狀態

驗證結果記錄於本機交接文件與 `deepseek-harness-tools\logs\rc3-20261027`。
