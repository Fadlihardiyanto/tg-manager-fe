# Midtrans Snap Backend Handoff

Dokumen ini menjelaskan perubahan frontend agar pembayaran tenant dan member Telegram bisa tetap berjalan di website Urator menggunakan Midtrans Snap JS, bukan full redirect ke halaman Midtrans.

## Ringkasan Perubahan Frontend

Frontend sekarang mendukung dua mode pembayaran:

1. **Mode utama: Snap token**
   - Backend mengembalikan `snap_token`.
   - Frontend memuat Midtrans Snap JS.
   - Frontend menjalankan `window.snap.pay(snap_token)`.
   - User melihat popup/modal Midtrans di website Urator.

2. **Mode fallback: payment URL**
   - Jika `snap_token` belum tersedia, frontend tetap memakai `payment_url`.
   - Ini menjaga flow lama tetap berjalan selama backend belum selesai migrasi.

Tidak ada Midtrans server key yang dipakai di frontend.

## Kontrak Response Yang Dibutuhkan

Endpoint checkout sebaiknya mengembalikan field berikut:

```json
{
  "success": true,
  "code": 200,
  "message": "Checkout berhasil dibuat",
  "data": {
    "order_id": "ORDER-123",
    "snap_token": "midtrans-snap-token",
    "payment_url": "https://app.sandbox.midtrans.com/snap/v4/redirection/...",
    "client_key": "SB-Mid-client-xxxx"
  }
}
```

Field:

- `order_id`: ID transaksi/order yang stabil dan bisa dipakai untuk cek status.
- `snap_token`: token transaksi dari Midtrans Snap. Ini field utama agar checkout tetap di website.
- `payment_url`: URL redirect Midtrans. Tetap dikirim sebagai fallback.
- `client_key`: Midtrans client key. Aman untuk frontend. Server key jangan pernah dikirim.

`snap_token` dan `payment_url` dibuat dari transaksi yang sama.

## Endpoint Tenant Billing

Endpoint yang sekarang dipakai frontend:

```http
POST /api/v1/tenant/billing/checkout
```

Request saat ini:

```json
{
  "plan_id": "plan-id",
  "billing_cycle": "monthly"
}
```

Response yang diharapkan:

```json
{
  "success": true,
  "code": 200,
  "message": "Checkout billing berhasil dibuat",
  "data": {
    "order_id": "TENANT-BILLING-123",
    "snap_token": "snap-token",
    "payment_url": "https://app.sandbox.midtrans.com/snap/v4/redirection/...",
    "client_key": "SB-Mid-client-xxxx"
  }
}
```

Endpoint active billing dan history juga sebaiknya menyertakan field yang sama untuk transaksi pending:

```http
GET /api/v1/tenant/billing/active
GET /api/v1/tenant/billing/history
```

Tambahkan pada item billing pending:

```json
{
  "id": "billing-id",
  "status": "pending",
  "order_id": "TENANT-BILLING-123",
  "snap_token": "snap-token",
  "payment_url": "https://app.sandbox.midtrans.com/snap/v4/redirection/...",
  "client_key": "SB-Mid-client-xxxx"
}
```

Jika Midtrans Snap token tidak bisa digunakan ulang untuk transaksi lama, backend bisa membuat ulang Snap token untuk order pending yang sama atau menyediakan endpoint baru untuk regenerate token.

## Endpoint Member Telegram Checkout

Frontend sudah menambahkan halaman public:

```http
GET /checkout?order_id=ORDER-123
```

Halaman ini akan mencoba mengambil detail checkout dari backend:

```http
GET /api/v1/public/checkout/{order_id}
```

Response yang diharapkan:

```json
{
  "success": true,
  "code": 200,
  "message": "Detail checkout berhasil dimuat",
  "data": {
    "order_id": "MEMBER-ORDER-123",
    "snap_token": "snap-token",
    "payment_url": "https://app.sandbox.midtrans.com/snap/v4/redirection/...",
    "client_key": "SB-Mid-client-xxxx",
    "bot": "UrationBot",
    "slug": "tenant-slug",
    "amount": "50000",
    "package_name": "Premium 1 Bulan",
    "status": "pending"
  }
}
```

Field tambahan untuk member:

- `bot`: username bot Telegram tanpa wajib memakai `@`.
- `slug`: slug tenant.
- `amount`: total pembayaran.
- `package_name`: nama paket yang dibeli member.
- `status`: status transaksi saat ini.

Setelah pembayaran sukses/pending/error, frontend mengarah ke:

```http
/checkout/success?order_id=ORDER-123&bot=UrationBot&slug=tenant-slug
```

Backend tetap harus mengandalkan webhook Midtrans sebagai sumber kebenaran status pembayaran.

## Alternatif Sementara Dengan Query Params

Jika endpoint `GET /api/v1/public/checkout/{order_id}` belum siap, link dari Telegram bisa sementara membawa data langsung lewat query params:

```http
/checkout?order_id=ORDER-123&snap_token=SNAP_TOKEN&client_key=CLIENT_KEY&bot=UrationBot&slug=tenant-slug&amount=50000&package_name=Premium%201%20Bulan
```

Catatan:

- `snap_token` aman dipakai di frontend, tetapi URL bisa tersimpan di history/browser log.
- Untuk production, endpoint detail checkout lebih disarankan daripada membawa token panjang di query string.

## Environment Frontend

Frontend membaca env berikut:

```env
NEXT_PUBLIC_MIDTRANS_ENV=sandbox
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxx
```

Jika backend selalu mengirim `client_key` di response, env `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` hanya menjadi fallback.

Nilai `NEXT_PUBLIC_MIDTRANS_ENV`:

- `sandbox`: load script `https://app.sandbox.midtrans.com/snap/snap.js`
- `production`: load script `https://app.midtrans.com/snap/snap.js`

## Callback Dan Status

Frontend menangani callback Snap:

- `onSuccess`: redirect ke halaman hasil/success.
- `onPending`: redirect ke halaman hasil/success untuk menunggu webhook.
- `onError`: tampilkan error, lalu redirect ke halaman hasil agar user bisa cek status.
- `onClose`: tampilkan info bahwa checkout ditutup dan user bisa lanjutkan nanti.

Backend tetap perlu:

- Menerima webhook Midtrans.
- Memvalidasi signature webhook.
- Mengubah status order/billing/member subscription berdasarkan status final dari Midtrans.
- Menyediakan endpoint status/order agar frontend bisa polling atau memuat ulang status terbaru.

## Acceptance Criteria

- Checkout tenant mengembalikan `snap_token` dan frontend membuka popup Midtrans di website.
- Checkout member dari Telegram masuk ke `/checkout?order_id=...`, bukan langsung ke URL Midtrans.
- Transaksi pending dari billing active/history bisa dilanjutkan tanpa full redirect jika `snap_token` tersedia.
- Jika `snap_token` belum tersedia, `payment_url` tetap bekerja sebagai fallback.
- Server key Midtrans tidak pernah dikirim ke frontend.
