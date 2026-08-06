import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Icons } from '@/components/icons';
import { bulkKickMembersMutation, bulkExtendMembersMutation } from '../api/mutations';
import type { Member } from '../api/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface BulkActionBarProps {
  selectedIds: string[];
  selectedMembers: Member[];
  onClearSelection: () => void;
}

function getActiveSubscriptions(member: Member) {
  return (member.subscriptions ?? []).filter((subscription) => subscription.status === 'active');
}

export function BulkActionBar({
  selectedIds,
  selectedMembers,
  onClearSelection
}: BulkActionBarProps) {
  const [isKickModalOpen, setIsKickModalOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [kickMode, setKickMode] = useState<'all' | 'single'>('all');
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [extendDays, setExtendDays] = useState('');

  const bulkKickMut = useMutation(bulkKickMembersMutation);
  const bulkExtendMut = useMutation(bulkExtendMembersMutation);

  const packageOptions = useMemo(() => {
    const packages = new Map<string, { id: string; name: string; memberCount: number }>();

    for (const member of selectedMembers) {
      const seenPackageIds = new Set<string>();

      for (const subscription of getActiveSubscriptions(member)) {
        if (seenPackageIds.has(subscription.package_id)) continue;

        const current = packages.get(subscription.package_id);
        packages.set(subscription.package_id, {
          id: subscription.package_id,
          name: subscription.package_name,
          memberCount: (current?.memberCount ?? 0) + 1
        });
        seenPackageIds.add(subscription.package_id);
      }
    }

    return Array.from(packages.values()).toSorted((a, b) => a.name.localeCompare(b.name));
  }, [selectedMembers]);

  const handleBulkKick = async () => {
    const targets =
      kickMode === 'all'
        ? selectedMembers.map((member) => ({ id: member.id }))
        : selectedMembers.flatMap((member) => {
            const subscription = getActiveSubscriptions(member).find(
              (item) => item.package_id === selectedPackageId
            );

            return subscription ? [{ id: member.id, subscriptionId: subscription.id }] : [];
          });

    const skippedCount = kickMode === 'all' ? 0 : selectedMembers.length - targets.length;

    if (kickMode === 'single' && !selectedPackageId) return;
    if (targets.length === 0) {
      toast.error('Tidak ada member yang punya package aktif tersebut.');
      return;
    }

    try {
      const res = await bulkKickMut.mutateAsync(targets);
      if (res.success) {
        const summary =
          skippedCount > 0 ? `${res.message}. ${skippedCount} member dilewati.` : res.message;

        toast.success(summary);
        onClearSelection();
        setIsKickModalOpen(false);
        setKickMode('all');
        setSelectedPackageId('');
      } else {
        toast.error(res.message || 'Gagal mengeluarkan member');
      }
    } catch {
      toast.error('Gagal mengeluarkan member');
    }
  };

  const handleBulkExtend = async () => {
    const days = Number(extendDays);
    if (!days || days <= 0) return;

    const targets = selectedMembers.flatMap((member) =>
      getActiveSubscriptions(member).map((subscription) => ({
        id: member.id,
        subscriptionId: subscription.id,
        additionalDays: days
      }))
    );

    if (targets.length === 0) {
      toast.error('Tidak ada langganan aktif dari member yang dipilih.');
      return;
    }

    try {
      const res = await bulkExtendMut.mutateAsync(targets);
      if (res.success) {
        toast.success(res.message);
        onClearSelection();
        setIsExtendModalOpen(false);
        setExtendDays('');
      } else {
        toast.error(res.message || 'Gagal memperpanjang langganan');
      }
    } catch {
      toast.error('Gagal memperpanjang langganan');
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <div className='flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5'>
      <span className='text-sm font-medium text-primary'>{selectedIds.length} member dipilih</span>
      <div className='flex gap-2'>
        <Button
          variant='outline'
          size='sm'
          className='rounded-full'
          onClick={() => setIsExtendModalOpen(true)}
        >
          <Icons.calendar /> Perpanjang
        </Button>

        <Button
          variant='outline'
          size='sm'
          className='rounded-full hover:bg-destructive hover:text-destructive-foreground'
          onClick={() => setIsKickModalOpen(true)}
        >
          <Icons.trash /> Keluarkan Member
        </Button>

        <Button variant='outline' size='sm' className='rounded-full' onClick={onClearSelection}>
          Batal Pilih
        </Button>
      </div>

      <Dialog
        open={isKickModalOpen}
        onOpenChange={(open) => {
          setIsKickModalOpen(open);
          if (!open) {
            setKickMode('all');
            setSelectedPackageId('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keluarkan Member Terpilih</DialogTitle>
            <DialogDescription>
              Pilih apakah {selectedIds.length} member terpilih akan dikeluarkan dari semua package
              atau hanya dari satu package tertentu.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='space-y-3'>
              <Label>Mode Pengeluaran</Label>
              <RadioGroup
                value={kickMode}
                onValueChange={(value) => setKickMode(value as 'all' | 'single')}
                className='gap-3'
              >
                <Label
                  htmlFor='bulk-kick-all'
                  className={cn(
                    'border-border flex cursor-pointer items-start gap-3 rounded-lg border p-3',
                    kickMode === 'all' && 'border-primary bg-primary/5'
                  )}
                >
                  <RadioGroupItem value='all' id='bulk-kick-all' className='mt-0.5' />
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>Keluarkan dari semua paket</p>
                    <p className='text-xs text-muted-foreground'>
                      Semua member terpilih akan di-kick dari seluruh akses aktifnya.
                    </p>
                  </div>
                </Label>
                <Label
                  htmlFor='bulk-kick-single'
                  className={cn(
                    'border-border flex cursor-pointer items-start gap-3 rounded-lg border p-3',
                    kickMode === 'single' && 'border-primary bg-primary/5'
                  )}
                >
                  <RadioGroupItem value='single' id='bulk-kick-single' className='mt-0.5' />
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>Keluarkan dari paket tertentu</p>
                    <p className='text-xs text-muted-foreground'>
                      Hanya member yang punya package aktif ini yang akan diproses.
                    </p>
                  </div>
                </Label>
              </RadioGroup>
            </div>

            {kickMode === 'single' && (
              <div className='space-y-2'>
                <Label htmlFor='bulk-kick-package'>Paket</Label>
                <Select
                  value={selectedPackageId}
                  onValueChange={setSelectedPackageId}
                  disabled={packageOptions.length === 0}
                >
                  <SelectTrigger id='bulk-kick-package' className='w-full'>
                    <SelectValue placeholder='Pilih paket aktif' />
                  </SelectTrigger>
                  <SelectContent>
                    {packageOptions.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.name} ({pkg.memberCount} member)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPackageId && (
                  <p className='text-sm text-muted-foreground'>
                    Member yang tidak punya paket ini akan otomatis dilewati.
                  </p>
                )}
                {packageOptions.length === 0 && (
                  <p className='text-sm text-muted-foreground'>
                    Tidak ada paket aktif dari member yang sedang dipilih.
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setIsKickModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant='destructive'
              isLoading={bulkKickMut.isPending}
              disabled={kickMode === 'single' && !selectedPackageId}
              onClick={handleBulkKick}
            >
              Keluarkan Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isExtendModalOpen}
        onOpenChange={(open) => {
          setIsExtendModalOpen(open);
          if (!open) setExtendDays('');
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Perpanjang Langganan</DialogTitle>
            <DialogDescription>
              Perpanjang semua langganan aktif dari {selectedIds.length} member terpilih. Total{' '}
              {selectedMembers.reduce((sum, m) => sum + getActiveSubscriptions(m).length, 0)}{' '}
              langganan akan diperpanjang.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-2 py-4'>
            <Label htmlFor='bulk-extend-days'>Tambahan Hari</Label>
            <Input
              id='bulk-extend-days'
              type='number'
              min='1'
              placeholder='30'
              value={extendDays}
              onChange={(e) => setExtendDays(e.target.value)}
            />
            <p className='text-xs text-muted-foreground'>
              Jumlah hari yang akan ditambahkan ke setiap langganan aktif.
            </p>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setIsExtendModalOpen(false)}>
              Batal
            </Button>
            <Button
              isLoading={bulkExtendMut.isPending}
              disabled={!extendDays || Number(extendDays) <= 0}
              onClick={handleBulkExtend}
            >
              Perpanjang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
