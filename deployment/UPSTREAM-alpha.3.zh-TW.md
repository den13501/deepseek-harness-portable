# v0.2.1-alpha.3 同步與驗收

同步目標為官方 `dsh-v0.2.1-alpha.3`，提交 `2fbf4359b82fb94c03dcce0b831660d87f12ea5c`；原公司版基線為 `d743267388641bc76f17c45ce8b4c231aed1d32c`。同步分支為 `portable/sync-alpha.3`，驗證完成前不代表維護分支或既有 portable 成品已更新。

## 保留的衍生修改

保留固定內建收集停用政策、共用 boot 與 Loader 防護、Desktop 離線建置與更新停用、Host telemetry 停用，以及 Web／Desktop 繁體中文。網路與資料政策的限制仍依 `COMPANY-PRIVACY.zh-TW.md`，不是網路沙箱。

portable 來源驗證使用上游 `scripts/build.ts --scope typecheck`，先建立引用專案與 Typert 宣告，再檢查 Host／Client 聚合程式；不可用刪除測試或略過型別錯誤取代此步驟。新增翻譯的 key／插值回歸納入來源驗證。

## 升級注意事項

- Web／Desktop 優先使用已儲存憑據；headless 預設使用環境變數與 `.env`。升級前檢查獨立資料目錄的模型與憑據設定，維持核准的本地端點，不新增雲端 fallback。
- `--from-default-profile` 重建已有 profile 會替換外掛與設定，不能作為保留公司設定的升級方法。先備份資料，再驗證升級；不保證可降版讀取新 Session。
- Python SDK 的 Office 元件改為按需下載；Desktop 準備流程仍複製 Office assets 並檢查 LibreOffice 引擎。實際成品的 Office／PDF／Chromium 與斷網首次啟動仍需另外驗收。
- Azure 舊提供方名稱 `azure-openai-responses` 改為 `azure`；只有使用該提供方的設定需要遷移。
- 新增訊息金鑰遮罩只改變畫面顯示，不改變原始訊息、複製內容或傳給模型的文字，不可當作敏感資料清除機制。

## 發布門檻

來源驗證、受影響測試、Windows x64 離線 directory build 與 portable 靜態政策檢查必須分別記錄結果。既有 alpha.2 測試 ZIP 不會自動升級；新成品完成雜湊、授權與公司端驗收後才能部署。遠端 CI 需實際重跑成功，不能以本機結果替代。

## 2026-10-15 本機來源驗證

Windows x64、Node 22.22.3、pnpm 11.28.5 的 frozen lockfile 安裝完成。Client UI i18n gate 檢查 1,044 個來源檔通過；portable 政策檢查器 1 項通過；Host／Client 編譯、Typert 與兩個聚合型別檢查共 5 個階段全數通過。

首輪 portable 回歸為 253 項通過、1 項翻譯插值檢查失敗；補齊重啟提示的 `{reason}` 並移除上游刪除的字典 key 後，繁中回歸 16 項通過。四份上游新增測試補齊 `zh-TW` 註冊後，相關 81 項全數通過。此紀錄不是完整來源驗證腳本重跑成功或完整測試集通過的聲明。

尚未完成新版本 Windows directory build、ZIP、遠端 CI、實際啟動與公司端驗收；既有 Desktop 環境設定予以保留，沒有覆寫。發布仍受上述門檻約束。