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
import { Checkbox } from '@/components/ui/checkbox';
import { Icons } from '@/components/icons';
import { bulkKickMembersMutation, bulkExtendMembersMutation } from '../api/mutations';
import type { Member } from '../api/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface BulkActionBarProps {
  selectedIds: string[];
  selectedMembers: Member[];
  onClearSelection: () => void;
}

interface PackageScope {
  packageId: string;
  packageName: string;
  targets: { memberId: string; subscriptionId: string }[];
}

function getActiveSubscriptions(member: Member) {
  return (member.subscriptions ?? []).filter((subscription) => subscription.status === 'active');
}

export function BulkActionBar({
  selectedIds,
  selectedMembers,
  onClearSelection
}: BulkActionBarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([]);
  const [extendDays, setExtendDays] = useState('');

  const bulkKickMut = useMutation(bulkKickMembersMutation);
  const bulkExtendMut = useMutation(bulkExtendMembersMutation);

  const packageScopes = useMemo<PackageScope[]>(() => {
    const scopes = new Map<string, PackageScope>();

    for (const member of selectedMembers) {
      for (const subscription of getActiveSubscriptions(member)) {
        const scope =
          scopes.get(subscription.package_id) ??
          ({
            packageId: subscription.package_id,
            packageName: subscription.package_name,
            targets: []
          } satisfies PackageScope);

        scope.targets.push({
          memberId: member.id,
          subscriptionId: subscription.id
        });
        scopes.set(subscription.package_id, scope);
      }
    }

    return Array.from(scopes.values()).toSorted((a, b) =>
      a.packageName.localeCompare(b.packageName)
    );
  }, [selectedMembers]);

  const totalSubscriptions = packageScopes.reduce((sum, scope) => sum + scope.targets.length, 0);
  const memberWithNoActivePackage = selectedMembers.filter(
    (m) => getActiveSubscriptions(m).length === 0
  ).length;
  const isSelectAll = selectedPackageIds.length === packageScopes.length;

  const togglePackage = (packageId: string) => {
    setSelectedPackageIds((prev) =>
      prev.includes(packageId) ? prev.filter((id) => id !== packageId) : [...prev, packageId]
    );
  };

  const toggleAllPackages = () => {
    if (isSelectAll) {
      setSelectedPackageIds([]);
    } else {
      setSelectedPackageIds(packageScopes.map((scope) => scope.packageId));
    }
  };

  const openModal = () => {
    setSelectedPackageIds(packageScopes.map((scope) => scope.packageId));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPackageIds([]);
    setExtendDays('');
  };

  const buildTargets = () =>
    packageScopes
      .filter((scope) => selectedPackageIds.includes(scope.packageId))
      .flatMap((scope) => scope.targets);

  const handleBulkKick = async () => {
    const targets = buildTargets().map((t) => ({
      id: t.memberId,
      subscriptionId: t.subscriptionId
    }));

    if (targets.length === 0) {
      toast.error('Pilih minimal satu paket terlebih dahulu.');
      return;
    }

    try {
      const res = await bulkKickMut.mutateAsync(targets);
      if (res.success) {
        toast.success(
          memberWithNoActivePackage > 0
            ? `${targets.length} langganan dikeluarkan. ${memberWithNoActivePackage} member tanpa paket aktif dilewati.`
            : res.message || `${targets.length} langganan dikeluarkan`
        );
        onClearSelection();
        closeModal();
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

    const targets = buildTargets().map((t) => ({
      id: t.memberId,
      subscriptionId: t.subscriptionId,
      additionalDays: days
    }));

    if (targets.length === 0) {
      toast.error('Pilih minimal satu paket terlebih dahulu.');
      return;
    }

    try {
      const res = await bulkExtendMut.mutateAsync(targets);
      if (res.success) {
        toast.success(
          memberWithNoActivePackage > 0
            ? `${targets.length} langganan diperpanjang. ${memberWithNoActivePackage} member tanpa paket aktif dilewati.`
            : res.message || `${targets.length} langganan diperpanjang`
        );
        onClearSelection();
        closeModal();
      } else {
        toast.error(res.message || 'Gagal memperpanjang langganan');
      }
    } catch {
      toast.error('Gagal memperpanjang langganan');
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <div className='flex items-center gap-3'>
      <span className='text-sm font-medium text-primary'>{selectedIds.length} member dipilih</span>
      <div className='flex gap-2'>
        <Button variant='outline' size='sm' className='rounded-full' onClick={onClearSelection}>
          Batal Pilih
        </Button>

        <Button variant='default' size='sm' className='rounded-full' onClick={openModal}>
          <Icons.calendar /> Perpanjang
        </Button>

        <Button variant='destructive' size='sm' className='rounded-full' onClick={openModal}>
          <Icons.trash /> Keluarkan Member
        </Button>
      </div>

      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keluarkan / Perpanjang Member</DialogTitle>
            <DialogDescription>
              {selectedIds.length} member terpilih · {totalSubscriptions} langganan aktif. Pilih
              paket yang ingin diproses.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <Label>Paket yang dimiliki member terpilih</Label>
                <button
                  type='button'
                  className='text-sm font-medium text-primary hover:underline'
                  onClick={toggleAllPackages}
                >
                  {isSelectAll ? 'Kosongkan' : 'Pilih semua'}
                </button>
              </div>

              {packageScopes.length === 0 ? (
                <p className='text-sm text-muted-foreground'>
                  Tidak ada paket aktif dari member yang sedang dipilih.
                </p>
              ) : (
                <div className='space-y-2'>
                  {packageScopes.map((scope) => {
                    const isChecked = selectedPackageIds.includes(scope.packageId);
                    return (
                      <div
                        key={scope.packageId}
                        role='checkbox'
                        aria-checked={isChecked}
                        aria-label={scope.packageName}
                        tabIndex={0}
                        className={cn(
                          'flex cursor-pointer items-center gap-3 rounded-lg border p-3',
                          isChecked && 'border-primary bg-primary/5'
                        )}
                        onClick={() => togglePackage(scope.packageId)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            togglePackage(scope.packageId);
                          }
                        }}
                      >
                        <Checkbox
                          checked={isChecked}
                          tabIndex={-1}
                          aria-hidden
                          className='pointer-events-none'
                        />
                        <div className='flex-1'>
                          <p className='text-sm font-medium'>{scope.packageName}</p>
                          <p className='text-xs text-muted-foreground'>
                            {scope.targets.length} langganan
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {memberWithNoActivePackage > 0 && (
                <p className='text-xs text-muted-foreground'>
                  {memberWithNoActivePackage} member tanpa paket aktif akan dilewati.
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='bulk-extend-days'>Tambahan Hari (untuk Perpanjang)</Label>
              <Input
                id='bulk-extend-days'
                type='number'
                min='1'
                placeholder='30'
                value={extendDays}
                onChange={(e) => setExtendDays(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={closeModal}>
              Batal
            </Button>
            <Button
              variant='destructive'
              isLoading={bulkKickMut.isPending}
              disabled={selectedPackageIds.length === 0}
              onClick={handleBulkKick}
            >
              Keluarkan
            </Button>
            <Button
              isLoading={bulkExtendMut.isPending}
              disabled={selectedPackageIds.length === 0 || !extendDays || Number(extendDays) <= 0}
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
