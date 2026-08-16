# Bulk Delete — Frontend Integration Guide

Dokumentasi endpoint **best-effort bulk delete** untuk tenant & admin panel.
Semua endpoint uniform — hanya path & permission yang berbeda.

---

## Pola Umum

- **Method:** `DELETE`
- **Content-Type:** `application/json`
- **Body:** `{ "ids": ["uuid", ...] }` — wajib, 1–100 item, tiap item UUID valid
- **Response:** selalu `200 OK` (partial success adalah hal normal)

## Daftar Endpoint

### Tenant (`Authorization: Bearer <tenant_jwt>`)

| Endpoint | Permission |
|----------|-----------|
| `DELETE /api/v1/tenant/commands/bulk` | `bots.delete` |
| `DELETE /api/v1/tenant/bots/bulk` | `bots.delete` |
| `DELETE /api/v1/tenant/groups/bulk` | `groups.delete` |
| `DELETE /api/v1/tenant/packages/bulk` | `packages.delete` |
| `DELETE /api/v1/tenant/discounts/bulk` | `packages.delete` |

### Admin (`Authorization: Bearer <admin_jwt>`)

| Endpoint | Permission |
|----------|-----------|
| `DELETE /admin/v1/roles/bulk` | `roles.delete` |
| `DELETE /admin/v1/admins/bulk` | `admins.delete` |
| `DELETE /admin/v1/clients/bulk` | `clients.delete` |
| `DELETE /admin/v1/billing/plans/bulk` | `billing.manage` |
| `DELETE /admin/v1/billing/discounts/bulk` | `billing.manage` |

---

## Contoh Request

```http
DELETE /api/v1/tenant/commands/bulk
Authorization: Bearer <tenant_jwt>
Content-Type: application/json

{
  "ids": [
    "6b1f5c9e-3a4b-4c5d-8e6f-1a2b3c4d5e6f",
    "9f2e8d7c-6b5a-4a3b-9c8d-2e3f4a5b6c7d",
    "3a4b5c6d-7e8f-4a9b-8c7d-6e5f4a3b2c1d"
  ]
}
```

---

## Response

### 1. Semua sukses (`200 OK`)

```json
{
  "success": true,
  "message": "Bulk delete custom command selesai",
  "data": {
    "deleted": 3,
    "failed": []
  }
}
```

### 2. Sebagian gagal — best-effort (`200 OK`)

```json
{
  "success": true,
  "message": "Bulk delete custom command selesai",
  "data": {
    "deleted": 2,
    "failed": [
      {
        "id": "9f2e8d7c-6b5a-4a3b-9c8d-2e3f4a5b6c7d",
        "error": "Custom command tidak ditemukan"
      }
    ]
  }
}
```

### 3. Validasi error (`400 Bad Request` / `422 Unprocessable Entity`)

```json
{
  "success": false,
  "message": "Format request tidak valid",
  "error": null
}
```

Muncul jika: body bukan JSON valid, `ids` kosong, `ids` lebih dari 100, atau ada UUID yang tidak valid.

---

## Struktur `data`

| Field | Type | Keterangan |
|-------|------|-----------|
| `deleted` | int | jumlah yang berhasil di-delete |
| `failed` | array \| null | daftar kegagalan per id (`null`/`[]` kalau semua sukses) |
| `failed[].id` | uuid | id yang gagal |
| `failed[].error` | string | pesan error per item |

## Contoh `message` per menu

| Menu | `message` |
|------|-----------|
| Custom Commands | `Bulk delete custom command selesai` |
| Bots | `Bulk delete bot selesai` |
| Groups | `Bulk delete grup selesai` |
| Packages | `Bulk delete paket selesai` |
| Member Discounts | `Bulk delete diskon selesai` |
| Roles (admin) | `Bulk delete role selesai` |
| Admins (admin) | `Bulk delete admin selesai` |
| Clients (admin) | `Bulk delete tenant selesai` |
| Plans (admin) | `Bulk delete plan selesai` |
| Platform Discounts (admin) | `Bulk delete diskon selesai` |

---

## Panduan Frontend

1. **Treat `200` sebagai "proses selesai"** — bukan berarti semua sukses. Cek `data.failed`.
2. Jika `data.failed.length > 0`, tampilkan pesan ringkas (toast): *"X dihapus, Y gagal"* dan/atau detail per-item (expandable list).
3. Best-effort: item lain **tetap terhapus** walau salah satu gagal — jangan block / rollback di sisi FE.
4. **Error per-id yang mungkin muncul:**
   - `Custom command tidak ditemukan` / `Bot tidak ditemukan` / `Grup tidak ditemukan` / `Paket tidak ditemukan` / `diskon tidak ditemukan` — id tidak ada atau bukan milik tenant
   - `Forbidden` / akses ditolak — resource bukan milik session
   - `cannot delete system role '<name>'` — role sistem tidak boleh dihapus (admin)
   - `cannot delete the default 'free' plan` — plan default tidak boleh dihapus (admin)
   - `cannot delete plan: N active clients are using this plan` — plan sedang dipakai (admin)
5. **Refresh list setelah request selesai** — karena delete ini soft-delete (kolom `deleted_at`), item yang berhasil dihapus hilang dari daftar pada GET berikutnya.
