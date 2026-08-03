# Canis Den Dashboard

Canis Den 專用後台，沿用 `iistw.com/admin` 的 Next.js standalone、Radix/shadcn UI、Tailwind、Vitest 技術棧。

## Port

- Dashboard: `7343`
- Container: `dashboard_canis_world`
- Backend API: 預設 `http://localhost:7344`

正式環境請在 `.env` 或部署環境設定：

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.example
```

## Docker

```bash
docker compose up -d --build
```

## 驗證

```bash
npm test
npm run build
```
