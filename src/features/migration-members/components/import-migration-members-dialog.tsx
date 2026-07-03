'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FileUploader } from '@/components/file-uploader';
import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { packagesQueryOptions } from '@/features/packages/api/queries';
import { migrationMembersKeys } from '../api/queries';
import { importMigrationMembersMutation } from '../api/mutations';
import type { MigrationImportError, MigrationImportMember } from '../api/types';

const MAX_ROWS = 1000;

function parseCsv(text: string): MigrationImportMember[] {
  const rows = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean);

  if (rows.length < 2) {
    throw new Error('CSV harus berisi header dan minimal 1 baris data');
  }

  const [headerRow, ...dataRows] = rows;
  const headers = splitCsvRow(headerRow).map((header) => normalizeCell(header).toLowerCase());

  if (headers[0] !== 'username' || headers[1] !== 'expired_at') {
    throw new Error('Header CSV harus `username,expired_at`');
  }

  if (dataRows.length > MAX_ROWS) {
    throw new Error(`Maksimal ${MAX_ROWS} baris per import`);
  }

  return dataRows.map((row, index) => {
    const cells = splitCsvRow(row);
    const username = normalizeCell(cells[0] ?? '');
    const expiredAt = normalizeCell(cells[1] ?? '');

    if (!username || !expiredAt) {
      throw new Error(`Baris ${index + 2} wajib berisi username dan expired_at`);
    }

    const parsedDate = new Date(expiredAt);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error(`Format tanggal tidak valid di baris ${index + 2}`);
    }

    return {
      username,
      expired_at: parsedDate.toISOString()
    };
  });
}

function splitCsvRow(row: string) {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < row.length; index += 1) {
    const char = row[index];
    const nextChar = row[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      cells.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells;
}

function normalizeCell(value: string) {
  return value
    .trim()
    .replace(/^"(.*)"$/, '$1')
    .trim();
}

function ImportStep({
  step,
  title,
  description,
  action,
  children
}: {
  step: number;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className='rounded-lg border p-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='space-y-1'>
          <div className='text-muted-foreground text-xs font-medium uppercase tracking-wide'>
            Step {step}
          </div>
          <div className='text-sm font-semibold'>{title}</div>
          {description ? <p className='text-muted-foreground text-sm'>{description}</p> : null}
        </div>
        {action ? <div className='shrink-0'>{action}</div> : null}
      </div>
      {children ? <div className='mt-4'>{children}</div> : null}
    </div>
  );
}

export function ImportMigrationMembersDialog({
  onImported
}: {
  onImported: (errors: MigrationImportError[]) => void;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [parsedRows, setParsedRows] = useState<MigrationImportMember[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const { data: packagesData } = useQuery(packagesQueryOptions());
  const packages = packagesData?.data ?? [];

  const importMutation = useMutation({
    ...importMigrationMembersMutation,
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message || 'Gagal mengimpor CSV');
        return;
      }

      toast.success(res.message);
      setOpen(false);
      setSelectedFiles([]);
      setParsedRows([]);
      setSelectedPackageId('');
      setParseError(null);
      void queryClient.invalidateQueries({ queryKey: migrationMembersKeys.all });

      if (res.data.skipped > 0) {
        onImported(res.data.errors);
      }
    },
    onError: () => {
      toast.error('Gagal mengimpor CSV');
    }
  });

  useEffect(() => {
    let isCancelled = false;

    const run = async () => {
      const file = selectedFiles[0] ?? null;
      setParsedRows([]);
      setParseError(null);

      if (!file) return;

      try {
        const text = await file.text();
        const rows = parseCsv(text);

        if (isCancelled) return;

        setParsedRows(rows);
        toast.success(`${rows.length} baris siap diimpor`);
      } catch (error) {
        if (isCancelled) return;

        const message = error instanceof Error ? error.message : 'CSV tidak valid';
        setSelectedFiles([]);
        setParseError(message);
        toast.error(message);
      }
    };

    void run();

    return () => {
      isCancelled = true;
    };
  }, [selectedFiles]);

  const handleTemplateDownload = async () => {
    try {
      setIsTemplateLoading(true);
      const response = await fetch('/api/tenant/migration-members/template');

      if (!response.ok) {
        throw new Error('Gagal mengunduh template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'migration-members-template.csv';
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal mengunduh template';
      toast.error(message);
    } finally {
      setIsTemplateLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPackageId) {
      toast.error('Pilih package terlebih dahulu');
      return;
    }

    if (parsedRows.length === 0) {
      toast.error('Upload CSV yang valid terlebih dahulu');
      return;
    }

    await importMutation.mutateAsync({
      package_id: selectedPackageId,
      members: parsedRows
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Icons.upload className='size-4' />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-[85vh] overflow-y-auto sm:max-w-[560px]'>
        <DialogHeader>
          <DialogTitle>Import migration members</DialogTitle>
          <DialogDescription>
            Download template, pilih package, lalu upload CSV maksimal 1000 baris.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-5'>
          <ImportStep
            step={1}
            title='Download template'
            description='Gunakan header `username,expired_at`.'
            action={
              <Button
                variant='outline'
                onClick={handleTemplateDownload}
                isLoading={isTemplateLoading}
              >
                Download
              </Button>
            }
          />

          <ImportStep
            step={2}
            title='Select package'
            description='Pilih package tujuan untuk semua member di file ini.'
          >
            <div className='space-y-2'>
              <Label htmlFor='migration-package'>Package</Label>
              <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
                <SelectTrigger id='migration-package'>
                  <SelectValue placeholder='Select a package' />
                </SelectTrigger>
                <SelectContent>
                  {packages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </ImportStep>

          <ImportStep
            step={3}
            title='Upload CSV'
            description='Pilih satu file CSV. Setelah valid, file siap diimport.'
          >
            <div className='space-y-3'>
              <FileUploader
                value={selectedFiles}
                onValueChange={setSelectedFiles}
                accept={{ 'text/csv': ['.csv'] }}
                maxFiles={1}
                multiple={false}
                className='h-40'
              />
              {parseError ? (
                <Alert variant='destructive'>
                  <Icons.close />
                  <AlertTitle>CSV tidak valid</AlertTitle>
                  <AlertDescription>{parseError}</AlertDescription>
                </Alert>
              ) : null}
              <Alert>
                <Icons.fileTypeXls />
                <AlertTitle>File status</AlertTitle>
                <AlertDescription>
                  {selectedFiles[0]
                    ? `${selectedFiles[0].name} - ${parsedRows.length} rows parsed`
                    : 'Belum ada file yang dipilih'}
                </AlertDescription>
              </Alert>
            </div>
          </ImportStep>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={importMutation.isPending}>
            Submit Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
