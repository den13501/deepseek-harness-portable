# Portable 維護與驗收參考

本衍生版提供繁體中文、離線更新模式與固定內建收集停用政策；不是官方發行版、網路沙箱或無痕環境。政策邊界見 `COMPANY-PRIVACY.zh-TW.md`。使用者已回報本機 GPU 模型推論成功，但不代表工具、Office、LTSC 或網路驗收全數通過。

## 建置

在具備 Node 24、package.json 指定 pnpm 與 Visual Studio C++ 工具的 Windows x64 準備機，於 repo 根目錄執行：

```powershell
pnpm install --frozen-lockfile
node scripts/portable/validate.mjs
pwsh -NoProfile -File scripts/portable/build.ps1
```

建置腳本僅在 Desktop 環境檔不存在時建立臨時離線設定，完成後移除；若已有設定便拒絕覆寫，請使用乾淨工作樹。只生成未簽章 directory build，不發布更新 feed。依賴與 runtime 在準備機仍需要下載；「離線」描述成品執行政策，不表示冷啟動編譯不需網路。

本衍生版目前沒有雲端建置：GitHub Actions 的 `Portable Windows (manual)` 已於 2026-11-19 移除，成品以本機建置為準。日後若要雲端建置，改用自建 Windows runner 並重新規劃；先決定工具鏈（Node 24、pnpm、Visual Studio C++ 工具、7-Zip、`pwsh`、Git long paths）、磁碟峰值、網路隔離與授權。歷史執行紀錄見 `UPSTREAM-0.2.2-rc.2.zh-TW.md` 的「CI 結果」。

## 發行與使用

輸出位於 `.artifacts/portable`，包含 ZIP、SHA256。ZIP 內有獨立啟動器、說明、當次靜態政策報告、建置提交與相對檔案雜湊；不從既有使用者目錄打包。完整解壓縮到本機可寫入短路徑後執行 `Start-DSH.cmd`，不要直接執行內部 EXE。

發行前確認雜湊、ZIP 完整性、授權與元件版本；以非機密資料測試繁中保存、多輪／停止、工具讀寫、Office／PDF、本機模型與重啟。Windows LTSC、端點防護、簽章與網路驗收由部署方獨立核准，禁止為測試停用安全控制。使用後的 data／workspace 不得重新打包分享。

## 保留設定的免安裝更新

發行包包含唯讀預檢、更新與回復入口；使用者應從乾淨新包更新既有固定目錄，而非將資料分散到每個版本目錄。完整使用方式、外部 Skills／MCP 路徑限制、快照隱私與中斷回復見 `scripts/portable/README.zh-TW.md`。更新工具測試納入 portable 來源驗證（`scripts/portable/validate.mjs`），不能以檔案複製成功代替資料相容性驗收。

## 上游與公開前審查

保留官方 Git 歷史，自己的 repo 使用 origin、官方使用 upstream。先保存修改，再 fetch、審查差異、在更新分支 merge 並回歸測試；不要自動覆蓋帶有衍生補丁的分支。

公開前審查所有候選檔案與將推送的 commits：敏感資訊掃描、使用者路徑、公司內部位址、金鑰、憑證、資料與日誌。測試假資料須人工確認，不因上游既有便自動豁免。自動掃描不能保證完全無敏感資訊；不需要公開的本機交接與歷史安裝清單留在版本控制之外。
