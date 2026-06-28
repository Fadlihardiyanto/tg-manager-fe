# Frontend (FE) Integration Guide: OTP-Based Group Connection

Panduan ini ditujukan bagi tim Frontend untuk mengintegrasikan alur baru pendaftaran grup Telegram menggunakan sistem Kode OTP/Koneksi.

---

## 🔄 Alur Kerja Baru (UI/UX)

1. User menekan tombol **"Tambah Grup Baru"** di halaman daftar grup.
2. Frontend menembak API backend untuk mendapatkan kode koneksi sekali pakai (berlaku selama 15 menit).
3. Tampilkan **Modal/Popup** kepada user berisi:
   - **Kode Unik** (Direkomendasikan format: `/connect@bot_username token` e.g. `/connect@MyGroupManagerBot X7YA9Z`) dengan tombol _Copy to Clipboard_.
     > [!TIP]
     > Menggunakan format `/connect@bot_username` memastikan hanya bot tersebut yang merespons perintah jika di dalam grup terdapat bot lain.
   - **Tombol Tambah Instan (Deep Link)**: `https://t.me/bot_username?startgroup=token` (menggunakan tombol berlabel "Tambahkan Bot ke Grup secara Instan").
   - **Petunjuk Penggunaan**:
     1. Masukkan bot ke grup Telegram Anda (bisa menggunakan tombol instan di atas).
     2. Jadikan bot tersebut sebagai **Administrator**.
     3. Kirim pesan berisi kode `/connect@bot_username token` di dalam grup.
   - **Countdown Timer** (Menghitung mundur dari 15:00 menit).
   - **Auto-Detect (Polling)**: Frontend secara otomatis memeriksa status koneksi ke backend setiap 2-3 detik. Begitu koneksi dikonfirmasi di Telegram, modal akan otomatis tertutup dan menampilkan animasi sukses!

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
    "expires_in": 900,
    "bot_username": "MyGroupManagerBot"
  }
}
```

### Check Connect Status

Digunakan oleh Frontend untuk melakukan polling status apakah bot sudah berhasil dihubungkan ke grup oleh user di Telegram.

- **Method**: `GET`
- **Endpoint**: `/api/v1/tenant/bots/:bot_id/groups/connect-status/:token`
- **Headers**:
  - `Authorization`: `Bearer <jwt_token_tenant>`
- **URL Parameter**:
  - `bot_id` (UUID): ID dari bot Telegram yang terhubung.
  - `token` (String): Kode koneksi (misal: `KWSPJG`).

#### Response (Success - 200 OK)

```json
{
  "code": 200,
  "message": "Status koneksi berhasil diperiksa",
  "data": {
    "status": "pending"
  }
}
```

> [!NOTE]
> Nilai field `status` yang mungkin dikembalikan:
>
> - `"pending"`: Token masih aktif, menunggu konfirmasi Admin di grup Telegram (baik via `/connect` maupun `/transfer`).
> - `"success"`: Grup telah berhasil dikoneksikan atau dipindahkan ke bot tersebut.
> - `"expired"`: Kode koneksi sudah kedaluwarsa (lebih dari 15 menit) atau dibatalkan oleh Admin di Telegram (menekan tombol Batalkan).

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
    bot_username: string;
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

### 3. Auto Polling Status Koneksi (React Hook)

Berikut adalah contoh hook React untuk melakukan polling status koneksi secara otomatis dan menangani pembaruan UI:

```typescript
import { useState, useEffect } from "react";

interface PollStatusResponse {
  code: number;
  message: string;
  data: {
    status: "pending" | "success" | "expired";
  };
}

export function useGroupConnectStatus(
  botId: string,
  token: string,
  jwtToken: string,
  onSuccess: () => void,
  onExpiredOrCancelled: (message: string) => void,
) {
  useEffect(() => {
    if (!token || !botId) return;

    let intervalId: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const response = await fetch(
          `/api/v1/tenant/bots/${botId}/groups/connect-status/${token}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) throw new Error("Network error");

        const res: PollStatusResponse = await response.json();

        if (res.data.status === "success") {
          clearInterval(intervalId);
          onSuccess();
        } else if (res.data.status === "expired") {
          clearInterval(intervalId);
          onExpiredOrCancelled(
            "Koneksi kedaluwarsa atau dibatalkan oleh Admin.",
          );
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    };

    // Mulai polling setiap 3 detik
    intervalId = setInterval(checkStatus, 3000);

    // Jalankan pengecekan pertama secara instan
    checkStatus();

    return () => clearInterval(intervalId);
  }, [botId, token, jwtToken, onSuccess, onExpiredOrCancelled]);
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
> Dengan adanya endpoint `/connect-status/:token` baru, Frontend disarankan **tidak perlu lagi menampilkan tombol manual "Saya Sudah Mengirimkan Kode"** atau **"Cek Status"** sebagai tombol aksi utama. Gantinya, tampilkan status spinner loading bertuliskan _"Menunggu konfirmasi di Telegram..."_ yang otomatis berubah menjadi ceklis sukses hijau begitu polling mengembalikan status `"success"`.
