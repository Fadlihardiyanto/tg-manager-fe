# Full Frontend (FE) Integration Guide: Custom Command (Auto-Reply)

Panduan ini menggabungkan alur **CRUD Custom Command** dan **S3 Direct Upload (Presigned URL)** menjadi satu alur kerja utuh yang siap diimplementasikan oleh tim Frontend.

---

## 🔄 Alur Kerja Lengkap Pembuatan Custom Command

### Skenario A: Tipe Respon Teks (`response_type: "text"`)

1. User mengisi form: Bot ID, Trigger (pemicu), Tipe Respon (Teks), dan Isi Pesan.
2. Frontend melakukan validasi format trigger dan blacklist.
3. Frontend langsung menembak API backend untuk membuat/mengedit perintah.

### Skenario B: Tipe Respon Foto atau Dokumen (`response_type: "photo"` atau `"document"`)

1. User mengisi form dan memilih file berkas (Gambar untuk foto, PDF untuk dokumen).
2. Frontend meminta **Presigned URL** ke backend (`POST /api/v1/tenant/upload/presign`).
3. Frontend mengunggah berkas mentah langsung ke S3 menggunakan link `upload_url` (`PUT`).
4. Setelah upload selesai, Frontend mengambil `public_url` hasil upload tersebut.
5. Frontend menembak API backend untuk membuat/mengedit perintah dengan mengirimkan `public_url` di field `file_url`.

---

## 🎨 Panduan Desain & Validasi UI Frontend

### 1. Aturan Validasi Trigger (Sangat Penting!)

Untuk mencegah error saat didaftarkan ke server Telegram, Frontend wajib memvalidasi input pemicu (`command_trigger`):

- **Format**: Hanya boleh berisi huruf kecil (`a-z`), angka (`0-9`), dan garis bawah (`_`). Tidak boleh ada spasi atau karakter khusus lainnya.
- **Awalan**: Harus selalu diawali dengan `/`. (Jika user lupa mengetik `/`, Frontend harus menambahkannya secara otomatis).
- **Panjang**: Maksimal **32 karakter** (termasuk `/`).
- **Daftar Blacklist**: Tidak boleh menggunakan perintah bawaan sistem. Blokir jika user menginput salah satu dari kode berikut:
  - `/start`, `/packages`, `/mysub`, `/status`, `/myorders`, `/connect`.

#### Contoh Regex Validasi di Frontend:

```javascript
const triggerRegex = /^\/[a-z0-9_]{1,31}$/;
```

### 2. Form Input Kondisional (Dinamis)

- **Tipe Respon = Teks (`text`)**:
  - Tampilkan input teks area dengan label **"Isi Pesan Balasan"** (simpan ke field `response_text`).
  - Sembunyikan komponen upload file.
- **Tipe Respon = Foto (`photo`)**:
  - Tampilkan komponen _file upload_ gambar (validasi format `.jpg`, `.png`, `.webp`, ukuran maks 2 MB).
  - Tampilkan input teks area dengan label **"Keterangan Gambar (Caption)"** (simpan ke field `response_text`).
- **Tipe Respon = Dokumen (`document`)**:
  - Tampilkan komponen _file upload_ dokumen (validasi format `.pdf` saja, ukuran maks 5 MB).
  - Tampilkan input teks area dengan label **"Keterangan Dokumen (Caption)"** (simpan ke field `response_text`).

### 3. Panduan UI/UX: Preview File di Form & List Tabel

#### A. File Preview di dalam Form Pembuatan/Edit

Untuk meningkatkan rasa percaya diri user saat mengunggah berkas, tampilkan preview instan di browser sebelum berkas diunggah:

- **Untuk Foto**:
  - Gunakan `URL.createObjectURL(file)` untuk merender gambar secara instan dalam tag `<img>` berukuran sedang (lebar `150px` - `200px` dengan border-radius tipis).
  - Sediakan tombol **"Hapus Berkas"** untuk mereset pilihan.
