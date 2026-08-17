# QA Testing Notes — E2E Loop (16 Agu 2026)

Metodologi: systematic-debugging (root cause dulu, baru fix). Semua bug ditemukan
via E2E manual playwright-cli di browser headed, lalu diverifikasi setelah fix.

## Hasil E2E

### Tenant (crypto-bro)

| Halaman | Status | Catatan |
|---|---|---|
| Login | PASS | Redirect ke /crypto-bro/dashboard/overview, 0 console error; error password salah ter-map "Gagal masuk — Email atau password salah" |
| Overview | PASS | Stat cards + bar chart + polling, tombol "Muat Ulang", 0 error |
| Transactions | PASS | Badge "Lunas" utk status paid; search `?search=fadli` dikirim server-side; pagination page=2; filter status |
| Members | PASS | Search + status filter (`?status=expired` → getMembers({status})) + package filter; kombinasi search+status; drawer detail; dropdown menu 5 item; bulk kick modal "2 member · 3 langganan aktif" |
| Bots | PASS | Card grid + checkbox selection bar "1 bot dipilih" + AlertModal konfirmasi hapus |
| Groups | PASS | Sync group ("berjalan di background"), dialog hubungkan grup |
| Packages | PASS | Card "Per Grup", dialog edit paket (Nama/Harga/Durasi/Hubungkan Grup) |
| Commands | PASS | Quota guard "Limit Tercapai" disabled (tenant tanpa paket aktif) |
| Broadcast | PASS | Bot picker, riwayat table, quota guard "Limit Tercapai" |
| Billing | PASS | Empty state benar ("Belum ada penagihan aktif") + tabs |
| Midtrans | PASS* | *2 console error = third-party: (1) CSP inline-script dari Midtrans sandbox sendiri, (2) 409 order sudah settlement (transaksi duplikat ditolak) — bukan bug frontend |
| Overview kbar | PASS | Ctrl+K → navigasi Transaksi |
| Register | PASS | `/register-tenant`, validasi inline ("Nama lengkap wajib diisi", password min 8) |
| Forgot password | PASS | Form email ada |
| Landing | PASS | Pricing lokal (Gratis/Pemula/Berkembang/Skala), modal "Lihat semua fitur (9)" |
| Checkout | PASS | Harga Rp 300.000, metode Midtrans, 0 error frontend |
| Mobile viewport | NOT TESTED | playwright-cli tanpa command viewport — perlu test manual/CI |

### Superadmin

| Halaman | Status | Catatan |
|---|---|---|
| Login | PASS | Title "Panel Admin - Urator" (brand fix verified) |
| Overview | PASS | Stat cards, "Aktivitas Admin Terbaru", "Top Tenants", brand "Urator" |
| Audit Logs | PASS | Filter aksi (Membuat/Mengubah/...) + resource client-side — terverifikasi hanya row terfilter tampil |
| Tenants | BLOCKED | 403 "Anda memerlukan izin clients.read" — BUG-BE-001 (backend). Toolbar search+status tampil benar |
| Admins | BLOCKED | 403 "Anda memerlukan izin admins.read" — BUG-BE-001. Search input tampil |
| Roles | BLOCKED | 403 "Anda memerlukan izin roles.read" — BUG-BE-001 |
| Plans | BLOCKED | 403 "Anda memerlukan izin billing.read" — BUG-BE-001, empty state "Belum ada paket terdaftar" |

## Observasi Data (bukan bug frontend)

- Tenant crypto-bro punya transaksi paid (Rp 300.000, "Lunas") tapi billing page "Belum ada
  penagihan aktif" — kemungkinan order settlement belum di-assign ke subscription.
  Perlu verifikasi alur backend: payment callback → create subscription.
- Broadcast & Commands terkunci "Limit Tercapai" karena tenant tidak punya paket aktif —
  konsisten, quota guard bekerja.

## Bug Ditemukan

### BUG-BE-001: Superadmin 403 di semua operasi (BLOCKER, backend) — PARTIAL FIX
- **Gejala:** Semua endpoint /admin/v1 (clients, admins, roles, billing/plans) return
  403 "Anda memerlukan izin X.read" padahal login sebagai superadmin.
