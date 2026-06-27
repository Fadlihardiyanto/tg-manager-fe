# Product Requirements Document (PRD) - TG-Manager

## 1. Ikhtisar Produk (Product Overview)

**TG-Manager** adalah platform SaaS (Software as a Service) Multi-tenant yang dirancang untuk mengotomatisasi manajemen keanggotaan dan monetisasi grup Telegram berbayar.

Sistem ini membantu pemilik grup (Tenant) mengatasi masalah administratif seperti memverifikasi pembayaran, memasukkan member secara manual, dan mengeluarkan (kick) member yang masa aktif langganannya telah habis. Platform ini menangani seluruh siklus mulai dari _checkout_ hingga persetujuan masuk grup (gatekeeping) dan pemutusan akses (auto-kick).

---

## 2. Target Pengguna (User Personas)

1. **Superadmin (Platform Owner)**
   - **Tujuan:** Mengelola ekosistem SaaS, mengatur klien/tenant, memantau pendapatan platform, serta mengelola admin internal.
   - **Akses:** Admin Panel (Internal CMS). Login dengan keamanan ekstra (2FA).

2. **Tenant / Client (Pemilik Grup Telegram)**
   - **Tujuan:** Mengotomatisasi pendaftaran member, membuat dan menjual paket langganan grup Telegram mereka, melihat analitik penjualan, dan mengelola operasional (diskon, bot, grup).
   - **Akses:** Tenant Dashboard. Login menggunakan Email/Password.

3. **Member (Pengguna Akhir / End-User)**
   - **Tujuan:** Membeli paket langganan secara mudah dan otomatis masuk ke grup Telegram VIP.
   - **Akses:** Halaman _Public Checkout_. Tidak perlu membuat akun di web; identifikasi berbasis Telegram ID dan sesi _checkout_.

---

## 3. Fitur Utama & Fungsionalitas (Scope of Work)

### A. Frontend (Antarmuka Pengguna)

**1. Halaman Publik & Checkout (B2C)**

- **Landing Page SaaS:** Penawaran layanan TG-Manager kepada calon tenant (Pricing, Fitur).
- **Checkout Page (White-label):** Halaman bagi Member untuk melihat detail paket, memasukkan kode promo, dan diarahkan ke _Payment Gateway_ (Midtrans). Dioptimalkan untuk Mobile (Mobile-First).

**2. Tenant Dashboard (Portal Pemilik Grup)**

- **Dashboard Analytics:** Grafik pendapatan, jumlah member aktif, metrik pertumbuhan.
- **Bot Management:** Integrasi Token Telegram Bot.
- **Group Management:** Integrasi ID Grup Telegram dan menautkannya ke Bot.
- **Package Management:** Pembuatan paket berlangganan (harga, durasi hari, grup yang tertaut).
- **Member & Order Management:** Melihat daftar pelanggan (aktif/expired) dan histori transaksi.
- **Discount Management:** Pembuatan voucher promo (persentase/nominal tetap).
- **Settings:** Pengaturan profil bisnis dan integrasi API (Server Key & Client Key Midtrans milik Tenant).
- **Team Management:** Invite member tim untuk membantu operasional.

**3. Admin Panel (Portal Superadmin)**

- **Manajemen Tenant:** Melihat daftar Tenant, status langganan, dan fitur _suspend_.
- **Platform Plans:** Pengaturan harga berlangganan SaaS untuk Tenant (Free, Pro, dsb).
- **SaaS Billing:** Rekaman transaksi pembayaran dari Tenant ke Platform.
- **Manajemen Tim Internal:** Hak akses (RBAC) admin, support, finance.

### B. Backend & Infrastruktur API

**1. Sistem Telegram Bot (Microservice / Worker)**

- Menerima dan merespons command pengguna (`/start`, `/packages`, `/status`).
- Membuat dan mengirimkan _single-use invite link_ saat pembayaran sukses.
- **CRON Job / Worker:** Menjalankan pengecekan harian/per jam untuk member yang langganannya kedaluwarsa dan otomatis melakukan _kick_ dari grup.

**2. Core API (RESTful)**

- Autentikasi berbasis JWT dengan _HttpOnly Cookies_.
- CRUD lengkap untuk Bot, Group, Package, Discount, Member.
- RBAC (Role-Based Access Control) yang ketat untuk membedakan antara API Tenant dan Superadmin.
- Menangani _Webhook_ (Payment Notifications) dari Midtrans secara real-time.

---

## 4. User Journeys (Alur Pengguna)

### Alur 1: Pembelian oleh Member (End-User)

1. Member mengetik command `/packages` di Bot Telegram milik Tenant.
2. Bot merespons dengan deskripsi paket dan _Link Checkout_ (berisi parameter unik).
3. Member membuka tautan (diarahkan ke Halaman Public Checkout).
4. Member mengisi form, menerapkan diskon (opsional), dan klik **Bayar**.
5. Frontend mengambil `payment_url` dari API dan mengarahkan member ke antarmuka Snap Midtrans.
6. Member menyelesaikan pembayaran.
7. Backend menerima _Webhook_ sukses dari Midtrans.
8. Backend memerintahkan Bot Telegram mengirim DM ke Member berisi tautan undangan eksklusif grup (Invite Link).

### Alur 2: Pendaftaran & Onboarding Tenant

1. Tenant mendaftar di halaman pendaftaran SaaS dan memverifikasi Email.
2. Tenant _Login_ ke Dashboard.
3. Mengisi **Settings > Payment Gateway** dengan kunci Midtrans mereka.
4. Mendaftarkan **Bot Token** (dari BotFather).
5. Mendaftarkan **Grup ID** dan mengundang Bot mereka sebagai Admin grup.
6. Membuat **Packages**, mengatur harga, dan menghubungkannya dengan grup yang ada.
7. Sistem langsung siap mendatangkan uang.

---

## 5. Arsitektur Teknis (Tech Stack)

- **Frontend Web:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui.
- **State & Data Fetching:** TanStack React Query, Zustand, Nuqs (Search Params).
- **Payment Gateway:** Midtrans (Snap API & Core API).
- **Komunikasi API:** RESTful API dengan JSON standard response.
- **Integrasi:** Telegram Bot API.

---

## 6. Fase Pengembangan (Milestones)

### Fase 1: MVP (Minimum Viable Product)

- Database schema & Core API Backend.
- Autentikasi Tenant (Login/Register).
- Tenant Dashboard (Bot, Group, Package, Member).
- Halaman Public Checkout & Integrasi Webhook Midtrans.
- Integrasi Telegram Bot (Generate Invite Link & Auto Kick).

### Fase 2: Skalabilitas & SaaS Billing

- Admin Panel untuk Superadmin.
- Autentikasi 2FA Superadmin.
- Platform SaaS Billing (Tenant membayar langganan ke platform).
- Manajemen Diskon (Voucher/Kupon).

### Fase 3: Advanced & Optimization

- Team / User Management di dalam Tenant Dashboard (Multi-user per Tenant).
- Analytics mendalam dengan grafik komprehensif (Recharts).
- Optimasi kecepatan, SEO untuk landing page platform.
