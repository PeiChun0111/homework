# AI 姿勢糾正助理

這是一個純前端的姿勢偵測示範，使用手機或電腦瀏覽器開啟後可啟動相機，並根據偵測到的姿勢給予簡單回饋。

## 使用方式

1. 不要直接用 `file:///.../index.html` 開啟，因為相機功能需要安全上下文。
2. 在 `c:\Users\USER\Downloads\0601` 資料夾內執行 `serve.bat`：
   - 雙擊 `serve.bat`
   - 或在終端機執行 `python -m http.server 8000 --bind 0.0.0.0`
3. `serve.bat` 會在命令視窗中啟動伺服器，請保持該視窗開啟。
4. 若要在同一 Wi-Fi 下用手機測試，請改用電腦的局域網 IP，如：
   `http://172.20.10.6:8000`
5. 若使用電腦本機瀏覽器，則輸入 `http://127.0.0.1:8000`。
6. 若仍顯示「無法連上這個網站」，表示伺服器尚未啟動、網路未在同一局域網，或防火牆阻擋。
7. 允許瀏覽器使用相機。
8. 建議使用側面拍攝以取得更準確判斷駝背與烏龜頸。
9. 畫面下方會顯示即時回饋。

## 檔案說明

- `index.html`：主頁面
- `style.css`：樣式
- `script.js`：相機與姿勢偵測邏輯

## 注意

- 目前使用 TensorFlow.js 的 BlazePose 模型進行姿勢偵測。
- 若要在手機或任何裝置上使用「公開連結」，需要把檔案部署到外部主機或 GitHub Pages、Netlify、Vercel 等靜態網站服務。
- 目前這個專案在本機運行時，手機只能在同一 Wi-Fi 下透過電腦的局域網 IP 存取，例如 `http://172.20.10.6:8000`。

## GitHub Pages 部署指南

1. 新增一個 GitHub repository，並把本專案的所有檔案推上 `main` 分支。
2. 這個專案已包含 GitHub Actions 工作流程：`.github/workflows/deploy.yml`。
3. 推送到 `main` 後，GitHub Actions 會自動建立 `gh-pages` 分支並部署網站。
4. 將 GitHub Pages 設定為使用 `gh-pages` 分支，根目錄 `/`。
5. 網站上線後，網址通常為：
   - `https://<你的 GitHub 帳號>.github.io/<repo 名稱>/`

## GitHub Pages 注意事項

- 若要使用公開連結，務必將頁面設定為 `gh-pages` 分支。
- 若你想要直接使用 GitHub Pages 的 `main` 分支，請改成儲存庫根目錄部署，並移除 `gh-pages` Workflow。
- 若你需要，我也可以幫你生成完整 GitHub Repo 的部署步驟。