- **Untuk Dokumen (PDF)**:
  - Tampilkan **Document Card** berupa ikon berkas PDF (biasanya berwarna merah), disertai info nama file asli dan ukurannya (misal: `📄 Brosur_Jualan.pdf (3.2 MB)`).
  - Untuk data lama yang diedit, sediakan link **"Buka Berkas"** dengan atribut `target="_blank"` yang mengarah ke `file_url` agar user bisa memverifikasi PDF yang tersimpan.

#### B. Preview Ringkas di Tabel Daftar Command (List)

Tabel kustom perintah harus tetap rapi dan tidak terlalu tinggi. Jangan tampilkan gambar ukuran penuh di tabel:

- **Kolom "Tipe"**: Gunakan badge berwarna kecil:
  - `text`: Badge Biru (tulisan "Teks")
  - `photo`: Badge Hijau (tulisan "Foto")
  - `document`: Badge Merah (tulisan "Dokumen")
- **Kolom "Balasan / Media"**:
  - _Tipe Teks_: Tampilkan potongan teks balasan dengan efek pemotongan kata (_truncate_ / ellipsis) jika melebihi 50 karakter.
  - _Tipe Foto_: Tampilkan thumbnail gambar mini (misal ukuran **`36px x 36px`** atau **`40px x 40px`** dengan sudut melengkung). Gambar ini jika diklik akan membuka file asli (`file_url`) di tab baru (`_blank`).
  - _Tipe Dokumen_: Tampilkan tombol link kecil berbentuk ikon kertas/PDF dengan teks **"Lihat PDF"** (jika diklik akan membuka/mengunduh PDF dari S3/R2 di tab baru).

---

## 🌐 Daftar Endpoint API Terkait

### 1. Get Presigned URL

- **Method**: `POST`
- **Endpoint**: `/api/v1/tenant/upload/presign`
- **Request Body**:
  ```json
  {
    "file_name": "katalog_produk.pdf",
    "content_type": "application/pdf" // atau image/png, image/jpeg, image/webp
  }
  ```
- **Response**: Mengembalikan JSON berisi `upload_url` dan `public_url`.

### 2. Create Custom Command

- **Method**: `POST`
- **Endpoint**: `/api/v1/tenant/commands`
- **Request Body**:
  ```json
  {
    "bot_id": "aa123b32-9cb3-4bde-a3c7-d688fe0e4f71",
    "command_trigger": "/katalog",
    "response_type": "document", // "text", "photo", atau "document"
    "response_text": "Katalog Produk Bulan Juni",
    "file_url": "https://storage.urator.com/tenant_uploads/..." // NULL jika tipe "text"
  }
  ```

### 3. Update Custom Command

- **Method**: `PUT`
- **Endpoint**: `/api/v1/tenant/commands/:id`
- **Request Body**: (Kirim hanya field yang berubah)
  ```json
  {
    "command_trigger": "/new_katalog",
    "response_text": "Katalog Produk Ter-update",
    "file_url": "https://storage.urator.com/tenant_uploads/...",
    "is_active": true
  }
  ```
- _Catatan: Jika `file_url` diubah saat update, backend otomatis menghapus cache internal Telegram. Frontend tidak perlu mereset apapun._

---

## 💻 Contoh Implementasi Kode Lengkap (TypeScript / React)

Berikut adalah _React Hook / Async Function_ untuk memproses pembuatan/pengeditan custom command dari Frontend:

