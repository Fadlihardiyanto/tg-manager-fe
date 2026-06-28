# Frontend (FE) Integration Guide: OTP-Based Group Connection

Panduan ini ditujukan bagi tim Frontend untuk mengintegrasikan alur baru pendaftaran grup Telegram menggunakan sistem Kode OTP/Koneksi.

---

## 🔄 Alur Kerja Baru (UI/UX)

1. User menekan tombol **"Tambah Grup Baru"** di halaman daftar grup.
2. Frontend menembak API backend untuk mendapatkan kode koneksi sekali pakai (berlaku selama 15 menit).
3. Tampilkan **Modal/Popup** kepada user berisi:
   - **Kode Unik** (misal: `/connect X7YA9Z`) dengan tombol _Copy to Clipboard_.
   - **Petunjuk Penggunaan**:
     1. Masukkan bot ke grup Telegram Anda.
     2. Jadikan bot tersebut sebagai **Administrator**.
     3. Kirim pesan berisi kode tersebut di dalam grup.
   - **Countdown Timer** (Menghitung mundur dari 15:00 menit).
   - Tombol **"Saya Sudah Mengirimkan Kode"** (untuk menutup modal dan me-refresh daftar grup).

---

## 🌐 API Spesifikasi

### Generate Connect Token

Digunakan untuk men-_generate_ token baru untuk menghubungkan bot dengan grup.

- **Method**: `POST`
- **Endpoint**: `/api/v1/tenant/bots/:bot_id/groups/connect-token`
- **Headers**:
  - `Authorization`: `Bearer <jwt_token_tenant>`
  - `Content-Type`: `application/json`
- **URL Parameter**:
  - `bot_id` (UUID): ID dari bot Telegram yang ingin dimasukkan ke grup.

#### Response (Success - 200 OK)

```json
{
  "code": 200,
  "message": "Token koneksi berhasil dibuat",
  "data": {
    "token": "X7YA9Z",
    "expires_in": 900
  }
}
```

---

## 💻 Contoh Implementasi Kode (React/Vue/JS)

### 1. Meminta Token Koneksi

Berikut adalah contoh fungsi untuk memanggil API token koneksi:

```typescript
interface ConnectTokenResponse {
  code: number;
  message: string;
  data: {
    token: string;
    expires_in: number; // dalam detik (900s = 15m)
  };
}

async function fetchConnectToken(
  botId: string,
  jwtToken: string,
): Promise<string | null> {
  try {
    const response = await fetch(
      `/api/v1/tenant/bots/${botId}/groups/connect-token`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) throw new Error("Gagal mendapatkan token");

    const res: ConnectTokenResponse = await response.json();
    return res.data.token;
  } catch (error) {
    console.error(error);
    return null;
  }
}
```

### 2. Logic Countdown Timer (React Hook Example)

Anda bisa menggunakan React hook sederhana ini untuk memformat waktu 15 menit mundur di dalam Modal:

```typescript
import { useState, useEffect } from "react";

function useTimer(initialSeconds: number, onExpire: () => void) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) {
      onExpire();
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, onExpire]);

  const formatTime = () => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return { timeString: formatTime(), isExpired: seconds <= 0 };
}
```

---

## 🎨 Rekomendasi Desain Modal UI

Untuk memberikan _User Experience_ (UX) yang sangat premium, tim FE disarankan mendesain modal dengan elemen berikut:

```
+─────────────────────────────────────────────────────────+
|               Hubungkan Grup Telegram Baru              |
+─────────────────────────────────────────────────────────+
|                                                         |
|  1. Masukkan Bot ke grup Telegram Anda.                 |
|  2. Atur Bot sebagai Administrator grup.                |
|  3. Salin dan kirim perintah berikut ke grup Anda:       |
|                                                         |
|  +───────────────────────────────────────────────────+  |
|  | /connect X7YA9Z                           [Copy]  |  |
|  +───────────────────────────────────────────────────+  |
|                                                         |
|  ⏳ Kode ini akan kadaluarsa dalam: 14:59 menit        |
|                                                         |
|  [ Tutup ]                     [ Cek Status / Refresh ] |
+─────────────────────────────────────────────────────────+
```

> [!TIP]
> Saat user menekan tombol **"Cek Status / Refresh"**, Frontend dapat melakukan _re-fetch_ list grup (`GET /api/v1/tenant/groups`) untuk memverifikasi apakah grup baru sudah berhasil ditambahkan oleh sistem (karena eksekusi bot di Telegram terjadi secara instan setelah user mengirimkan kode). Jika berhasil masuk, Modal dapat otomatis tertutup dengan notifikasi sukses.
