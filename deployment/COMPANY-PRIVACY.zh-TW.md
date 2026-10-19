# 公司版 Harness 額外回傳停用政策

## 範圍與維護

這個來源分支在共用 `boot()` 安裝固定公司政策，不讀環境變數或使用者設定，適用透過此啟動入口的 Desktop 與 CLI。不是只改預設值，也不刪除上游模組。

政策唯一清單在 `packages/boot/app-boot/src/company-privacy-policy.ts`，禁止產品分析收集／傳輸、OTel Session 上傳、官方模型請求的 `dsh_session_log` 與 `dsh_plugin_packages` 貢獻模組。依模組名稱與套件子路徑匹配，不依 entry ID。

Loader 的通用 `loader/entry-disabled` waterfall 在 entry 有效停用判斷與直接 `init()` 生效，涵蓋組態重新載入、巢狀 Include、變更 ID 與動態啟用。一般 `disabled: false` 不能覆寫公司政策。設定表單與 client 模組投影應以有效停用狀態／運作中的 fiber 為準，不另修改翻譯字典。

保留本機對話紀錄、正常模型 messages、工具、手動匯出與本機外掛清單功能。不刪除通用 API extension registry 或 OTel 基礎套件。

## 邊界

這不是作業系統網路沙箱，也不能防止任意第三方插件、直接用程式 API 掛載模組或修改公司來源碼。絕對路徑／別名匯入不在目前套件名稱比對保證內。SDK 嵌入者若不使用共用 boot，須另行評估。
新上游機制不會自動進入禁止清單；同步時必須檢查新增的事件傳輸、HTTP 目的地與模型請求擴充欄位。不保證模型供應商如何處理正常推論資料。

## 驗證

- `packages/boot/app-boot/tests/company-privacy-policy.spec.ts`：所有已知模組、子路徑、動態更新、直接 init、巢狀設定重載與正常插件行為。
- `packages/llm/llm-deepseek/tests/company-privacy.spec.ts`：本機 HTTP 假模型，正常推論可完成且請求無上述兩項擴充欄位。
- 發行前跑 app-boot、HMR、plugin-manager、settings 回歸及 Host／Client typecheck，再重建。
- 成品仍需確認共用 boot 政策已封裝、GUI 設定與聊天正常；來源測試通過不等於成品驗收完成。

同步上游時將政策、Loader 接合點與測試作為獨立維護單元，避免與繁中翻譯／LTSC 修補混在同一 commit。不得以 reset／clean 丟棄既有工作樹變更。