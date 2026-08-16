# Session Summary — TG Manager Frontend

Dokumen ini merangkum pekerjaan yang dilakukan pada sesi pengembangan ini, kendala yang dihadapi, dan pekerjaan yang belum selesai.

---

## Yang Sudah Dibuat / Diubah

### 1. Broadcast — Editor Rich Text (Tiptap)
- **File:** `src/features/broadcast/components/telegram-editor.tsx` (baru), `broadcast-form-dialog.tsx`
- Upgrade dari textarea + toolbar HTML manual menjadi **Tiptap editor** dengan subset HTML Telegram (`<b>`, `<i>`, `<u>`, `<s>`, `<code>`, `<a>`, `<pre>`)
- Toolbar: Bold, Italic, Underline, Strike, Link, Code + preview toggle (Telegram bubble)
- Character counter via `TiptapCharacterCount`
- Deps baru: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-placeholder`, `@tiptap/extension-underline`, `@tiptap/extension-character-count`, `@tiptap/extension-history`

### 2. Broadcast — Konfirmasi Siaran
- **File:** `broadcast-confirm-dialog.tsx` (baru)
- Confirmation step sebelum kirim: preview bubble, target + reach, file (thumbnail/PDF via `URL.createObjectURL`), jadwal
- Flow: klik "Kirim Siaran" → dialog konfirmasi → "Ya, Kirim"

### 3. Broadcast — Jangkauan & Grup Spesifik
- API `GET /api/v1/tenant/broadcast-reach` → `{ group_count, member_count }`
- Dropdown "Tujuan Pengiriman" + info jangkauan + **picker grup spesifik** (multi-select checkbox, Pilih Semua/Kosongkan)
- `group_ids` dikirim via `CreateBroadcastRequest.group_ids`

### 4. Broadcast — Failed Details Popover
- Kolom `failed_count` → popover detail per `chat_id` + `error` (dari `failed_details`)

### 5. Fitur Transaksi (baru)
- **File:** `src/features/transactions/` (api + komponen) + route `/dashboard/transactions` + menu sidebar
- DataTable: Tanggal, Member, Paket, Total Bayar (Rupiah), ID Transaksi, Status
- Filter status dropdown + pagination + sort
- API contract: `GET /api/v1/tenant/transactions?page=&limit=&status=` → `{ data, meta }` (**backend belum ada**)

### 6. Checkout — Redesign
- `/checkout` (public-checkout-page) & `/checkout/success` redesign selaras landing page
- Harga prominent, metode pembayaran, CTA jelas, hapus animasi aneh (icon berputar, tombol pulse)

### 7. Dashboard — Chart
- `AreaGraph` → `BarGraph` di overview ("Tren Pendapatan")
- Fix crash: `new Date(dateStr)` + guard NaN

### 8. Fix Redirect Loop (Penting)
- **File:** `src/proxy.ts`
- Bug: loop redirect antara `/dashboard/overview` ⇄ `/login` karena proxy redirect user dari `/login` ke `/dashboard/overview` walau token invalid
- Fix: hapus blok `isAuthRoute && hasToken` redirect

### 9. Bulk Delete — Semua Menu Tenant (sesuai guide)
- Mengikuti `bulk_delete_frontend_integration_guide.md` → `DELETE /api/v1/tenant/{resource}/bulk` dengan body `{ ids }`
- **Groups:** `groups/bulk` (DataTable + checkbox)
- **Commands:** `commands/bulk` (DataTable + checkbox)
- **Discounts:** `discounts/bulk` (DataTable + checkbox)
- **Packages:** `packages/bulk` (card grid + checkbox kartu)
- **Bots:** `bots/bulk` (card grid + checkbox kartu)
- Semua: selection bar di toolbar → AlertModal konfirmasi → toast best-effort (`deleted`/`failed`)

### 10. Bulk Actions Members — Redesign
- **File:** `bulk-action-bar.tsx`
- Satu modal pivot **per-paket** (dipisah jadi 2 modal: Keluarkan & Perpanjang)
- Multi-select paket, peringatan member tanpa paket aktif, scrollable package list
- Inline validation error (bukan disabled button)
- Toolbar selection bar konsisten dengan group

### 11. Fix & Polish Lain
- `use-data-table.ts`: `getRowId` → selection key by `id` (fix centang "pindah" setelah delete)
- Pruning selection stale di card grid (packages/bots)
- Group inactive reason → hover tooltip
- Group/commands/discounts pagination: `pageCount: 1` → `-1` (client-side)
- Kolom select `enableHiding: false` konsisten
- `DataTableToolbar` prop `hideViewOptions`
- Date-time field clamp min/max
- Bot form "Batal" fix di edit mode
- Admin login loading state
- Column meta label view options

---

## Kendala yang Dihadapi

1. **Redirect loop** — root cause kombinasi: route overview lama dihapus tapi banyak referensi `dashboard/overview`, ditambah proxy auth redirect dengan token invalid. Butuh debug logging di middleware (`console.log` di `proxy.ts`) untuk menemukan loop. Fix akhir: hapus blok auth redirect.
2. **Route migration setengah jadi** — working tree punya migrasi `[locale]/dashboard/*` → `[tenant]/dashboard/*` yang belum selesai (banyak file `[locale]/dashboard/*` terhapus + `[tenant]/dashboard/*` untracked). Ini membuat struktur route ganda yang membingungkan.
3. **TanStack Table selection by index** — bug halus: selection di-key pakai row index, jadi setelah delete centang "pindah" ke baris lain. Fix `getRowId`.
4. **`<SelectItem value=''>`** — Radix Select tidak izinkan empty string value, perlu sentinel (`'all'`).
5. **Card grid checkbox overlap** — checkbox menabrak logo bot & dropdown titik-3, butuh reposition + padding-top (`pt-9`).

---

## Yang Belum Selesai / Pending

1. **API transaksi belum ada di backend** — frontend siap (`GET /api/v1/tenant/transactions`), backend harus dibuat.
2. **Bulk delete admin panel** — guide menyebut `roles`, `admins`, `clients`, `plans` (admin JWT) — belum dikerjakan.
3. **`bulkDelete*Mutation` unused** — mutation options dibuat tapi handler memakai service langsung (`bulkDeleteGroups` dll). Bisa dirapikan atau dipakai.
4. **Bugs table lain** — bots/commands/discounts masih `pageCount: 1` saat sesi awal (belum tentu di-fix semua; grup di-fix). Perlu verifikasi.
5. **DOMPurify untuk `dangerouslySetInnerHTML`** — defense-in-depth untuk HTML editor (dari review).
6. **P2 dari critique tabel grup** — warna emerald dual-makna, tint selection, kontras badge 10px, icon-well gradient, header kolom aksi.
7. **Breadcrumbs / nav masih menunjuk `/dashboard/overview`** yang sekarang catchAll → tenant slug (perlu verifikasi setelah migrasi).

---

## Catatan Teknis

- **Konteks:** Next.js 16.2.6, React 19, TanStack Query v5, TanStack Form, shadcn/ui, Tailwind, Tiptap
- **Commits:** ~30 commits di branch `main` selama sesi
- **Graph:** knowledge graph tersedia di `graphify-out/` — jalankan `graphify update .` setelah perubahan
- **Deps baru:** @tiptap/* (7 package)

---

# Sesi 2 — De-slop & Konsistensi (16 Agu 2026)

## Yang Sudah Dibuat / Diubah

### 1. Kritik & Audit (skill impeccable)
- Kritik tersimpan di `.impeccable/critique/`: landing+auth **28/32**, tenant dashboard **27/40**, superadmin **18/40**
- Report arsitektur: `C:\Users\Fadli\AppData\Local\Temp\opencode\architecture-review-20260816.html` (7 kandidat deepening; top: dedup bulk-delete)

### 2. Landing page & Auth
- Pricing: nama plan di-lokalkan via slug map (Gratis/Pemula/Berkembang/Skala), fitur 5+ "Lihat semua fitur" → **modal** (3 pola ditolak user: expand-inline shift, popover, panel bawah grid), badge flat, `tabular-nums`, `aria-pressed`
- Hero video 404 fix (`/Urator.mp4` → `/Uration.mp4`), radius CTA `rounded-full` → `rounded-xl`
- `testimonial.tsx` (dead code, persona palsu) dihapus
- Register: password requirements `role="status"` + `aria-describedby`; `data-scroll-behavior='smooth'` di `<html>`
- Rasio logo dikoreksi di 6 file (hapus warning aspect-ratio)

### 3. Dashboard tenant — lokalisasi chrome
- `nav-config.ts` single source: Dasbor/Bot/Member/Grup/Paket/Perintah/Siaran → sidebar + kbar + breadcrumb (labelMapping) + page titles + error boundary (ID) + infobar ("Pusat Bantuan" + link t.me/UrationSupportBot)
- `api/auth/session` + `api/auth/admin-session` → 200 `{accessToken: null}` (bukan 401) — konsol bersih

### 4. Fitur tenant
- **Members**: search server-side (`?search=`, debounce 400ms, reset page); `status` param sudah didukung API
- **Broadcast**: scope grup eksplisit (radio "Semua grup aktif" vs "Pilih grup tertentu") — hapus inversi "kosong=semua"; quota alert → "Tingkatkan Paket" (navigasi billing)
- **Bulk delete dedup**: `useBulkDelete` hook (`src/hooks/use-bulk-delete.ts`) + `RowSelectionBar` (`src/components/ui/table/row-selection-bar.tsx`) — dipakai groups, discounts, commands, packages, bots (~250 baris duplikasi hilang)
- **Packages**: `confirm()` native → AlertModal
- Badge status: warna konvensi ditegakkan (merah=murni error, emerald=aktif, violet=role); size badge groups → violet
- Sidebar highlight parent di detail page; empty states commands+transactions; setTimeout hacks members dihapus; skeleton bots; stat cards non-klik tanpa hover-lift

### 5. Status mapping backend (dari user, 3 lapis)
- `orders.status`: `pending/paid/expired/failed` — frontend dulu pakai `settled/success` (tidak ada di BE). `paid` → "Lunas"
- `client_billings.status`: `pending/active/past_due/cancelled` — superadmin plans subscriptions + type `ClientSubscription` + filter pills + StatPill ("Terlambat" orange)
- Tenant billing `formatStatus`: `past_due` → "Terlambat" (sebelumnya bocor string mentah)

### 6. Superadmin (approved scope: P0+P1)
- **[P0]** Edit Admin role: wire `useSyncAdminRoles` (sebelumnya silent no-op, 0 caller)
- `StatusBadge` shared (`src/components/ui/status-badge.tsx`) di tenants/roles/admins
- Deactivate tenant/admin → konfirmasi AlertDialog (konsekuensi), aktivasi tetap 1-klik
- Plans: rainbow 8-hue stripes → aksen primary; label EN → ID
- Superadmin shell: `withTenantBilling={false}` — matikan `ActivePlanProvider` (4× 401 `/api/tenant/billing/active` per halaman)

### 7. Fonts
- **Satoshi** (400/500/700, Fontshare) + **JetBrains Mono** (variable, Google Fonts) di-self-host `src/fonts/*.woff2`, `next/font/local` + `font-display: swap` — sebelumnya deklarasi DESIGN.md tapi tidak pernah di-load (render system-ui)

### 8. Overview & Transaksi
- Overview: polling 30s (pause di background) + refetch on focus + tombol "Muat Ulang" manual (SSE ditolak — overengineering untuk tahap ini; detail pertimbangan di chat)
- Transaksi: filter status pindah ke toolbar, skeleton shaped, amount rata kanan + tabular-nums, search filter (`?search=`, debounce, placeholderData anti-flash, local input state anti-lag)

## Kredensial (local dev)
- Tenant: `fadli.hardiyanto04@gmail.com` / `Fadlikee12` (tenant `crypto-bro`)
- Superadmin: `fadlihardiyanto@uhamka.ac.id` / `superadmin123`

---

# Sesi 3 — Superadmin P2, Members Filter, Dead Code & QA E2E (16 Agu 2026)

## Konfirmasi API (langsung ke backend, bukan tebak)
- **`GET /api/v1/tenant/transactions?search=` → DIDUKUNG** (case-insensitive ILIKE di
  username/first/last_name/external_id; **tidak** mencakup package_name — info untuk BE).
  `status=paid` juga didukung. Frontend tidak perlu berubah.
- `GET /api/v1/tenant/members` search/status/package_id → didukung.
- `GET /admin/v1/clients` → dukung `name` (ILIKE), `slug`, `active`, `subscription_tier`
  (bukan `search` — frontend pakai `name`).
- `GET /admin/v1/admins` → **tanpa filter**; `GET /admin/v1/audit-logs` → **tanpa filter**.

## Yang Sudah Dikerjakan (commit terpisah, 8 commit)

### 1. Superadmin P2 (dari critique 18/40)
- **Tenants**: search `?name=` (debounce 400ms, reset page) + filter status `?active=`
  server-side + loading state + empty state "Tidak ada tenant yang cocok"
- **Admins**: search client-side (nama/email/role) — BE belum dukung param (catatan
  ponytail di kode; upgrade saat BE siap)
- **Audit-logs**: filter client-side aksi + resource — BE belum dukung param
- **Permission picker** (roles): badge click-only → **checkbox groups + select-all
  per group** (indeterminate state, label htmlFor + id, a11y)
- **PaginationBar**: prop opsional `labelPlural` (total===1 ? label : labelPlural)
- **Brand unify**: superadmin layout "Admin Panel - TG-Manager" → "Panel Admin - Urator";
  tenant dashboard "Dashboard TG-Manager" → "Dashboard - Urator"

### 2. Members — status filter
- Select status di toolbar (pola transaksi): Aktif/Kedaluwarsa/Dikeluarkan/Menunggu →
  `?status=` server-side + reset page; fix bug halus: ganti paket juga reset page sekarang

### 3. Bulk delete
- `bulkDelete*Mutation` (5 file, 0 pemakai) dihapus — `useBulkDelete` + service langsung
  adalah satu-satunya jalur

### 4. Dead code
- Hapus: `react-query-demo` feature + route `/dashboard/react-query`,
  `src/config/infoconfig.ts`, `src/lib/auth-axios.ts` (0 pemakai)
- Hapus 15 unused deps: axios, motion, simplebar-react, react-resizable-panels,
  react-responsive, sharp, vaul, react-query-devtools, tailwindcss-animate,
  zod-form-adapter + 5 radix orphan (aspect-ratio, context-menu, hover-card, menubar, toast)

## QA E2E Loop (metodologi systematic-debugging)
- **Catatan lengkap: `QA_TESTING_NOTES.md`** (24 surfaces, hasil + bug + observasi)
- Tenant: semua halaman PASS (login, overview, transactions, members, bots, groups,
  packages, commands, broadcast, billing, midtrans, register, forgot-password,
  landing+pricing, checkout). Badge "Lunas" terverifikasi live.
- Superadmin: overview/audit-logs/login PASS; tenants/admins/roles/plans BLOCKED
  (bug backend, lihat BUG-BE-001)
- Tidak ada bug frontend baru. False-positive yang sudah dianalisis: CSP error
  Midtrans (third-party sandbox), 409 order duplikat (sudah settlement), /register 404
  (route asli = /register-tenant).

## BUG-BE-001 (BLOCKER superadmin, untuk tim backend — detail lengkap di QA_TESTING_NOTES.md)
- Semua `/admin/v1/*` (clients/admins/roles/billing) 403 "Anda memerlukan izin X.read"
  untuk superadmin.
- Root cause: RBAC 2 lapis tidak konsisten — `middleware.Authorize` bypass superadmin,
  tapi usecase `requirePermission(CallerPermissions)` tidak; JWT superadmin sengaja
  tanpa `permissions` claim (role superadmin tidak di-seed admin_role_permissions).
- Fix saran: `requirePermission` terima `callerRoles` + bypass IsSuperAdmin; controller
  isi `req.CallerRoles` (pola sudah ada di admin_permission_controller.go:33).

## Yang Belum Selesai / Pending
1. **BUG-BE-001**: fix di backend oleh tim BE (repo `telegram-management-be`) —
   setelah fix, re-verify superadmin tenants/admins/roles/plans live
2. **BUG-BE-002**: `/admin/v1/admins` (`?search=`) & `/audit-logs` (`?action=&resource=`)
   belum dukung filter — setelah BE siap, frontend pindah ke server-side
3. Transaksi search tidak mencakup package_name (BE) — konfirmasi apakah perlu
4. Observasi: tenant crypto-bro punya order paid tapi billing "Belum ada penagihan
   aktif" — verifikasi alur payment callback → create subscription (BE)
5. Mobile viewport E2E belum diuji (playwright-cli tanpa command viewport)
6. SSE untuk overview — ditolak (overengineering), revisit saat kebutuhan realtime nyata

## Catatan Teknis
- Workflow verifikasi: `playwright-cli` (login manual via headed browser; `snapshot`/`eval`/`console`/`requests`)
- Commit style: conventional commits, 1 commit per logical change
- `.playwright-cli/` dan `.claude/` di-gitignore
- `QA_TESTING_NOTES.md` baru — berisi hasil E2E + bug backend untuk tim BE
