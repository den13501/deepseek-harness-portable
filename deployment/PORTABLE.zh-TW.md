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

GitHub Actions 的 `Portable Windows (manual)` 僅手動觸發，不自動同步官方、不自動發布 Release。固定 Actions SHA 與受限權限；成功產出的成品仍須人工驗收。執行狀態以 Actions 的當次結論與日誌為準；來源驗證通過不等於完整編譯／打包成功，也不能用本機成品替代 CI 成功證據。託管 runner 完整編譯仍須驗證下載可用性、磁碟峰值與元件工具鏈。

## 發行與使用

輸出位於 `.artifacts/portable`，包含 ZIP、SHA256。ZIP 內有獨立啟動器、說明、當次靜態政策報告、建置提交與相對檔案雜湊；不從既有使用者目錄打包。完整解壓縮到本機可寫入短路徑後執行 `Start-DSH.cmd`，不要直接執行內部 EXE。

發行前確認雜湊、ZIP 完整性、授權與元件版本；以非機密資料測試繁中保存、多輪／停止、工具讀寫、Office／PDF、本機模型與重啟。Windows LTSC、端點防護、簽章與網路驗收由部署方獨立核准，禁止為測試停用安全控制。使用後的 data／workspace 不得重新打包分享。

## 上游與公開前審查

保留官方 Git 歷史，自己的 repo 使用 origin、官方使用 upstream。先保存修改，再 fetch、審查差異、在更新分支 merge 並回歸測試；不要自動覆蓋帶有衍生補丁的分支。

公開前審查所有候選檔案與將推送的 commits：敏感資訊掃描、使用者路徑、公司內部位址、金鑰、憑證、資料與日誌。測試假資料須人工確認，不因上游既有便自動豁免。自動掃描不能保證完全無敏感資訊；不需要公開的本機交接與歷史安裝清單留在版本控制之外。
