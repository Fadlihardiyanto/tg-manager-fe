'use client';

import { useQuery } from '@tanstack/react-query';
import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { PaginationBar } from '@/components/layout/pagination-bar';
import { usePagination } from '@/hooks/use-pagination';
import { auditLogsQueryOptions } from '../../../../features/superadmin/api/queries';
import { format } from 'date-fns';

const actionLabels: Record<string, string> = {
  create: 'Membuat',
  update: 'Mengubah',
  delete: 'Menghapus',
  login: 'Login',
  activate: 'Mengaktifkan',
  deactivate: 'Menonaktifkan'
};

const resourceLabels: Record<string, string> = {
  role: 'Role',
  admin: 'Admin',
  client: 'Tenant',
  plan: 'Paket',
  subscription: 'Langganan',
  permission: 'Permission'
};

export default function AuditLogsPage() {
  const { page, setPage, limit, handleLimitChange, limitOptions } = usePagination();
  const {
    data: logsRes,
    isLoading,
    isPlaceholderData
  } = useQuery(auditLogsQueryOptions(page, limit));

  const logs = logsRes?.success ? logsRes.data : [];
  const pagination = logsRes?.success ? logsRes.pagination : undefined;
  const totalPages = pagination?.total_pages ?? 1;
  const total = pagination?.total ?? logs.length;

  return (
    <PageContainer pageTitle='Audit Logs' pageDescription='Log aktivitas seluruh platform'>
      <div className='overflow-hidden rounded-xl border border-border/70 shadow-sm'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/30 hover:bg-muted/30'>
              <TableHead className='text-xs font-semibold uppercase tracking-wider'>
                Waktu
              </TableHead>
              <TableHead className='text-xs font-semibold uppercase tracking-wider'>
                Admin
              </TableHead>
              <TableHead className='text-xs font-semibold uppercase tracking-wider'>Aksi</TableHead>
              <TableHead className='text-xs font-semibold uppercase tracking-wider'>
                Resource
              </TableHead>
              <TableHead className='text-xs font-semibold uppercase tracking-wider'>
                Detail
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className='divide-y divide-border/80'>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className='text-muted-foreground py-8 text-center'>
                  Memuat...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className='text-muted-foreground py-8 text-center'>
                  Belum ada log
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className='transition-colors hover:bg-muted/35'>
                  <TableCell className='text-muted-foreground whitespace-nowrap text-xs'>
                    {log.created_at ? format(new Date(log.created_at), 'dd MMM HH:mm') : '-'}
                  </TableCell>
                  <TableCell className='text-sm font-medium'>{log.admin_name}</TableCell>
                  <TableCell>
                    <Badge variant='outline' className='capitalize'>
                      {actionLabels[log.action] || log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-muted-foreground text-sm'>
                    {resourceLabels[log.resource] || log.resource}
                    {log.resource_id ? (
                      <span className='ml-1 font-mono text-xs'>#{log.resource_id.slice(0, 8)}</span>
                    ) : null}
                  </TableCell>
                  <TableCell className='text-muted-foreground max-w-xs truncate text-xs'>
                    {log.details || '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationBar
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
        limitOptions={limitOptions}
        label='log'
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
        nextDisabled={isPlaceholderData}
      />
    </PageContainer>
  );
}
