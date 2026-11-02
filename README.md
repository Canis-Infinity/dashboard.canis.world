# Canis Den Dashboard

Canis Den 專用後台，沿用 `iistw.com/admin` 的 Next.js standalone、Radix/shadcn UI、Tailwind、Vitest 技術棧。

## 網站管理導覽

Canis World 使用 Sidebar 的「網站管理」二階選單，各項目有獨立路由與表單：

- `/canis-world/status`：今日狀態
- `/canis-world/profile`：角色介紹
- `/canis-world/entries`：日常紀錄
- `/canis-world/content`：頁面文案
- `/canis-world/faqs`：常見問題
- `/canis-world/features`：資訊卡片
- `/canis-world/footer`：頁尾版權

設定表單只儲存當頁區塊；頁面搜尋可直接前往各子頁。舊 `/canis-world?tab=...` 入口已移除。

## Port

- Dashboard: `7343`
- Container: `dashboard_canis_world`
- Backend API: 由同源 `/api/*` 代理到 backend `7344`

瀏覽器固定透過 dashboard 同源的 `/api/*` 存取 API，不接受公開環境變數改寫。Docker 內由 Next.js rewrite 使用 server-only 位址連線：

```bash
INTERNAL_API_BASE_URL=http://host.docker.internal:7344
```

因此電腦與手機都只會呼叫目前 dashboard 網域，不需要額外公開 backend port 或 API 子網域。

## Docker

正式伺服器已於 2026-11-02 記錄遷移至 `root@211.21.92.115:22`，部署目錄為 `/home/dashboard.canis.world`。

```bash
ssh root@211.21.92.115
cd /home/dashboard.canis.world
git pull --ff-only
docker compose up -d --force-recreate
```

容器啟動後會安裝依賴並建置，需等待健康狀態為 healthy，再確認 `https://dashboard.canis.world/login` 可用。

```bash
docker compose up -d --build
```

## 驗證

```bash
npm test
npm run build
```
