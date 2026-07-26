'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  clientsQueryOptions,
  clientUsersQueryOptions,
  useCreateClient,
  useDeleteClient,
  useActivateClient,
  useDeactivateClient,
  useCreateClientUser
} from '../../../../features/superadmin/api/queries';

export default function TenantsPage() {
  const { page, setPage, limit, handleLimitChange, limitOptions } = usePagination();
  const { data: clientsRes, isPlaceholderData } = useQuery(clientsQueryOptions(page, limit));
  const createMut = useCreateClient();
  const deleteMut = useDeleteClient();
  const activateMut = useActivateClient();
  const deactivateMut = useDeactivateClient();
  const createUserMut = useCreateClientUser();

  const clients = clientsRes?.success ? clientsRes.data : [];
  const pagination = clientsRes?.success ? clientsRes.pagination : undefined;
  const totalPages = pagination?.total_pages ?? 1;
  const total = pagination?.total ?? clients.length;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', category: '' });
  const [deleting, setDeleting] = useState<any>(null);
  const [userDialog, setUserDialog] = useState<{ open: boolean; clientId: string | null }>({
    open: false,
    clientId: null
  });
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '' });
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error('Nama dan slug wajib diisi');
      return;
    }
    const res = await createMut.mutateAsync({
      name: form.name,
      slug: form.slug,
      category: form.category || undefined
    });
    if (res.success) {
      toast.success('Tenant dibuat');
      setDialogOpen(false);
      setForm({ name: '', slug: '', category: '' });
    } else toast.error(res.message);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const res = await deleteMut.mutateAsync(deleting.id);
    if (res.success) toast.success('Tenant dihapus');
    else toast.error(res.message);
    setDeleting(null);
  };

  const toggleStatus = async (client: any) => {
    const res = client.is_active
      ? await deactivateMut.mutateAsync(client.id)
      : await activateMut.mutateAsync(client.id);
    if (res.success) toast.success(client.is_active ? 'Tenant dinonaktifkan' : 'Tenant diaktifkan');
    else toast.error(res.message);
  };

  const openUsers = (client: any) => {
    setSelectedClient(client);
    setUserDialog({ open: true, clientId: client.id });
    setUserForm({ name: '', email: '', password: '' });
  };

  const handleCreateUser = async () => {
    if (!userDialog.clientId || !userForm.name.trim() || !userForm.email.trim()) return;
    if (!userForm.password) {
      toast.error('Password wajib diisi');
      return;
    }
    const res = await createUserMut.mutateAsync({
      clientId: userDialog.clientId,
      name: userForm.name,
      email: userForm.email,
      password: userForm.password
    });
    if (res.success) {
      toast.success('User tenant dibuat');
      setUserForm({ name: '', email: '', password: '' });
    } else toast.error(res.message);
  };

  return (
    <PageContainer pageTitle='Tenants' pageDescription='Kelola semua tenant (klien) platform'>
      <div className='flex justify-end mb-4'>
        <Button
          onClick={() => {
            setForm({ name: '', slug: '', category: '' });
            setDialogOpen(true);
          }}
        >
          <Icons.add className='mr-2 size-4' />
          Tambah Tenant
        </Button>
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='text-right'>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className='text-center text-muted-foreground py-8'>
                  Belum ada tenant
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className='font-medium'>{client.name}</TableCell>
                  <TableCell className='font-mono text-xs'>{client.slug}</TableCell>
                  <TableCell>{client.category || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={client.is_active ? 'secondary' : 'outline'}>
                      {client.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-1'>
                      <Button variant='ghost' size='icon' onClick={() => openUsers(client)}>
                        <Icons.user className='size-4' />
                      </Button>
                      <Button variant='ghost' size='icon' onClick={() => toggleStatus(client)}>
                        {client.is_active ? (
                          <Icons.eyeOff className='size-4' />
                        ) : (
                          <Icons.eye className='size-4' />
                        )}
                      </Button>
                      <Button variant='ghost' size='icon' onClick={() => setDeleting(client)}>
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
        label='tenant'
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
        nextDisabled={isPlaceholderData}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Tenant</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-2'>
            <div className='flex flex-col gap-2'>
              <label htmlFor='tenant-name' className='text-sm font-medium'>
                Nama
              </label>
              <Input
                id='tenant-name'
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder='Nama tenant'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <label htmlFor='tenant-slug' className='text-sm font-medium'>
                Slug
              </label>
              <Input
                id='tenant-slug'
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                placeholder='nama-tenant'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <label htmlFor='tenant-category' className='text-sm font-medium'>
                Kategori
              </label>
              <Input
                id='tenant-category'
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                placeholder='Opsional'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave}>Buat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={userDialog.open}
        onOpenChange={(o) => setUserDialog({ open: o, clientId: o ? userDialog.clientId : null })}
      >
        <DialogContent className='max-w-xl'>
          <DialogHeader>
            <DialogTitle>Users - {selectedClient?.name}</DialogTitle>
          </DialogHeader>
          <ClientUsersList clientId={userDialog.clientId || ''} />
          <div className='border-t pt-4 mt-4'>
            <h4 className='text-sm font-semibold mb-3'>Tambah User</h4>
            <div className='flex flex-col gap-3'>
              <Input
                placeholder='Nama'
                value={userForm.name}
                onChange={(e) => setUserForm((p) => ({ ...p, name: e.target.value }))}
              />
              <Input
                placeholder='Email'
                type='email'
                value={userForm.email}
                onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))}
              />
              <Input
                placeholder='Password'
                type='password'
                value={userForm.password}
                onChange={(e) => setUserForm((p) => ({ ...p, password: e.target.value }))}
              />
              <Button onClick={handleCreateUser}>Tambah User</Button>
            </div>
          </div>
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
            <AlertDialogTitle>Hapus Tenant</AlertDialogTitle>
            <AlertDialogDescription>
              Yakin ingin menghapus tenant &quot;{deleting?.name}&quot;? Semua data terkait akan
              ikut terhapus.
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
    </PageContainer>
  );
}

function ClientUsersList({ clientId }: { clientId: string }) {
  const { data: usersRes } = useQuery(clientUsersQueryOptions(clientId));
  const users = usersRes?.success ? usersRes.data : [];
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className='text-center text-muted-foreground'>
              Belum ada user
            </TableCell>
          </TableRow>
        ) : (
          users.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>
                <Badge variant={u.is_active ? 'secondary' : 'outline'}>
                  {u.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