- **Root cause:** RBAC 2 lapis tidak konsisten:
  - Lapis 1 `middleware.Authorize()` di route → bypass superadmin (`rbac.IsSuperAdmin`) ✓
  - Lapis 2 `usecase.requirePermission(req.CallerPermissions, ...)` → TIDAK bypass;
    cek hanya daftar permission dari JWT claims.
  - JWT superadmin sengaja TIDAK berisi `permissions` claim (role superadmin tidak
    di-seed `admin_role_permissions` by design, seed_admin_rbac.sql:106-107), jadi
    claim kosong → usecase tolak semua.
- **Status 16 Agu 11:05 (setelah restart BE, commit 0572fd6):**
  - ✅ FIXED: `requirePermission` kini variadic terima callerRoles + bypass superadmin;
    `admins` & `roles` jalan live (data tampil, `?search=` bekerja)
  - ❌ BELUM: `clients` & `billing/plans` masih 403 — controller
    `admin_client_controller.go` (7 titik) & `client_billing_controller.go` (3 titik)
    belum mengisi `req.CallerRoles`; `platform_plan_usecase.go` & `client_billing_usecase.go`
    (3 titik) masih `rbac.HasPermission(callerPermissions, ...)` tanpa bypass.
  - File terkait yang masih perlu diedit (untuk tim BE):
    - `internal/delivery/http/controller/admin_client_controller.go` (tambah
      `CallerRoles: middleware.GetAdminRoles(ctx)` di semua 7 req)
    - `internal/delivery/http/controller/admin_client_user_controller.go` (5 titik)
    - `internal/delivery/http/controller/client_billing_controller.go` (3 titik,
      model sudah punya CallerRoles)
    - `internal/delivery/http/controller/platform_plan_controller.go` + interface
      `IPlatformPlanUseCase` (5 fungsi terima callerRoles)
    - `internal/usecase/client_billing_usecase.go:519,618,653` →
      `requirePermission(req.CallerPermissions, "...", req.CallerRoles)`

### BUG-BE-002: /admin/v1/admins & /audit-logs tidak mendukung filter — FIXED ✅
- **Seharusnya:** tambah `?search=` (name/email) di `/admin/v1/admins` dan
  `?action=&resource=` di `/admin/v1/audit-logs` (pola `order_repository.go:186`
  / `telegram_user_repository.go:60`).
- **Status:** FIXED di commit 0572fd6 — verified live 16 Agu 11:05:
  - `admins?search=uhamka` → 1, `?search=zzz_bogus` → 0
  - `audit-logs?action=kick_member` → hanya kick_member; `?resource=subscription` → 16
  - Frontend sudah di-upgrade ke server-side (commit 39ea29f)

### BUG-FE-001: (tidak ada — semua halaman tenant & superadmin non-RBAC PASS)

Tidak ditemukan bug frontend baru dalam E2E loop ini. Temuan yang muncul (CSP
Midtrans, 409 order duplikat, 404 /register) semuanya false-positive/third-party
— detail di tabel hasil E2E di atas.

## Verifikasi Param API (hasil tes langsung)

| Endpoint | Param | Dukungan |
|---|---|---|
| GET /api/v1/tenant/transactions | search | ✅ (username/first/last_name/external_id ILIKE) |
| GET /api/v1/tenant/transactions | status | ✅ |
| GET /api/v1/tenant/members | search/status/package_id | ✅ |
| GET /admin/v1/clients | name/slug/active/subscription_tier | ✅ (name ILIKE partial) — tapi endpoint masih 403 (lihat BUG-BE-001) |
| GET /admin/v1/clients | search | ❌ (pakai `name`) |
| GET /admin/v1/admins | search | ✅ (name/email, commit 0572fd6) |
| GET /admin/v1/audit-logs | search/action/resource | ✅ (action + entity_type, commit 0572fd6) |

## Incident (16 Agu 11:07)

- **Gejala:** `Module transactions-listing-content.tsx ... but the module factory is not
  available` — 500 sekali lalu 200, halaman transactions.
- **Root cause:** state Turbopack korup (dev server di-kill paksa saat kompilasi berjalan
  di sesi sebelumnya) — BUKAN bug kode.
- **Fix:** kill dev server + hapus `.next` + restart bersih. Verified: transactions,
  members, broadcast, superadmin admins/audit-logs semua 200, 0 error di log.

## Catatan Perbaikan yang Sudah Dilakukan (commit sesi ini)

