# Inline Row Actions — Replace Titik-3 Dropdown dengan Icon Inline

## Masalah

Banyak menu tenant memakai titik-3 (DropdownMenu) padahal cuma punya 2-3 action, sehingga satu klik tambahan tiap action tidak perlu.

## Solusi

Pola `bot-tables/cell-action.tsx` yang sudah inline dipakai sebagai template: tiap action = `Tooltip` + icon ghost button (`size-9 min-w-9 min-h-9`).

| File | Action inline | Tooltip |
|------|--------------|---------|
| `groups/components/group-tables/cell-action.tsx` | edit, trash | Ubah Grup, Hapus |
| `commands/components/command-tables/cell-action.tsx` | edit, trash | Ubah, Hapus |
| `discounts/components/discount-tables/cell-action.tsx` | edit, toggle active, trash | Ubah Diskon, Nonaktifkan/Aktifkan, Hapus |
| `packages/components/package-tables/cell-action.tsx` | edit, trash | Ubah Paket, Hapus |
| `bots/components/bot-card-grid.tsx` | edit, toggle, network, trash | Ubah, Nonaktifkan/Aktifkan, Jaringan, Hapus |

## Batasan

- Members tetap dropdown (5 action, pantas).
- DropdownMenu/Label/Separator dihapus; AlertModal delete tetap.
- Kolom `actions` dilebarin di columns.tsx biar muat icon.

## Verifikasi

`npm run lint`, `npm run typecheck` (atau `next build`).
