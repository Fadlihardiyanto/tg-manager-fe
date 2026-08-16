'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import {
  rolesQueryOptions,
  permissionsQueryOptions,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useSyncPermissions
} from '../../../../features/superadmin/api/queries';
import type { Role, Permission } from '../../../../features/superadmin/api/types';

export default function RolesPage() {
  const { page, setPage, limit, handleLimitChange, limitOptions } = usePagination();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [permRole, setPermRole] = useState<Role | null>(null);
  const [permSelected, setPermSelected] = useState<string[]>([]);

  const { data: rolesRes, isLoading, isPlaceholderData } = useQuery(rolesQueryOptions(page, limit));
  const { data: permsRes } = useQuery(permissionsQueryOptions());
  const createRoleMut = useCreateRole();
  const updateRoleMut = useUpdateRole();
  const deleteRoleMut = useDeleteRole();
  const syncPermsMut = useSyncPermissions();

  const roles = rolesRes?.success ? rolesRes.data : [];
  const pagination = rolesRes?.success ? rolesRes.pagination : undefined;
  const totalPages = pagination?.total_pages ?? 1;
  const total = pagination?.total ?? roles.length;
  const permissions = permsRes?.success ? permsRes.data : [];
  const permGroups = [...new Set(permissions.map((p) => p.group).filter(Boolean))];

  const openCreate = () => {
    setEditingRole(null);
    setFormName('');
    setFormDesc('');
    setDialogOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setFormName(role.name);
    setFormDesc(role.description || '');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error('Nama role wajib diisi');
      return;
    }
    if (editingRole) {
      const res = await updateRoleMut.mutateAsync({
        id: editingRole.id,
        name: formName,
        description: formDesc || undefined
      });
      if (res.success) {
        toast.success('Role diperbarui');
        setDialogOpen(false);
      } else toast.error(res.message);
    } else {
      const res = await createRoleMut.mutateAsync({
        name: formName,
        description: formDesc || undefined
      });
      if (res.success) {
        toast.success('Role dibuat');
        setDialogOpen(false);
      } else toast.error(res.message);
    }
  };

  const handleDelete = async () => {
    if (!deletingRole) return;
    const res = await deleteRoleMut.mutateAsync(deletingRole.id);
    if (res.success) toast.success('Role dihapus');
    else toast.error(res.message);
    setDeletingRole(null);
  };

  const openPermDialog = (role: Role) => {
    setPermRole(role);
    setPermSelected([]);
  };

  const handleSavePerms = async () => {
    if (!permRole) return;
    const res = await syncPermsMut.mutateAsync({ id: permRole.id, permission_ids: permSelected });
    if (res.success) {
      toast.success('Permissions diperbarui');
      setPermRole(null);
    } else toast.error(res.message);
  };

  return (
    <PageContainer
      pageTitle='Roles & Permissions'
      pageDescription='Kelola role dan hak akses admin platform'
    >
      <div className='flex justify-end mb-4'>
        <Button onClick={openCreate}>
          <Icons.add className='mr-2 size-4' />
          Tambah Role
        </Button>
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='text-right'>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className='text-center text-muted-foreground py-8'>
                  Memuat...
                </TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className='text-center text-muted-foreground py-8'>
                  Belum ada role
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className='font-medium'>{role.name}</TableCell>
                  <TableCell className='text-muted-foreground'>{role.description || '—'}</TableCell>
                  <TableCell>
                    <StatusBadge active={role.is_active} />
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-1'>
                      <Button variant='ghost' size='icon' onClick={() => openEdit(role)}>
                        <Icons.edit className='size-4' />
                      </Button>
                      <Button variant='ghost' size='icon' onClick={() => openPermDialog(role)}>
                        <Icons.shield className='size-4' />
                      </Button>
                      <Button variant='ghost' size='icon' onClick={() => setDeletingRole(role)}>
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
        label='role'
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
        nextDisabled={isPlaceholderData}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRole ? 'Edit Role' : 'Tambah Role'}</DialogTitle>
            <DialogDescription>Atur nama dan deskripsi role admin.</DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-2'>
            <div className='flex flex-col gap-2'>
              <label htmlFor='role-name' className='text-sm font-medium'>
                Nama Role
              </label>
              <Input
                id='role-name'
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder='Superadmin, Support, Finance...'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <label htmlFor='role-desc' className='text-sm font-medium'>
                Deskripsi
              </label>
              <Input
                id='role-desc'
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder='Opsional'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave}>{editingRole ? 'Simpan' : 'Buat'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!permRole}
        onOpenChange={(o) => {
          if (!o) setPermRole(null);
        }}
      >
        <DialogContent className='max-w-xl'>
          <DialogHeader>
            <DialogTitle>Permissions: {permRole?.name}</DialogTitle>
            <DialogDescription>Pilih hak akses untuk role ini.</DialogDescription>
          </DialogHeader>
          <div className='space-y-4 max-h-96 overflow-y-auto'>
            {permGroups.map((group) => (
              <div key={group}>
                <h4 className='text-sm font-semibold capitalize mb-2 text-muted-foreground'>
                  {group.replace(/_/g, ' ')}
                </h4>
                <div className='flex flex-wrap gap-2'>
                  {permissions
                    .filter((p) => p.group === group)
                    .map((p) => (
                      <Badge
                        key={p.id}
                        variant={permSelected.includes(p.id) ? 'default' : 'outline'}
                        className='cursor-pointer'
                        onClick={() =>
                          setPermSelected((prev) =>
                            prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id]
                          )
                        }
                      >
                        {p.name}
                      </Badge>
                    ))}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={handleSavePerms}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingRole}
        onOpenChange={(o) => {
          if (!o) setDeletingRole(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Role</AlertDialogTitle>
            <AlertDialogDescription>
              Yakin ingin menghapus role &quot;{deletingRole?.name}&quot;?
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
