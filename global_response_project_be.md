# Standar Format Respons API (Global Response Wrapper)

Dokumen ini menjelaskan struktur seragam (wrapper) objek `Response` yang dikembalikan oleh backend Go di proyek ini untuk seluruh request HTTP API. Frontend disarankan membuat interface TypeScript global agar proses pemetaan data berjalan konsisten.

---

## 1. Type Definitions (TypeScript)

Gunakan interface di bawah ini untuk mendefinisikan respons API global di tim Frontend:

```typescript
export interface ApiResponse<T = any> {
  success: boolean; // Status keberhasilan request (true/false)
  code: number; // HTTP Status Code (misal: 200, 201, 400, 422, 500)
  message: string; // Pesan informasi singkat untuk user
  data?: T; // Data utama hasil request (opsional)
  errors?: any; // Detail error validasi input form (opsional, untuk HTTP 422)
  request_id?: string; // ID unik untuk tracking log di backend (opsional)
  meta?: ApiMeta; // Metadata paginasi data list (opsional)
}

export interface ApiMeta {
  page: number; // Halaman aktif saat ini (1-indexed)
  limit: number; // Jumlah maksimal data per halaman
  total: number; // Total seluruh data yang ada di database
  total_pages: number; // Total halaman yang tersedia
}
```

---

## 2. Contoh Format JSON Respons

### A. Respons Sukses Biasa (Success Response - 200 OK / 201 Created)

Digunakan untuk API yang mengembalikan satu objek data (misalnya: GET Detail, POST Create, PUT Update).

- **JSON structure:**

```json
{
  "success": true,
  "code": 200,
  "message": "Berhasil memperbarui data",
  "data": {
    "id": "e8a9f62c-8a21-4d32-9cb9-7f61ad831518",
    "name": "Bot Promo",
    "is_active": true
  },
  "request_id": "14f09d84-c68d-4a11-a8cf-81b2a92ff15d"
}
```

### B. Respons Sukses dengan Paginasi (List Response - 200 OK)

Digunakan saat mengambil daftar data (array) yang memiliki sistem halaman. Objek data berada di dalam field `data` (berupa Array) dan disertai field `meta` di tingkat atas.

- **JSON structure:**

```json
{
  "success": true,
  "code": 200,
  "message": "Berhasil mengambil riwayat broadcast",
  "data": [
    {
      "id": "e8a9f62c-8a21-4d32-9cb9-7f61ad831518",
      "target_type": "group",
      "status": "completed"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "total_pages": 1
  },
  "request_id": "84c8c7f9-2a91-4cf1-8bc4-9d108d4b312b"
}
```

### C. Respons Gagal Umum (Error Response - 400 Bad Request / 401 / 403 / 404 / 500)

Digunakan saat terjadi error bisnis (seperti kuota habis), otorisasi gagal, resource tidak ditemukan, atau crash server internal. Field `success` bernilai `false` dan `data` tidak dikirim.

- **JSON structure:**

```json
{
  "success": false,
  "code": 400,
  "message": "Kuota broadcast bulanan Anda sudah penuh (3/3). Silakan upgrade paket platform.",
  "request_id": "62fb91d8-4f1b-4cd3-bc92-1da18cb389ef"
}
```

### D. Respons Gagal Validasi Input (Validation Error - 422 Unprocessable Entity)

Khusus terjadi ketika validasi skema input (Form/JSON Body) gagal di sisi backend. Pesan error spesifik per-field diletakkan di dalam objek `errors`.

- **JSON structure:**

```json
{
  "success": false,
  "code": 422,
  "message": "Validasi input gagal",
  "errors": {
    "bot_id": "bot_id is a required field",
    "target_type": "target_type must be one of [group member]"
  },
  "request_id": "7b0d9124-cb91-419b-a320-1a73ff2bc181"
}
```
