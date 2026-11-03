# v0.2.1-rc.5 同步與免安裝更新

同步目標固定為官方 tag `dsh-v0.2.1-rc.5`（`b830ec950faba0a46dda564be3e2d854afed94f1`），從 `portable/sync-rc.4` 建立 `portable/sync-rc.5`，不直接覆蓋公司維護分支。上游 rc.4 到 rc.5 共 4 個提交，合併無檔案衝突。

## 保留的架構

維持 Windows x64 directory package、相對路徑啟動器、獨立 data／workspace、包內 Node、離線建置、停用 updater 與五個已知內建收集模組的政策。上游這段期間沒有修改 `apps/desktop/src`、`packages/bundle/web-app/cordis.patch.yml`、`vendor` 與 `packages/boot` 的原始碼，只有 `packages/boot/*/package.json` 的版本號。

## 上游變更審查

- 官方說明只有一項：優化對話中思考內容的顯示（上游 PR #7484）。
- 實際程式修改集中在 `ui-chat`：新增 `reasoning-text.ts`，`ReasoningRow` 先把思考文字轉成顯示用文字，再交給 `conversation.chat.reasoning.body` 插槽。插槽的屬性新增 `rawText`（模型原文），`text` 改為顯示用文字。
- 受影響的消費者：`client-ui-cot-translation`（實驗性思考翻譯）的 `TranslationBody.tsx` 與 `cordis-client-runner` 的插槽目錄。上游同時新增升級指南 `docs/upgrade-guide/v0.2.1-rc.4/reasoning-body-props`。
- 不含字典修改：上游沒有新增或刪除 `locale` 或 `zh` 字典的 key，因此繁中字典不需要補。
- 沒有新增外連。上游未修改 updater、telemetry、網路請求或 Proxy 相關檔案。
- 其餘約 350 個檔案是各套件版本號。與本衍生版同時修改的檔案只有 `browser-use-playwright-mcp`、`browser-use-runtime` 的 `package.json` 版本號，合併由 Git 自動完成。Playwright 與 `@playwright/mcp` 版本未變。
- 差異統計：368 個檔案、529 行新增、399 行刪除。

## 瀏覽器升級

瀏覽器本體可沿用既有 payload。擴充內含 DSH 套件，版本由 rc.4 變為 rc.5，必須由 rc.5 來源重新準備。已啟用瀏覽器的 rc.4 包更新到 rc.5 後，需沿用 rc.4 的流程執行一次 `Enable-Browser.cmd`。

## 驗證狀態

驗證紀錄位於 `deepseek-harness-tools\logs\rc5-20261103`。

- portable 工具測試 45 項通過（Node 22.22.3 執行）。
- `scripts/portable/validate.mjs` 完整通過，結束碼 0：i18n、14 檔 260 項 portable 回歸、5 個型別檢查 gate。
- 獨立型別檢查（`scripts/build.ts --scope typecheck`）結束碼 0。
- 受影響測試改為分組、限時執行（每組 10 分鐘上限），結果如下：

| 範圍 | 結果 |
|---|---|
| `ui-chat`、`client-ui-cot-translation`（rc.5 實際改動處） | 58 檔、928 項通過 |
| `ui-conversation` | 50 檔、817 項通過 |
| `ui-sidebar`、`ui-sidebar-right` | 24 檔、338 項通過 |
| 設定與雜項 UI（7 個套件） | 106 檔、2,516 項通過、1 項跳過 |
| `llm-deepseek`、`llm-deepseek-api-key`、`llm-deepseek-account` | 30 檔、683 項通過 |
| `web-app`、listing guard、`mcp-client`、`mcp-resources` | 18 檔、208 項通過 |
| `app-boot/app-boot.spec.ts` | 83 項通過 |

- `app-boot` 有 4 項失敗，錯誤皆為建立符號連結時的 `EPERM`（本機帳號沒有建立符號連結的權限）：`profile-resolution.spec.ts` 1 項、`package-meta.spec.ts` 2 項、`compatibility-preflight.spec.ts` 1 項。失敗發生在測試自己建立 symlink 的那一行。rc.5 沒有修改 `app-boot` 的程式；這 4 項**沒有**在乾淨的 rc.4 基準上重跑比對，判斷依據是錯誤訊息與 rc.4 記錄過的同型失敗。
- `linked-resolution-matrix.spec.ts` **未驗證**：分組執行時逾時（10 分鐘），改以單一 worker、25 分鐘上限重跑仍逾時，沒有取得通過或失敗的結果。此檔屬於 `app-boot` 連結解析，不在 rc.5 修改範圍內，但這不等於它通過。
