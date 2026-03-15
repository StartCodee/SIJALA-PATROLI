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
VITE_API_BASE_URL=http://localhost:4200/api
VITE_SSO_PORTAL_URL=http://localhost:9000
```

## Login

Dashboard login melalui SSO redirect (OIDC) via `GET /api/auth/sso/start` + callback `/auth/callback`.

- Browser diarahkan ke portal SSO untuk memasukkan email/password.
- Setelah sukses, dashboard melanjutkan sesi verifikator tanpa form password lokal.
- Semua role, hak akses, dan sesi identitas tetap bersumber dari SSO.

## Catatan Keamanan Session

- Dashboard memakai mode auth cookie (`X-Auth-Mode: cookie`) untuk endpoint auth.
- Refresh token disimpan di cookie `HttpOnly` pada backend, bukan di localStorage.
- Frontend hanya menyimpan access token di memori runtime browser dan akan meminta token baru dari cookie saat reload.

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
- Profil akun (`/profile`) termasuk update nama dan foto profil

## Manajemen User

Halaman `/users` berfungsi sebagai entry point menuju portal SSO.
Source of truth akun, role, dan permission tidak dikelola di frontend dashboard ini.
