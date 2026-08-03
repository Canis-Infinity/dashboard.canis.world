# Canis Den Dashboard

Canis Den 專用後台，沿用 `iistw.com/admin` 的 Next.js standalone、Radix/shadcn UI、Tailwind、Vitest 技術棧。

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

```bash
docker compose up -d --build
```

## 驗證

```bash
npm test
npm run build
```
