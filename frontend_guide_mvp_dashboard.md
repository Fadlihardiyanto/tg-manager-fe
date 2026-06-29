# Panduan Integrasi Frontend: Tenant Analytics Dashboard (MVP)

Dokumen ini ditujukan untuk tim Frontend guna mengintegrasikan halaman **Overview Dashboard Analytics** untuk Tenant (Klien). API ini menyediakan data performa bisnis secara _real-time_ yang telah diagregasi dan dioptimasi dari sisi _Backend_.

## 1. Spesifikasi API

- **Endpoint**: `GET /api/v1/tenant/analytics/overview` _(Catatan: sesuaikan jika ada perubahan base path router)_
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer <jwt_tenant_token>`
  - `Content-Type: application/json`

## 2. Struktur Response JSON

Respons dibungkus menggunakan standard _response formatter_ (`code`, `status`, `data`). Fokus Anda adalah pada _object_ di dalam `data`.

```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "total_revenue_this_month": "1250000.00",
    "total_active_members": 45,
    "total_groups": 3,
    "total_members_in_groups": 1200,
    "success_transactions": 30,
    "revenue_chart": [
      {
        "date": "2026-06-01",
        "revenue": "0"
      },
      {
        "date": "2026-06-02",
        "revenue": "150000.00"
      }
      // ... tepat 30 data array berurutan untuk 30 hari ke belakang.
    ],
    "package_popularity": [
      {
        "package_name": "Paket Premium 1 Bulan",
        "count": 15
      },
      {
        "package_name": "Paket Basic",
        "count": 10
      }
    ],
    "recent_orders": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "external_id": "INV-20260629-001",
        "member_name": "Budi Santoso",
        "member_username": "budis",
        "package_name": "Paket Premium 1 Bulan",
        "amount": "50000.00",
        "status": "paid",
        "created_at": "2026-06-29T10:15:30Z"
      }
      // ... maksimal 5 order terbaru (urutan waktu terbalik / descending).
    ]
  }
}
```

> [!NOTE]
> Format mata uang (`decimal`) direpresentasikan sebagai **String** dalam JSON. Gunakan `parseFloat()` atau library seperti `numeral.js` di Frontend jika ingin melakukan _formatting_ (seperti `Rp 1.250.000`).

## 3. Rencana Komponen Antarmuka (UI)

Agar implementasi _dashboard_ terlihat rapi dan elegan, disarankan untuk membaginya menjadi 3 komponen utama:

### A. Stat Cards (Widget Angka Utama)

Komponen ini menampilkan metrik paling penting. Buat _grid layout_ (misal 4 kolom) yang menampilkan:

- 💰 **Pendapatan Bulan Ini** (`total_revenue_this_month`)
- 👥 **Pelanggan Aktif** (`total_active_members`)
- 📢 **Grup & Total Member** (`total_groups` dan `total_members_in_groups`)
- 💳 **Transaksi Berhasil** (`success_transactions`)

### B. Revenue Chart (Grafik Pendapatan)

Gunakan library chart seperti **Recharts** atau **Chart.js** untuk me-render `revenue_chart`.

- **Sumbu X (Bawah):** Gunakan `date` (format YYYY-MM-DD). Bisa disederhanakan formatnya di UI menjadi `DD MMM` (contoh: 02 Jun).
- **Sumbu Y (Kiri):** Gunakan `revenue` (pastikan di-_parse_ ke Float/Integer).
- **Info Tambahan:** Backend telah memproses array chart sehingga _pasti_ mengembalikan list berjumlah 30 tanggal tanpa ada tanggal yang terlewati. Tanggal yang tidak memiliki transaksi otomatis memiliki `revenue: "0"`.

### C. Package Popularity (Pie/Donut Chart)

Digunakan untuk memvisualisasikan proporsi penjualan berdasarkan nama paket.

- **Label:** Gunakan `package_name`.
- **Nilai (Value):** Gunakan `count`.
- **Library:** Dapat divisualisasikan dengan apik menggunakan **Pie Chart** atau **Donut Chart** dari Recharts/Chart.js.

### D. Recent Orders (Tabel Transaksi Terbaru)

Gunakan struktur tabel sederhana atau komponen list UI untuk merender array `recent_orders`.
Kolom yang direkomendasikan:

1. **Order ID:** `external_id` (Misal: `INV-2026...`)
2. **Pembeli:** Gabungan antara `member_name` dan `@` + `member_username`.
3. **Paket:** `package_name`.
4. **Nominal:** `amount` (format ke Rupiah).
5. **Tanggal:** `created_at` (Gunakan library _time formatter_ ke zona waktu lokal pengguna).
6. **Status:** `status` (berikan _badge_ warna hijau karena status di endpoint ini umumnya `'paid'`).

## 4. Contoh Integrasi Sederhana (React/Next.js)

```tsx
import { useEffect, useState } from "react";

export default function DashboardOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch("/api/v1/tenant/analytics/overview", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const result = await response.json();
        if (result.code === 200) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Gagal mengambil data analytics", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) return <div>Memuat Dashboard...</div>;
  if (!data) return <div>Data tidak tersedia.</div>;

  return (
    <div className="dashboard-container">
      {/* 1. Stat Cards */}
      <div className="grid-cards">
        <Card title="Pendapatan" value={data.total_revenue_this_month} />
        <Card title="Member Aktif" value={data.total_active_members} />
        {/* ... render card lainnya */}
      </div>

      {/* 2. Chart Component */}
      <RevenueChart data={data.revenue_chart} />

      {/* 3. Recent Orders Table */}
      <RecentOrdersTable data={data.recent_orders} />
    </div>
  );
}
```
