# Frontend (FE) Integration Guide: Package Activation & Deactivation

Panduan ini menjelaskan cara mengintegrasikan fitur untuk mengaktifkan (`activate`) dan menonaktifkan (`deactivate`) paket langganan di Frontend.

---

## 🔄 Konsep Fitur Status Paket

Mengubah status paket sangat berguna bagi tenant untuk mengatur ketersediaan paket penjualan tanpa harus menghapusnya secara permanen.

- **Paket Aktif (`is_active = true`)**: Paket dapat dilihat dan dibeli oleh member Telegram.
- **Paket Non-aktif (`is_active = false`)**: Paket disembunyikan dari daftar pembelian member (tetapi langganan member yang sedang berjalan tetap berlaku sampai kadaluarsa).

---

## 🌐 API Spesifikasi (PATCH)

Semua request menggunakan header:
`Authorization: Bearer <jwt_token_tenant>`

### 1. Activate Package (Mengaktifkan Paket)

Mengubah status paket menjadi aktif.

- **Method**: `PATCH`
- **Endpoint**: `/api/v1/tenant/packages/:id/activate`
- **URL Parameter**:
  - `id` (UUID): ID paket yang akan diaktifkan.

#### Response (Success - 200 OK)

```json
{
  "code": 200,
  "message": "Paket berhasil diaktifkan",
  "data": {
    "id": "e3a89db1-fb4c-473d-8068-d0dfc2bc1645",
    "name": "VIP Signal Crypto 30 Hari",
    "price": "150000.00",
    "duration_days": 30,
    "is_all_access": false,
    "is_active": true,
    "created_at": "2026-06-27T18:20:00Z",
    "updated_at": "2026-06-27T22:45:00Z"
  }
}
```

---

### 2. Deactivate Package (Menonaktifkan Paket)

Mengubah status paket menjadi tidak aktif (non-aktif).

- **Method**: `PATCH`
- **Endpoint**: `/api/v1/tenant/packages/:id/deactivate`
- **URL Parameter**:
  - `id` (UUID): ID paket yang akan dinonaktifkan.

#### Response (Success - 200 OK)

```json
{
  "code": 200,
  "message": "Paket berhasil dinonaktifkan",
  "data": {
    "id": "e3a89db1-fb4c-473d-8068-d0dfc2bc1645",
    "name": "VIP Signal Crypto 30 Hari",
    "price": "150000.00",
    "duration_days": 30,
    "is_all_access": false,
    "is_active": false,
    "created_at": "2026-06-27T18:20:00Z",
    "updated_at": "2026-06-27T22:45:00Z"
  }
}
```

---

## 💻 Contoh Implementasi Kode (React/Vue/JS)

Berikut contoh fungsi untuk mengubah status paket di Frontend:

```typescript
async function togglePackageStatus(
  packageId: string,
  currentStatus: boolean,
  jwtToken: string,
): Promise<boolean> {
  const action = currentStatus ? "deactivate" : "activate";

  try {
    const response = await fetch(
      `/api/v1/tenant/packages/${packageId}/${action}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Gagal melakukan ${action} paket`);
    }

    const result = await response.json();
    // Kembalikan status baru dari data response backend
    return result.data.is_active;
  } catch (error) {
    console.error(`Error saat toggle status paket:`, error);
    alert("Gagal memperbarui status paket.");
    return currentStatus; // Kembalikan status asal jika gagal
  }
}
```

---

## 🎨 Rekomendasi Alur UI/UX di Frontend

1. **Komponen Toggle Switch / Slide Button**:
   - Di tabel daftar paket, sediakan kolom **"Status"** dengan komponen Switch (Toggle) yang menunjukkan status `is_active` (`ON` = Hijau, `OFF` = Abu-abu).
2. **Dialog Konfirmasi (Pop-up Confirmation)**:
   - Saat user mematikan paket (mengubah dari `ON` ke `OFF`), sangat disarankan memunculkan dialog konfirmasi:
     > _"Apakah Anda yakin ingin menonaktifkan paket ini? Member baru tidak akan bisa melihat atau membeli paket ini di Telegram."_
   - Hal ini mencegah user tidak sengaja mematikan paket jualan aktif mereka.
3. **Visual State**:
   - Untuk baris paket yang non-aktif (`is_active = false`), beri styling sedikit redup (opacity lebih rendah, misal `opacity: 0.6`) atau tambahkan label badge `"Draft"` / `"Non-aktif"` untuk membedakannya secara visual dengan cepat dari paket aktif.
