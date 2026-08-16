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

## Catatan Perbaikan yang Sudah Dilakukan (commit sesi ini)

- `feat(superadmin)`: search/filter tenants server-side (name+active) — didukung BE
- `feat(superadmin)`: client-side filter admins (nama/email/role) & audit-logs (aksi/resource)
- `feat(superadmin)`: permission picker checkbox groups + select-all (a11y)
- `feat(components)`: PaginationBar `labelPlural` opsional
- `style`: brand unify "Panel Admin - Urator"
- `feat(members)`: status filter toolbar + reset page saat filter berubah
- `refactor`: hapus bulkDelete*Mutation unused (dipakai useBulkDelete)
- `chore`: hapus react-query-demo, infoconfig.ts, auth-axios.ts + 15 unused deps
