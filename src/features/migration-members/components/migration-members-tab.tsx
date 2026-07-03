'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import type { MigrationImportError } from '../api/types';
import { MigrationMembersTable } from './migration-members-table';

export function MigrationMembersTab() {
  const [isExporting, setIsExporting] = useState(false);
  const [importErrors, setImportErrors] = useState<MigrationImportError[]>([]);
  const [errorsOpen, setErrorsOpen] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await fetch('/api/tenant/migration-members/export');

      if (!response.ok) {
        throw new Error('Gagal export CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'migration-members-export.csv';
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal export CSV';
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className='flex flex-1 min-h-0 flex-col gap-4'>
        <div>
          <h2 className='text-lg font-semibold'>Migration & Import</h2>
          <p className='text-muted-foreground text-sm'>
            Review imported members, track claim status, and manage CSV migration flow.
          </p>
        </div>

        <div className='flex flex-1 min-h-0'>
          <MigrationMembersTable
            onExport={handleExport}
            isExporting={isExporting}
            onImported={(errors) => {
              if (errors.length > 0) {
                setImportErrors(errors);
                setErrorsOpen(true);
              }
            }}
          />
        </div>
      </div>

      <AlertDialog open={errorsOpen} onOpenChange={setErrorsOpen}>
        <AlertDialogContent className='max-h-[80vh] overflow-y-auto sm:max-w-[640px]'>
          <AlertDialogHeader>
            <AlertDialogTitle>Skipped rows detected</AlertDialogTitle>
            <AlertDialogDescription>
              Beberapa baris gagal diimpor. Perbaiki data berikut lalu upload ulang CSV.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='space-y-2'>
            {importErrors.map((error) => (
              <div key={`${error.row}-${error.username}`} className='rounded-md border p-3 text-sm'>
                <p className='font-medium'>
                  Row {error.row} - @{error.username}
                </p>
                <p className='text-muted-foreground mt-1'>{error.error}</p>
              </div>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorsOpen(false)}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
