# Rangkuman Session Frontend Redesign

Project:
`D:\Development\Application\Project-untuk-tambah-uang-nikah\tg-manager\next-shadcn-dashboard-starter`

Konteks:
- User ingin Codex bertindak sebagai frontend designer ahli.
- Fokus redesign semua component yang dipakai di main page dan menu lain agar lebih modern.
- Jangan ubah chart-chart, karena user sudah suka.
- Bahasa percakapan: Indonesia.
- Stack: Next.js 16 App Router, TypeScript, Tailwind v4, shadcn/ui, TanStack Table, React Query.
- Ikuti AGENTS.md: gunakan `PageContainer` props untuk header, icons dari `src/components/icons.tsx`, jangan import icon langsung.

## Perubahan Besar

1. Main/overview page dipoles modern, chart tidak disentuh:
   - `src/app/[locale]/dashboard/overview/layout.tsx`
   - `src/features/overview/components/stats-cards.tsx`
   - `src/features/overview/components/recent-sales.tsx`
   - `src/features/overview/components/top-projects-table.tsx`

2. Shell/nav/search dipoles:
   - `src/components/layout/header.tsx`
   - `src/components/layout/app-sidebar.tsx`
   - `src/components/search-input.tsx`

3. Menu lain dibuat lebih compact dan modern:
   - `src/components/layout/page-container.tsx`
   - `src/components/ui/heading.tsx`
   - `src/components/ui/table/data-table.tsx`
   - `src/components/ui/table/data-table-toolbar.tsx`
   - `src/components/ui/table/data-table-view-options.tsx`
   - `src/components/ui/table/data-table-pagination.tsx`
   - `src/components/ui/table/data-table-skeleton.tsx`
   - `src/components/ui/table/data-table-faceted-filter.tsx`
   - `src/components/ui/table/data-table-date-filter.tsx`
   - `src/components/ui/table/data-table-slider-filter.tsx`
   - `src/features/billing/components/quota-card.tsx`
   - Listing wrappers untuk bots, groups, packages, discounts, commands, broadcast
   - `src/features/migration-members/components/members-page-tabs.tsx`
   - `src/features/commands/components/command-tables/columns.tsx`

## Desain Yang Diminta

- Kuota card lebih compact, satu banner tipis, padding minimal.
- Header halaman compact: label modul, judul, deskripsi, tombol tambah dalam layout ringkas.
- Toolbar filter compact, pill radius 99px, tinggi kecil.
- Kuota card idealnya muncul hanya saat warning/full.
- Kolom "Akses" di Commands diringkas jadi badge compact.
- Header halaman tidak sticky.
- Kuota banner tidak sticky.
- Toolbar filter tetap mudah diakses, tapi jangan menimpa navbar.
- Table header sticky.
- Pagination footer sticky di bawah.

## Bug Dan Fix

1. Navbar tertiban saat scroll.
   - Root cause: sticky toolbar/footer tabel menempel ke viewport dan naik ke area navbar.
   - Fix:
     - `src/components/layout/header.tsx`: z-index header dinaikkan ke `z-50`.
     - `src/components/ui/table/data-table.tsx`: toolbar atas dibuat `shrink-0`, bukan sticky viewport.
     - `src/components/ui/table/data-table-skeleton.tsx`: toolbar skeleton juga `shrink-0`.

2. Header table tulisannya tidak kelihatan.
   - Fix di `src/components/ui/table/data-table.tsx`:
     - `TableHeader` dibuat `bg-muted`, bukan translucent.
     - Header cell style ditambah:
       ```tsx
       background: 'var(--muted)',
       zIndex: header.column.getIsPinned() ? 30 : 20,
       ```

3. Pagination footer harus sticky di bawah.
   - Fix:
     - `src/components/ui/table/data-table.tsx`: footer pagination dikembalikan ke `sticky bottom-0 z-30`.
     - `src/components/ui/table/data-table-skeleton.tsx`: pagination skeleton juga sticky bottom.

4. Di menu Commands pagination tidak sticky di bawah.
   - Root cause: wrapper Commands tidak memberi tinggi fleksibel yang benar ke tabel.
   - Fix:
     - `src/features/commands/components/command-listing-content.tsx`:
       ```tsx
       <div className='flex min-h-0 flex-1 flex-col gap-4'>
       ```
     - `src/features/commands/components/command-tables/index.tsx`:
       ```tsx
       <div className='min-h-0 flex-1'>
         <DataTable table={table}>
           <DataTableToolbar table={table} />
         </DataTable>
       </div>
       ```

## Error Runtime Yang Sempat Ditanyakan

Error:

```txt
failed to forward action response TypeError: fetch failed
[cause]: HeadersTimeoutError
code: UND_ERR_HEADERS_TIMEOUT
POST /[locale]/dashboard/commands 404 in 6.4min
```

Analisis:
- Bukan bug desain/tabel.
- `apiClient` default ke `http://127.0.0.1:8080`.
- Kemungkinan backend di port 8080 mati/lambat, `NEXT_PUBLIC_API_URL` salah, endpoint `/api/v1/tenant/commands` hang, atau presigned upload/S3 bermasalah.

Cek cepat:

```powershell
curl http://127.0.0.1:8080/api/v1/tenant/commands?limit=1000
```

## Validasi

- Beberapa kali menjalankan targeted lint:
  ```powershell
  bunx oxlint <file...>
  ```
- Lulus 0 warning / 0 error untuk file yang dites.
- Full lint sebelumnya pernah gagal karena issue unrelated di repo.
- Dev server pernah gagal karena sandbox `spawn EPERM`; kalau perlu run dev server, kemungkinan butuh escalation.

## Catatan Penting

- Jangan revert perubahan user.
- Worktree kemungkinan dirty dengan banyak file desain yang sudah berubah.
- Jangan jalankan broad formatter lagi kecuali diminta, karena sebelumnya sempat muncul banyak warning line-ending CRLF.
- Jika ada bug sticky lagi, cek `min-h-0`, `flex-1`, parent overflow, dan apakah sticky diarahkan ke viewport atau ke panel internal.
