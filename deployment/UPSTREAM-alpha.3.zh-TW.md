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

首輪 portable 回歸為 253 項通過、1 項翻譯插值檢查失敗；補齊重啟提示的 `{reason}` 並移除上游刪除的字典 key 後，繁中回歸 16 項通過。四份上游新增測試補齊 `zh-TW` 註冊後，相關 81 項全數通過。

合併提交後重新執行 `node scripts/portable/validate.mjs` 已成功：i18n、14 個測試檔共 255 項回歸，以及 5 個型別檢查階段全部通過；另重跑 portable 政策檢查器 1 項通過。這是 portable 選定來源驗證通過，不代表全儲存庫測試集或打包驗收通過。提交 hooks 的翻譯配對、lint、空白、提供方 metadata 與 vendor manifest 檢查亦通過。

上述來源驗證完成時，尚未執行新版本打包；後續本機結果見下一節，不能以本機成功替代遠端 CI 或公司端驗收。

## 2026-10-15 本機測試包

以 `8cd4a68c117563b9c8bf83a781255cb5f2b1724a` 建置 Windows x64 未簽章測試包。重新執行 frozen-lockfile 安裝、i18n、255 項回歸、5 階段型別檢查、政策檢查器及完整編譯 9 階段通過；directory build、封裝後 runtime smoke 與 portable ZIP pipeline 均成功。

第一次建置在 runtime pnpm smoke 逾時，未產出 ZIP；獨立診斷通過後，未修改來源、未放寬逾時或略過 smoke，完整重跑成功。首次逾時根因尚未確定。封裝前後測試包含 pnpm、PTY、原生元件、CLI 離線外掛安裝／移除、Host 啟動與 DOCX／XLSX／PPTX 轉 PDF；固定樣本通過不代表公司文件、字型或模型工具呼叫相容。

測試包名稱為 `DSH-portable-0.2.1-alpha.3-win-x64-8cd4a68c1175.zip`，398,608,329 bytes，SHA-256：`56A5C50F53955339337B630792BD9AA40081AA38490FDE236AD5D6D49CD1AC11`。7-Zip 完整性、7,809 個應用檔案複製比對、7,813 筆包內雜湊及整包雜湊通過。成品六項靜態政策檢查通過，包含離線旗標、無 mandatory policy、無更新 YAML 與固定隱私政策掛鉤。

內嵌 Node `24.21.0`、Python `3.12.14`、pnpm `11.28.5`、LibreOffice Windows x64 engine `0.1.5`。建置時僅本文件之外的 `deployment/PORTABLE.zh-TW.md` 說明修改尚未提交，故成品如實記錄 `dirty: true`；該修改及 Desktop 環境設定建置前後均保持不變。此後的文件提交不是該 ZIP 的建置來源。

使用者回報已在準備機順利完成設定；未另外確認互動 GUI 全流程、模型推論與工具呼叫。包內未預置獨立 Chromium，不能以 Electron 內嵌 Chromium 代替核准的自動化瀏覽器。遠端 CI、公司 Windows LTSC／Strata、網路與部署核准仍未完成。此包不是完整公司部署驗收通過的正式發行版；既有安裝與舊 ZIP 未替換。