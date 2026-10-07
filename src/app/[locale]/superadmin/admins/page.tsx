'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { PaginationBar } from '@/components/layout/pagination-bar';
import { usePagination } from '@/hooks/use-pagination';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import {
  adminsQueryOptions,
  rolesQueryOptions,
  useCreateAdmin,
  useUpdateAdmin,
  useDeleteAdmin,
  useActivateAdmin,
  useDeactivateAdmin,
  useSyncAdminRoles
} from '../../../../features/superadmin/api/queries';

export default function AdminsPage() {
  const { page, setPage, limit, handleLimitChange, limitOptions } = usePagination();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const setSearchDebounced = useDebouncedCallback((value: string) => {
    setDebouncedSearch(value);
    setPage(1);
  }, 400);
  const { data: adminsRes, isPlaceholderData } = useQuery({
    ...adminsQueryOptions(page, limit, debouncedSearch || undefined),
    placeholderData: (previous) => previous
  });
  const { data: rolesRes } = useQuery(rolesQueryOptions(1, 999));
  const createMut = useCreateAdmin();
  const updateMut = useUpdateAdmin();
  const deleteMut = useDeleteAdmin();
  const activateMut = useActivateAdmin();
  const deactivateMut = useDeactivateAdmin();
  const syncRolesMut = useSyncAdminRoles();

  const admins = adminsRes?.success ? adminsRes.data : [];
  const pagination = adminsRes?.success ? adminsRes.pagination : undefined;
  const totalPages = pagination?.total_pages ?? 1;
  const total = pagination?.total ?? admins.length;
  const roles = rolesRes?.success ? rolesRes.data : [];

  // Form state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role_id: '' });
  const [deleting, setDeleting] = useState<any>(null);
  const [statusChanging, setStatusChanging] = useState<any>(null);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', email: '', password: '', role_id: '' });
    setDialogOpen(true);
  };
  const openEdit = (a: any) => {
    setEditing(a);
    setForm({ name: a.name, email: a.email, password: '', role_id: a.roles?.[0]?.id || '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Nama dan email wajib diisi');
      return;
    }
    if (editing) {
      const res = await updateMut.mutateAsync({
        id: editing.id,
        name: form.name,
        email: form.email,
        password: form.password || undefined
      });
      if (res.success) {
        const currentRoleId = editing.roles?.[0]?.id || '';
        if (form.role_id !== currentRoleId) {
          await syncRolesMut.mutateAsync({
            id: editing.id,
            role_ids: form.role_id ? [form.role_id] : []
          });
        }
        toast.success('Admin diperbarui');
        setDialogOpen(false);
      } else toast.error(res.message);
    } else {
      if (!form.password) {
        toast.error('Password wajib diisi untuk admin baru');
        return;
      }
      const res = await createMut.mutateAsync({
        name: form.name,
        email: form.email,
        password: form.password,
        role_id: form.role_id || undefined
      });
      if (res.success) {
        toast.success('Admin dibuat');
        setDialogOpen(false);
      } else toast.error(res.message);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const res = await deleteMut.mutateAsync(deleting.id);
    if (res.success) toast.success('Admin dihapus');
    else toast.error(res.message);
    setDeleting(null);
  };

  const handleToggleStatus = async (admin: any) => {
    const res = admin.is_active
      ? await deactivateMut.mutateAsync(admin.id)
      : await activateMut.mutateAsync(admin.id);
    if (res.success) toast.success(admin.is_active ? 'Admin dinonaktifkan' : 'Admin diaktifkan');
    else toast.error(res.message);
  };

  const confirmStatusChange = async () => {
    if (!statusChanging) return;
    await handleToggleStatus(statusChanging);
    setStatusChanging(null);
  };

  return (
    <PageContainer pageTitle='Admin'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSearchDebounced(e.target.value);
          }}
          placeholder='Cari nama, email, atau role...'
          className='h-10 w-full rounded-full border-border bg-background px-4 text-sm font-semibold sm:w-60'
        />
        <Button onClick={openCreate}>
          <Icons.add className='mr-2 size-4' />
          Tambah Admin
        </Button>
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='text-right'>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className='text-center text-muted-foreground py-8'>
                  {debouncedSearch ? 'Tidak ada admin yang cocok' : 'Belum ada admin'}
                </TableCell>
              </TableRow>
            ) : (
              admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className='font-medium'>{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.roles?.[0]?.name || '—'}</TableCell>
                  <TableCell>
                    <StatusBadge active={admin.is_active} />
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-1'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() =>
                          admin.is_active
                            ? setStatusChanging(admin)
                            : void handleToggleStatus(admin)
                        }
                        title={admin.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        {admin.is_active ? (
                          <Icons.eyeOff className='size-4' />
                        ) : (
                          <Icons.eye className='size-4' />
                        )}
                      </Button>
                      <Button variant='ghost' size='icon' onClick={() => openEdit(admin)}>
                        <Icons.edit className='size-4' />
                      </Button>
                      <Button variant='ghost' size='icon' onClick={() => setDeleting(admin)}>
                        <Icons.trash className='size-4 text-destructive' />
                      </Button>
                    </div>
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
        label='admin'
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
        nextDisabled={isPlaceholderData}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Admin' : 'Tambah Admin'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'Perbarui data admin. Kosongkan password jika tidak diubah.'
                : 'Buat akun admin baru untuk mengelola platform.'}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-2'>
            <div className='flex flex-col gap-2'>
              <label htmlFor='admin-name' className='text-sm font-medium'>
                Nama
              </label>
              <Input
                id='admin-name'
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder='Nama admin'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <label htmlFor='admin-email' className='text-sm font-medium'>
                Email
              </label>
              <Input
                id='admin-email'
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder='admin@example.com'
                type='email'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <label htmlFor='admin-password' className='text-sm font-medium'>
                Password {editing ? '(kosongkan jika tidak diubah)' : ''}
              </label>
              <Input
                id='admin-password'
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder='••••••••'
                type='password'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <label htmlFor='admin-role' className='text-sm font-medium'>
                Role
              </label>
              <select
                className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-none'
                value={form.role_id}
                onChange={(e) => setForm((p) => ({ ...p, role_id: e.target.value }))}
              >
                <option value=''>Tanpa role</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave}>{editing ? 'Simpan' : 'Buat'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleting}
        onOpenChange={(o) => {
          if (!o) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Yakin ingin menghapus admin &quot;{deleting?.name}&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='bg-destructive text-destructive-foreground'
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!statusChanging}
        onOpenChange={(o) => {
          if (!o) setStatusChanging(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nonaktifkan Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Admin &quot;{statusChanging?.name}&quot; akan kehilangan akses ke panel superadmin.
              Tindakan ini dapat dibatalkan dengan mengaktifkannya kembali.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusChange}
              className='bg-destructive text-destructive-foreground'
            >
              Nonaktifkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