```typescript
import { useState } from "react";

interface CommandPayload {
  bot_id: string;
  command_trigger: string;
  response_type: "text" | "photo" | "document";
  response_text: string;
}

// 1. Fungsi Direct Upload ke S3/R2
async function uploadFileToS3(file: File, jwtToken: string): Promise<string> {
  // Minta presigned URL ke backend
  const presignRes = await fetch("/api/v1/tenant/upload/presign", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      file_name: file.name,
      content_type: file.type,
    }),
  });

  if (!presignRes.ok) throw new Error("Gagal mendapatkan link upload");
  const presignData = await presignRes.json();
  const { upload_url, public_url } = presignData.data;

  // Upload file biner langsung ke S3/R2
  const uploadRes = await fetch(upload_url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!uploadRes.ok) throw new Error("Gagal mengunggah file ke cloud storage");

  return public_url; // Mengembalikan URL publik gambar/dokumen
}

// 2. Fungsi Utama Simpan / Update Command
export function useCustomCommandForm(jwtToken: string) {
  const [loading, setLoading] = useState(false);
  const blacklist = [
    "/start",
    "/packages",
    "/mysub",
    "/status",
    "/myorders",
    "/connect",
  ];

  const saveCommand = async (
    payload: CommandPayload,
    attachedFile: File | null,
    commandId?: string, // jika dikirim berarti edit/update, jika kosong berarti create baru
  ) => {
    setLoading(true);
    try {
      // A. Validasi Format & Blacklist Trigger
      let trigger = payload.command_trigger.trim().toLowerCase();
      if (!trigger.startsWith("/")) {
        trigger = "/" + trigger;
      }

      // Validasi Regex: huruf kecil, angka, underscore, maks 32 karakter
      const triggerRegex = /^\/[a-z0-9_]{1,31}$/;
      if (!triggerRegex.test(trigger)) {
        throw new Error(
          "Format pemicu salah! Hanya gunakan huruf kecil, angka, dan underscore (maksimal 32 karakter).",
        );
      }

      // Validasi Blacklist
      if (blacklist.includes(trigger)) {
        throw new Error(
          `Perintah "${trigger}" adalah perintah bawaan sistem dan tidak bisa digunakan.`,
        );
      }

      // Perbarui payload dengan trigger hasil sanitasi
      payload.command_trigger = trigger;

      // A.2 Validasi Panjang Karakter Response Text (Emoji-safe)
      const maxTextLimit = payload.response_type === "text" ? 4096 : 1024;
      const charCount = Array.from(payload.response_text).length;
      if (charCount > maxTextLimit) {
        throw new Error(
          `Isi pesan terlalu panjang! Maksimal untuk tipe ${payload.response_type} adalah ${maxTextLimit} karakter (saat ini ${charCount} karakter).`,
        );
      }

      let fileUrl: string | null = null;

      // B. Validasi Ukuran & Upload File (jika tipenya photo/document dan ada file yang dipilih)
      const needUpload =
        payload.response_type === "photo" ||
        payload.response_type === "document";
      if (needUpload && attachedFile) {
        // Batasan Ukuran: Dokumen maks 5 MB, Foto maks 2 MB
        const maxLimitMB = payload.response_type === "document" ? 5 : 2;
        const maxSizeBytes = maxLimitMB * 1024 * 1024;

        if (attachedFile.size > maxSizeBytes) {
          throw new Error(
            `Ukuran berkas terlalu besar! Maksimal ukuran berkas untuk ${payload.response_type} adalah ${maxLimitMB} MB.`,
          );
        }

        fileUrl = await uploadFileToS3(attachedFile, jwtToken);
      }

      // C. Kirim ke API Backend (Create atau Update)
      const isEdit = !!commandId;
      const url = isEdit
        ? `/api/v1/tenant/commands/${commandId}`
        : "/api/v1/tenant/commands";
      const method = isEdit ? "PUT" : "POST";

      const finalBody = {
        ...payload,
        file_url: needUpload ? fileUrl : null,
      };

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menyimpan kustom perintah");
      }

      alert(
        isEdit
          ? "Kustom perintah berhasil diperbarui!"
          : "Kustom perintah baru berhasil dibuat!",
      );
      return true;
    } catch (error: any) {
      alert(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { saveCommand, loading };
}
```
