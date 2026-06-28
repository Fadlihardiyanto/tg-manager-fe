# Frontend (FE) Integration Guide: Package & Group Association Flow

Panduan ini menjelaskan alur integrasi frontend untuk pembuatan paket langganan (`packages`) dan proses pengaitan grup Telegram (`package_groups`).

---

## 🔄 Alur Kerja Pembuatan & Pemetaan Paket

1. **Pembuatan Paket**: User mengisi detail paket (Nama, Harga, Durasi) pada form input.
2. **Kondisi Akses**:
   - Jika paket diset **Akses Semua Grup** (`is_all_access = true`), proses selesai setelah paket dibuat.
   - Jika paket diset **Spesifik Grup** (`is_all_access = false`), user akan diarahkan untuk memilih satu atau lebih grup yang sudah terdaftar di sistem.
3. **Pemetaan Grup**: Frontend mengirimkan daftar ID grup pilihan ke API asosiasi grup untuk disimpan ke dalam relasi database.

---

## 🌐 API Spesifikasi

### 1. Create Package (Membuat Paket Baru)

Endpoint ini digunakan untuk mendaftarkan paket jualan baru.

- **Method**: `POST`
- **Endpoint**: `/api/v1/tenant/packages`
- **Headers**:
  - `Authorization`: `Bearer <jwt_token_tenant>`
  - `Content-Type`: `application/json`

#### Request Body

```json
{
  "name": "VIP Signal Crypto 30 Hari",
  "price": 150000.0,
  "duration_days": 30,
  "is_all_access": false
}
```

#### Response (Success - 201 Created)

```json
{
  "code": 201,
  "message": "Paket berhasil didaftarkan",
  "data": {
    "id": "e3a89db1-fb4c-473d-8068-d0dfc2bc1645", // Gunakan ID ini untuk langkah 2
    "client_id": "aa123b32-9cb3-4bde-a3c7-d688fe0e4f71",
    "name": "VIP Signal Crypto 30 Hari",
    "price": "150000.00",
    "duration_days": 30,
    "is_all_access": false,
    "is_active": true,
    "created_at": "2026-06-27T18:20:00Z",
    "updated_at": "2026-06-27T18:20:00Z"
  }
}
```

---

### 2. Associate Groups (Mengaitkan Grup ke Paket)

Endpoint ini digunakan untuk menentukan grup Telegram mana saja yang dimasukkan ke dalam paket langganan yang baru dibuat.

- **Method**: `POST`
- **Endpoint**: `/api/v1/tenant/packages/:package_id/groups`
- **Headers**:
  - `Authorization`: `Bearer <jwt_token_tenant>`
  - `Content-Type`: `application/json`
- **URL Parameter**:
  - `package_id` (UUID): ID paket yang didapatkan dari response API di atas.

#### Request Body

```json
{
  "group_ids": [
    "c8c4cf1b-bf4c-473d-8068-d0dfc2bc1645",
    "d7e5df2c-cf5d-484e-9179-e1efd3cd2756"
  ]
}
```

#### Response (Success - 200 OK)

```json
{
  "code": 200,
  "message": "Grup berhasil dikaitkan dengan paket"
}
```

---

## 💻 Contoh Implementasi Kode (React/Vue/JS)

Berikut contoh fungsi sekuensial (langkah demi langkah) untuk membuat paket lalu langsung mengaitkannya dengan grup Telegram:

```typescript
interface PackagePayload {
  name: string;
  price: number;
  duration_days: number;
  is_all_access: boolean;
}

async function handleSavePackage(
  payload: PackagePayload,
  selectedGroupIds: string[],
  jwtToken: string,
) {
  try {
    // Langkah 1: Buat Paket
    const createRes = await fetch("/api/v1/tenant/packages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!createRes.ok) throw new Error("Gagal membuat paket");
    const packageResult = await createRes.json();
    const packageId = packageResult.data.id;

    // Langkah 2: Jika bukan all access dan ada grup terpilih, kaitkan grupnya
    if (!payload.is_all_access && selectedGroupIds.length > 0) {
      const assocRes = await fetch(
        `/api/v1/tenant/packages/${packageId}/groups`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ group_ids: selectedGroupIds }),
        },
      );

      if (!assocRes.ok) throw new Error("Gagal mengaitkan grup ke paket");
    }

    alert("Paket berhasil dibuat dan dikaitkan!");
  } catch (error) {
    console.error("Error saat menyimpan paket:", error);
    alert("Terjadi kesalahan, harap coba lagi.");
  }
}
```

---

## 🎨 Rekomendasi Alur Form di Frontend

1. **Form Detail**: Tampilkan form input biasa untuk `name`, `price`, dan `duration_days`.
2. **Toggle Switch**: Buat komponen toggle/switch untuk `is_all_access` (Akses semua grup).
3. **Multi-Select Dropdown/List**:
   - Panggil API `GET /api/v1/tenant/groups` untuk mendapatkan daftar grup yang dimiliki user.
   - Jika toggle `is_all_access` bernilai **FALSE**, tampilkan daftar grup tersebut dalam bentuk _checklist_ atau multi-select dropdown.
   - Jika toggle `is_all_access` bernilai **TRUE**, sembunyikan atau _disable_ pilihan grup tersebut untuk mencegah kebingungan user.
