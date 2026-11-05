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
- **未驗證**：`app-boot` 全部測試（含符號連結 `EPERM` 與 `linked-resolution-matrix` 逾時）、受影響套件的分組測試、建置、成品、瀏覽器擴充、隔離演練、CI。
