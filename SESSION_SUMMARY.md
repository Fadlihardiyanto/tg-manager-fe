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
