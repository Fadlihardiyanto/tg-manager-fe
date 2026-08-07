'use client';

import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { packagesQueryOptions } from '../../api/queries';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { formatDate, formatRupiah } from '@/lib/format';
import type { Package } from '../../api/types';
import { StatusCell } from './columns';
import { CellAction } from './cell-action';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';

interface PackageTableProps {
  onEdit: (pkg: Package) => void;
  onBulkDelete?: (ids: string[]) => void;
  toolbarActions?: ReactNode;
  notice?: ReactNode;
}

function PackageCard({
  pkg,
  onEdit,
  isSelected,
  onToggleSelect
}: {
  pkg: Package;
  onEdit: (pkg: Package) => void;
  isSelected: boolean;
  onToggleSelect?: () => void;
}) {
  const groups = pkg.groups ?? [];
  const MAX_VISIBLE_GROUPS = 3;
  const visibleGroups = groups.slice(0, MAX_VISIBLE_GROUPS);
  const overflowCount = groups.length - MAX_VISIBLE_GROUPS;

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-xl border border-border/70 bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20',
        !pkg.is_active && 'opacity-75',
        isSelected && 'border-primary ring-1 ring-primary/30'
      )}
    >
      {/* Command Blue accent stripe */}
      <div className='h-1.5 w-full rounded-t-xl bg-gradient-to-r from-primary/80 to-primary' />

      {onToggleSelect && (
        <div className='absolute left-3 top-3 z-10'>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect?.()}
            aria-label={`Pilih paket ${pkg.name}`}
          />
        </div>
      )}

      <div className='flex flex-1 flex-col p-5'>
        {/* Top row: icon + identity + kebab */}
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3 min-w-0'>
            <div className='relative shrink-0'>
              <div
                className={cn(
                  'flex size-12 shrink-0 items-center justify-center rounded-xl transition-colors',
                  pkg.is_active
                    ? 'bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20'
                    : 'bg-muted'
                )}
              >
                <Icons.product
                  className={cn('size-7', pkg.is_active ? 'text-primary' : 'text-muted-foreground')}
                />
              </div>
              <span
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background',
                  pkg.is_active ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                )}
              />
            </div>
            <div className='min-w-0'>
              <h6 className='text-base font-semibold text-foreground truncate'>{pkg.name}</h6>
              <p className='text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400'>
                {formatRupiah(pkg.price)}
              </p>
            </div>
          </div>

          <CellAction data={pkg} onEdit={onEdit} />
        </div>

        {/* Badges row: duration + all-access + status */}
        <div className='mt-4 flex items-center gap-2.5 flex-wrap'>
          <span className='inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground'>
            <Icons.clock className='size-3' />
            {pkg.duration_days} hari
          </span>

          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
              pkg.is_all_access
                ? 'bg-violet-500/10 text-violet-600 border border-violet-500/20 dark:text-violet-400'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {pkg.is_all_access && <Icons.check className='size-3' />}
            {pkg.is_all_access ? 'Akses Penuh' : 'Per Grup'}
          </span>

          <div className='ml-auto'>
            <StatusCell pkg={pkg} />
          </div>
        </div>

        {/* Group chips */}
        {groups.length > 0 && (
          <div className='mt-3 flex flex-wrap items-center gap-1.5'>
            {visibleGroups.map((g) => (
              <span
                key={g.id}
                className='inline-flex items-center rounded-md bg-muted/40 px-2 py-1 text-xs text-muted-foreground'
              >
                <Icons.groups className='mr-1 size-3' />
                {g.name}
              </span>
            ))}
            {overflowCount > 0 && (
              <span className='inline-flex items-center rounded-md bg-muted/40 px-2 py-1 text-xs text-muted-foreground'>
                +{overflowCount}
              </span>
            )}
          </div>
        )}

        {/* Footer: created date */}
        <div className='mt-auto flex items-center justify-between border-t border-border/40 pt-4 text-xs text-muted-foreground'>
          <span className='flex items-center gap-1.5'>
            <Icons.calendar className='size-3' />
            {formatDate(pkg.created_at, {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
          <button
            type='button'
            className='flex items-center gap-1 font-medium text-primary transition-colors hover:text-primary/80'
            onClick={() => onEdit(pkg)}
          >
            Kelola
            <Icons.chevronRight className='size-3' />
          </button>
        </div>
      </div>
    </div>
  );
}

export function PackageTable({ onEdit, onBulkDelete, toolbarActions, notice }: PackageTableProps) {
  const { data } = useSuspenseQuery(packagesQueryOptions());
  const packages = data.data ?? [];
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const query = search.toLowerCase().trim();
  const filtered = query ? packages.filter((p) => p.name.toLowerCase().includes(query)) : packages;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedIds([]);

  if (packages.length === 0) {
    return (
      <div className='flex min-h-0 flex-1 flex-col gap-4'>
        {notice && <div>{notice}</div>}
        <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 p-10 text-center'>
          <div className='flex size-12 items-center justify-center rounded-full bg-muted'>
            <Icons.product className='size-6 text-muted-foreground' />
          </div>
          <p className='mt-3 font-medium text-foreground'>Belum ada paket</p>
          <p className='mt-1 text-sm text-muted-foreground'>
            Buat paket langganan pertama Anda untuk mulai menjual akses grup.
          </p>
          <div className='mt-4'>{toolbarActions}</div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-4'>
      {notice && <div>{notice}</div>}

      {/* Toolbar: search + actions */}
      <div className='flex items-center gap-3'>
        <div className='relative flex-1 max-w-sm'>
          <Icons.search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Cari paket...'
            className='h-10 rounded-full pl-9 pr-9 text-sm'
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
            >
              <Icons.close className='h-4 w-4' />
            </button>
          )}
        </div>
        <div className='shrink-0'>
          {selectedIds.length > 0 && onBulkDelete ? (
            <div className='flex items-center gap-3'>
              <span className='text-sm font-medium text-primary'>
                {selectedIds.length} paket dipilih
              </span>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  className='rounded-full'
                  onClick={clearSelection}
                >
                  Batal Pilih
                </Button>
                <Button
                  variant='destructive'
                  size='sm'
                  className='rounded-full'
                  onClick={() => onBulkDelete(selectedIds)}
                >
                  <Icons.trash className='mr-2 h-4 w-4' />
                  Hapus {selectedIds.length} Paket
                </Button>
              </div>
            </div>
          ) : (
            toolbarActions
          )}
        </div>
      </div>

      {/* Title + description */}
      <div className='shrink-0'>
        <h2 className='text-lg font-bold text-foreground'>Daftar Paket</h2>
        <p className='mt-1 text-sm text-muted-foreground'>
          Kelola paket langganan, harga, durasi, dan akses grup.
        </p>
      </div>

      {/* No search results */}
      {filtered.length === 0 && (
        <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 p-10 text-center'>
          <div className='flex size-12 items-center justify-center rounded-full bg-muted'>
            <Icons.search className='size-6 text-muted-foreground' />
          </div>
          <p className='mt-3 font-medium text-foreground'>Paket tidak ditemukan</p>
          <p className='mt-1 text-sm text-muted-foreground'>
            Tidak ada paket dengan nama &quot;{search}&quot;.
          </p>
        </div>
      )}

      {/* Card grid */}
      {filtered.length > 0 && (
        <div className='grid gap-5 sm:grid-cols-2 xl:grid-cols-3'>
          {filtered.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onEdit={onEdit}
              isSelected={selectedIds.includes(pkg.id)}
              onToggleSelect={onBulkDelete ? () => toggleSelect(pkg.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