- `feat(superadmin)`: search/filter tenants server-side (name+active) — didukung BE
- `feat(superadmin)`: client-side filter admins (nama/email/role) & audit-logs (aksi/resource)
- `feat(superadmin)`: permission picker checkbox groups + select-all (a11y)
- `feat(components)`: PaginationBar `labelPlural` opsional
- `style`: brand unify "Panel Admin - Urator"
- `feat(members)`: status filter toolbar + reset page saat filter berubah
- `refactor`: hapus bulkDelete*Mutation unused (dipakai useBulkDelete)
- `chore`: hapus react-query-demo, infoconfig.ts, auth-axios.ts + 15 unused deps

## Incident: Kirim Ulang Tautan — pilihan paket tidak muncul (16 Agu 15:36)

- **Gejala:** pilih "Kirim ke satu paket" → Select "Memuat paket..." selamanya
  (disabled); untuk member tanpa paket aktif muncul pesan "tidak punya paket aktif".
- **Root cause:** `HeadersTimeoutError` (UND_ERR_HEADERS_TIMEOUT) di server action
  `getMember` — keep-alive connection pool undici di dev server Next berisi koneksi
  ke instance backend LAMA (BE di-restart berkali-kali); request dialokasikan ke
  koneksi mati → hang ~6.5 menit → query member detail tidak pernah resolve.
  Bukan bug kode frontend (log: "POST /dashboard/members 404 in 6.5min").
- **Fix:** restart dev server Next (reset pool). Verified: dropdown paket aktif
  tampil normal.
- **Pelajaran:** setelah restart backend BE, restart juga dev server frontend;
  kalau sering, pasang undici dispatcher dengan keepAliveTimeout pendek di
  api-client (belum dilakukan — YAGNI sampai sering terjadi).

## Fitur Baru: Laporan (16 Agu 2026) — verified live
- Menu sidebar+kbar "Laporan" (/dashboard/reports), 2 tab: Pengaturan & Kegagalan
- GET/PUT /report-settings: default {enabled:false, target 0, bot zero-uuid, 08:00};
  PUT tersimpan konsisten (verified target 555666777 → GET sama)
- GET /report-failures: empty state "Tidak ada kegagalan" (DB dev belum ada
  job_events); list + dialog detail BELUM diverifikasi dengan data nyata —
  perlu seed/kejadian gagal untuk verifikasi visual
- Catatan: tab Kegagalan tidak berpindah saat eval .click() — Radix Tabs butuh
  click penuh (playwright native click bekerja); bukan bug
- Backend: restart perlu agar endpoint report aktif (source BE af5e73d sudah ada)

## Bug: Delete bot gagal tapi toast sukses (16 Agu 2026)
- **Gejala:** DELETE /api/v1/tenant/bots/:id kena FK groups_bot_id_fkey (bot masih
  terhubung grup) → BE error 500, tapi UI toast "Bot berhasil dihapus".
- **Root cause (frontend):** service meng-catch error BE dan me-resolve
  `{success:false}` (bukan throw) → `useMutation.onSuccess` tetap dipanggil
  → toast sukses palsu. Pola ini sistemik di semua fitur CRUD tenant.
- **Fix (4259c83):** onSuccess cek `res.success`, tampilkan `res.message` (ID)
  saat gagal — bots (delete/toggle/disconnect/sync), commands, discounts,
  groups, packages. Form dialogs (create/update) sudah cek sejak refactor.
- **Tersisa:** broadcast-form-dialog + migration members belum dicek res.success
  di onSuccess (scan berikutnya kalau muncul gejala serupa).

## Fitur: Transfer grup saat hapus bot (16 Agu 2026) — commit 406ecd2
- BE SUDAH punya /transfer (telegram_webhook_usecase.go:659 handleTransferCommand,
  transfer_ok callback): admin grup jalankan /transfer@botBaru KODE → konfirmasi
  inline → grup.BotUUID diganti bot baru + is_active true + status redis success.
- FE: use-connect-flow mode 'transfer' (command /transfer@), GroupTransferRow
  (pilih bot tujuan → Buat Kode → salin → poll status) di modal hapus bot.
- Dibatalkan: pindah via PUT groups bot_id (palsu — bot baru belum di grup).
- Catatan BE: disconnect (telegram_group_usecase.go) hanya set is_active=false,
  TIDAK melepas bot_id → disconnect tidak cukup untuk hapus bot; /transfer adalah
  jalur yang benar. Saran: disconnect set bot_id=NULL agar konsisten.
- E2E penuh belum diverifikasi (butuh backend + bot/grup Telegram nyata untuk
  menjalankan /transfer).
