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

### BUG-BE-001: Superadmin 403 di semua operasi (BLOCKER, backend)
- **Gejala:** Semua endpoint /admin/v1 (clients, admins, roles, billing/plans) return
  403 "Anda memerlukan izin X.read" padahal login sebagai superadmin.
- **Root cause:** RBAC 2 lapis tidak konsisten:
  - Lapis 1 `middleware.Authorize()` di route → bypass superadmin (`rbac.IsSuperAdmin`) ✓
  - Lapis 2 `usecase.requirePermission(req.CallerPermissions, ...)` → TIDAK bypass;
    cek hanya daftar permission dari JWT claims.
  - JWT superadmin sengaja TIDAK berisi `permissions` claim (role superadmin tidak
    di-seed `admin_role_permissions` by design, seed_admin_rbac.sql:106-107), jadi
    claim kosong → usecase tolak semua.
  - Bukti: `pkg/jwt.GenerateAdminTokens` menyertakan permissions (jwt.go:56,61),
    `admin_auth_usecase.finalizeLogin` fetch permissions (admin_auth_usecase.go:406),
    tapi hasilnya `[]` untuk superadmin karena query join admin_role_permissions kosong.
  - Catatan: ada pola bypass yang BENAR di `admin_permission_usecase.go:41`
    (`if !rbac.IsSuperAdmin(req.CallerRoles)`), dan controller lain sudah mengisi
    `req.CallerRoles` (admin_user_controller.go:270-272, admin_permission_controller.go:33).
- **Fix yang disarankan (tim BE):**
  1. `requirePermission` (admin_role_usecase.go:363) terima `callerRoles` juga:
     ```go
     if rbac.IsSuperAdmin(callerRoles) { return nil }
     ```
  2. Semua controller admin isi `req.CallerRoles = middleware.GetAdminRoles(ctx)`.
  3. Alternatif lebih kecil: saat `finalizeLogin`, kalau admin punya role superadmin,
     isi permissions claim dengan semua permission yang ada.
- **Dampak frontend:** halaman Tenants/Admins/Roles/Plans superadmin menampilkan
  empty state (data kosong) — UI siap, tinggal backend di-fix.
- **File backend terkait:**
  - `internal/usecase/admin_role_usecase.go:363` (requirePermission)
  - `internal/usecase/admin_tenant_usecase.go:70`, `admin_user_management_usecase.go:66`
  - `internal/delivery/http/controller/admin_client_controller.go:49` (isi CallerRoles)
  - `internal/delivery/http/middleware/authorize.go:17` (bypass benar, layer 1)

### BUG-BE-002: /admin/v1/admins & /audit-logs tidak mendukung filter
- **Gejala:** tidak ada param search/status/action — frontend terpaksa filter
  client-side per halaman (kompromi).
- **Bukti:** `AdminUserListRequest` hanya Offset/Limit (admin_model.go),
  `AuditLogController.GetPlatformLogs` hanya page/limit (audit_log_controller.go:49-60).
- **Fix yang disarankan:** tambah `?search=` (name/email) di `/admin/v1/admins` dan
  `?action=&resource=` di `/admin/v1/audit-logs` (pola `order_repository.go:186`
  / `telegram_user_repository.go:60`).

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
| GET /admin/v1/clients | name/slug/active/subscription_tier | ✅ (name ILIKE partial) |
| GET /admin/v1/clients | search | ❌ (pakai `name`) |
| GET /admin/v1/admins | search | ❌ (belum ada) |
| GET /admin/v1/audit-logs | search/action/resource | ❌ (belum ada) |

## Catatan Perbaikan yang Sudah Dilakukan (commit sesi ini)

- `feat(superadmin)`: search/filter tenants server-side (name+active) — didukung BE
- `feat(superadmin)`: client-side filter admins (nama/email/role) & audit-logs (aksi/resource)
- `feat(superadmin)`: permission picker checkbox groups + select-all (a11y)
- `feat(components)`: PaginationBar `labelPlural` opsional
- `style`: brand unify "Panel Admin - Urator"
- `feat(members)`: status filter toolbar + reset page saat filter berubah
- `refactor`: hapus bulkDelete*Mutation unused (dipakai useBulkDelete)
- `chore`: hapus react-query-demo, infoconfig.ts, auth-axios.ts + 15 unused deps
