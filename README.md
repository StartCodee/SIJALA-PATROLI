# SIJALA-PATROLI Dashboard

Frontend dashboard untuk verifikasi laporan patroli, monitoring RUM, monitoring lainnya, serta CRUD master data pelabuhan/pos dan personel.

## Prasyarat

- Node.js 18+
- Backend `API-SIJALA-PATROLI` berjalan di lokal

## Menjalankan Lokal

```bash
npm install
cp .env.example .env
npm run dev
```

Default API:

```env
VITE_API_BASE_URL=http://localhost:4100/api
```

## Build

```bash
npm run build
```

## Halaman yang sudah terhubung API

- Dashboard (`/`)
- Daftar & detail patroli (`/patrols`, `/patrols/:id`) + aksi verifikasi
- Monitoring RUM (`/monitoring-megafauna`, `/monitoring-megafauna/:id`) + aksi verifikasi
- Monitoring lainnya (`/monitoring-habitat`, `/monitoring-habitat/:id`) + aksi verifikasi
- CRUD pelabuhan/pos (`/guard-posts`)
- CRUD personel (`/crew`, `/crew/:id`)
