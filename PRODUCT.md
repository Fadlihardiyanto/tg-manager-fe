# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary:** Penyedia SaaS — menyediakan platform manajemen grup/komunitas berbayar berbasis Telegram.

**Secondary:** Tenant (klien bisnis) — pemilik grup Telegram berbayar yang mengelola bot, member, paket, diskon, broadcast, dan pembayaran Midtrans secara mandiri.

**Tertiary:** Superadmin — mengelola tenant, plan, billing, dan audit log di level platform.

## Product Purpose

TG Manager adalah platform SaaS all-in-one untuk mengelola komunitas Telegram berbayar. Tenant dapat mendaftarkan bot Telegram mereka sendiri, menghubungkan grup, mengonfigurasi commands kustom, membuat paket keanggotaan dan diskon, mengirim broadcast, serta mengintegrasikan pembayaran Midtrans — semuanya dari satu dashboard.

## Positioning

**All-in-one: multi-tenant + broadcast + billing.** Berbeda dari chatbot builder (ManyChat) atau bot manager generik — TG Manager memberi tenant kendali penuh atas bot, payment gateway, dan data anggota mereka sendiri. Platform bukan pemilik data tenant; tenant yang memiliki dan mengoperasikan infrastruktur mereka.

## Operating Context

- **Lingkungan:** Web dashboard, diakses via desktop dan mobile browser
- **Bahasa:** Bahasa Indonesia (seluruh UI)
- **Alur kerja utama:**
  1. Superadmin onboard tenant — assign plan, batasi quota
  2. Tenant daftar bot (token dari BotFather) → hubungkan grup via koneksi Telegram
  3. Tenant kelola paket & diskon → tentukan harga, durasi, dan grup akses
  4. Tenant kelola member — import member, perpanjang/langganan
  5. Broadcast & commands — komunikasi massal dan otomatisasi via bot
  6. Billing — Midtrans integration, tenant kelola payment settings sendiri

## Capabilities and Constraints

### Fitur Utama

- **Bot Management:** CRUD bot, toggle aktif/nonaktif, assign role (sales, gatekeeper, all-in-one), connect/disconnect grup
- **Group Management:** CRUD grup, sync data dari Telegram, lihat member count, deep link ke Telegram
- **Commands:** Custom command per bot, upload presigned, scope akses (grup tertentu/semua)
- **Broadcast:** Kirim pesan massal ke member grup
- **Packages & Discounts:** Paket keanggotaan dengan quota (bot, package, commands, broadcast), diskon custom
- **Member Management:** Import member, extend/perpanjang, detail drawer
- **Midtrans Integration:** Tenant set Midtrans server/client key sendiri, Snap checkout
- **Superadmin Dashboard:** Overview statistik, kelola tenant, plans, billing, admin users, roles & permissions
- **Billing:** Tenant lihat billing aktif, history, cancel pending — integrasi dengan Midtrans

### Constraints

- **Target:** Indonesia — Bahasa Indonesia, mobile-first responsive
- **Platform:** Next.js 16 App Router, React Server Components + Client Components
- **Stack:** shadcn/ui, TanStack Query, Tailwind CSS, @tabler/icons-react, lucide-react
- **Auth:** Cookie-based httpOnly JWT (tenant + admin session)
- **Multi-tenant:** Data isolation per tenant; superadmin mengelola di level platform
- **Onboarding:** Flow multi-step untuk tenant baru (profile bisnis → bot setup → payment config → review)
- **Empty states & loading:** Semua halaman punya skeleton loading state yang sesuai

### Open Decisions

- Backend belum support asset/branding custom per tenant (logo, warna)
- Belum ada fitur analytics/insight per tenant (engagement, revenue)
- Internationalization: hanya `id` (Indonesia) saat ini, `en` fallback

## Brand Commitments

- **Nama:** TG Manager (Telegram Group Manager)
- **Bahasa:** Seluruh UI dalam Bahasa Indonesia
- **Voice:** Profesional, membantu, tidak terlalu formal

## Evidence on Hand

- `public/assets/` — ikon & ilustrasi (natural-language-processing.svg, group-tutorial.mp4)
- `src/styles/globals.css` — design tokens (CSS variables shadcn/ui default theme)
- `src/components/icons.tsx` — set ikon konsisten (@tabler/icons-react + lucide-react)
- `api.yml` — API contract backend (tidak di repo; di-copy manual)

## Product Principles

1. **Tenant memiliki kendali.** Tenant masukkan bot sendiri, kelola payment gateway sendiri. Platform adalah enabler, bukan pemilik.
2. **Mobile-first, Indonesia-first.** Semua desain dimulai dari layar kecil; bahasa Indonesia bukan afterthought.
3. **Sederhana bukan berarti miskin.** Dashboard tidak perlu kompleks — bot tidak banyak, grup tidak banyak. UX minimal tapi powerful.
4. **Transparansi status.** Setiap aksi (connect, disconnect, sync, toggle) memberi feedback jelas — toast, skeleton, atau update real-time.
5. **Self-service tenant.** Tenant tidak perlu bantuan superadmin untuk operasional harian — dari daftar bot sampai kelola member.

## Accessibility & Inclusion

- Mobile-friendly responsive (min 375px)
- Semua tombol interaktif min 44x44px touch target
- `prefers-reduced-motion` dihormati (sudah di globals.css)
- Teks kontras: primary ≥4.5:1, secondary ≥3:1 (belum diaudit formal)
