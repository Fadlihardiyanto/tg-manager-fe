'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Icons } from '@/components/icons';
import {
  kickMemberMutation,
  extendAccessMutation,
  manualSyncMutation,
  resendLinkMutation
} from '../../api/mutations';
import { memberDetailQueryOptions } from '../../api/queries';
import type { Member, Subscription } from '../../api/types';
import { cn } from '@/lib/utils';

interface CellActionProps {
  data: Member;
}

function getSubscriptionReferenceDate(subscription: Subscription) {
  return subscription.status === 'cancelled'
    ? (subscription.kicked_at ?? subscription.expired_at)
    : subscription.expired_at;
}

function getSubscriptionSortTime(subscription: Subscription) {
  const referenceDate = getSubscriptionReferenceDate(subscription) ?? subscription.activated_at;

  const timestamp = referenceDate ? new Date(referenceDate).getTime() : 0;

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [_, setMemberId] = useQueryState('memberId');

  const [isKickOpen, setIsKickOpen] = useState(false);
  const [isResendOpen, setIsResendOpen] = useState(false);
  const [isExtendOpen, setIsExtendOpen] = useState(false);
  const [kickMode, setKickMode] = useState<'all' | 'single'>('all');
  const [kickSubscriptionId, setKickSubscriptionId] = useState('');
  const [resendMode, setResendMode] = useState<'all' | 'single'>('all');
  const [resendSubscriptionId, setResendSubscriptionId] = useState('');
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState('');
  const [additionalDays, setAdditionalDays] = useState('');
  const [isSyncConfirmOpen, setIsSyncConfirmOpen] = useState(false);

  const kickMut = useMutation(kickMemberMutation);
  const extendMut = useMutation(extendAccessMutation);
  const syncMut = useMutation(manualSyncMutation);
  const resendMut = useMutation(resendLinkMutation);
  const { data: memberDetail, isLoading: isMemberDetailLoading } = useQuery({
    ...memberDetailQueryOptions(data.id),
    enabled: isExtendOpen || isKickOpen || isResendOpen
  });

  const subscriptions = useMemo(
    () => (memberDetail?.success ? memberDetail.data.subscriptions : []),
    [memberDetail]
  );
  const kickableSubscriptions = useMemo(
    () => subscriptions.filter((subscription) => subscription.status === 'active'),
    [subscriptions]
  );
  const extendableSubscriptions = useMemo(() => {
    const latestByPackage = new Map<string, Subscription>();

    for (const subscription of subscriptions) {
      const current = latestByPackage.get(subscription.package_id);

      if (!current || getSubscriptionSortTime(subscription) > getSubscriptionSortTime(current)) {
        latestByPackage.set(subscription.package_id, subscription);
      }
    }

    return Array.from(latestByPackage.values()).toSorted(
      (a, b) => getSubscriptionSortTime(b) - getSubscriptionSortTime(a)
    );
  }, [subscriptions]);
  const selectedSubscription = useMemo(
    () =>
      extendableSubscriptions.find((subscription) => subscription.id === selectedSubscriptionId),
    [extendableSubscriptions, selectedSubscriptionId]
  );
  const parsedAdditionalDays = Number.parseInt(additionalDays, 10);
  const isAdditionalDaysValid = Number.isInteger(parsedAdditionalDays) && parsedAdditionalDays > 0;

  const handleKick = async () => {
    if (kickMode === 'single' && !kickSubscriptionId) return;

    try {
      const res = await kickMut.mutateAsync({
        id: data.id,
        subscriptionId: kickMode === 'single' ? kickSubscriptionId : undefined
      });
      if (res.success) {
        toast.success(res.message);
        setIsKickOpen(false);
        setKickMode('all');
        setKickSubscriptionId('');
        return;
      }
      toast.error(res.errors?.[0] || res.message);
    } catch {
      toast.error('Gagal mengeluarkan member');
    }
  };

  const handleResend = async () => {
    if (resendMode === 'single' && !resendSubscriptionId) return;

    try {
      const res = await resendMut.mutateAsync({
        id: data.id,
        subscriptionId: resendMode === 'single' ? resendSubscriptionId : undefined
      });
      if (res.success) {
        toast.success(res.message);
        setIsResendOpen(false);
        setResendMode('all');
        setResendSubscriptionId('');
        return;
      }
      toast.error(res.errors?.[0] || res.message);
    } catch {
      toast.error('Gagal mengirim ulang tautan');
    }
  };

  const handleExtendConfirm = async () => {
    if (!selectedSubscriptionId || !isAdditionalDaysValid) return;

    try {
      const res = await extendMut.mutateAsync({
        id: data.id,
        payload: {
          subscription_id: selectedSubscriptionId,
          additional_days: parsedAdditionalDays
        }
      });
      if (res.success) {
        toast.success(res.message);
        setIsExtendOpen(false);
        setSelectedSubscriptionId('');
        setAdditionalDays('');
        return;
      }
      toast.error(res.errors?.[0] || res.message);
    } catch {
      toast.error('Gagal memperpanjang akses');
    }
  };

  return (
    <>
      <Dialog
        open={isKickOpen}
        onOpenChange={(open) => {
          setIsKickOpen(open);
          if (!open) {
            setKickMode('all');
            setKickSubscriptionId('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keluarkan Member</DialogTitle>
            <DialogDescription>
              Pilih apakah {data.first_name} {data.last_name} akan dikeluarkan dari semua package
              atau hanya salah satu package aktif.
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
                  htmlFor={`kick-all-${data.id}`}
                  className={cn(
                    'border-border flex cursor-pointer items-start gap-3 rounded-lg border p-3',
                    kickMode === 'all' && 'border-primary bg-primary/5'
                  )}
                >
                  <RadioGroupItem value='all' id={`kick-all-${data.id}`} className='mt-0.5' />
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>Keluarkan dari semua paket</p>
                    <p className='text-xs text-muted-foreground'>
                      Member akan dikeluarkan dari seluruh akses yang aktif.
                    </p>
                  </div>
                </Label>
                <Label
                  htmlFor={`kick-single-${data.id}`}
                  className={cn(
                    'border-border flex cursor-pointer items-start gap-3 rounded-lg border p-3',
                    kickMode === 'single' && 'border-primary bg-primary/5'
                  )}
                >
                  <RadioGroupItem value='single' id={`kick-single-${data.id}`} className='mt-0.5' />
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>Keluarkan dari satu paket</p>
                    <p className='text-xs text-muted-foreground'>
                      Pilih satu package aktif yang ingin dihentikan aksesnya.
                    </p>
                  </div>
                </Label>
              </RadioGroup>
            </div>

            {kickMode === 'single' && (
              <div className='space-y-2'>
                <Label htmlFor={`kick-subscription-${data.id}`}>Paket</Label>
                <Select
                  value={kickSubscriptionId}
                  onValueChange={setKickSubscriptionId}
                  disabled={isMemberDetailLoading || kickableSubscriptions.length === 0}
                >
                  <SelectTrigger id={`kick-subscription-${data.id}`} className='w-full'>
                    <SelectValue
                      placeholder={isMemberDetailLoading ? 'Memuat paket...' : 'Pilih paket aktif'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {kickableSubscriptions.map((subscription: Subscription) => (
                      <SelectItem key={subscription.id} value={subscription.id}>
                        {subscription.package_name} |{' '}
                        {getSubscriptionReferenceDate(subscription)
                          ? format(
                              new Date(getSubscriptionReferenceDate(subscription) as string),
                              'dd MMM yyyy'
                            )
                          : '-'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isMemberDetailLoading && kickableSubscriptions.length === 0 && (
                  <p className='text-sm text-muted-foreground'>
                    Member ini tidak punya paket aktif yang bisa dikeluarkan satuan.
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setIsKickOpen(false)}>
              Batal
            </Button>
            <Button
              variant='destructive'
              isLoading={kickMut.isPending}
              disabled={kickMode === 'single' && !kickSubscriptionId}
              onClick={handleKick}
            >
              Keluarkan Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isResendOpen}
        onOpenChange={(open) => {
          setIsResendOpen(open);
          if (!open) {
            setResendMode('all');
            setResendSubscriptionId('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kirim Ulang Tautan</DialogTitle>
            <DialogDescription>
              Pilih apakah link undangan untuk {data.first_name} {data.last_name} akan dikirim ulang
              ke semua package aktif atau hanya satu package aktif.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='space-y-3'>
              <Label>Mode Pengiriman Ulang</Label>
              <RadioGroup
                value={resendMode}
                onValueChange={(value) => setResendMode(value as 'all' | 'single')}
                className='gap-3'
              >
                <Label
                  htmlFor={`resend-all-${data.id}`}
                  className={cn(
                    'border-border flex cursor-pointer items-start gap-3 rounded-lg border p-3',
                    resendMode === 'all' && 'border-primary bg-primary/5'
                  )}
                >
                  <RadioGroupItem value='all' id={`resend-all-${data.id}`} className='mt-0.5' />
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>Kirim ke semua paket</p>
                    <p className='text-xs text-muted-foreground'>
                      Semua link undangan aktif untuk member ini akan dikirim ulang.
                    </p>
                  </div>
                </Label>
                <Label
                  htmlFor={`resend-single-${data.id}`}
                  className={cn(
                    'border-border flex cursor-pointer items-start gap-3 rounded-lg border p-3',
                    resendMode === 'single' && 'border-primary bg-primary/5'
                  )}
                >
                  <RadioGroupItem
                    value='single'
                    id={`resend-single-${data.id}`}
                    className='mt-0.5'
                  />
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>Kirim ke satu paket</p>
                    <p className='text-xs text-muted-foreground'>
                      Pilih satu package aktif yang ingin dikirim ulang link undangannya.
                    </p>
                  </div>
                </Label>
              </RadioGroup>
            </div>

            {resendMode === 'single' && (
              <div className='space-y-2'>
                <Label htmlFor={`resend-subscription-${data.id}`}>Paket</Label>
                <Select
                  value={resendSubscriptionId}
                  onValueChange={setResendSubscriptionId}
                  disabled={isMemberDetailLoading || kickableSubscriptions.length === 0}
                >
                  <SelectTrigger id={`resend-subscription-${data.id}`} className='w-full'>
                    <SelectValue
                      placeholder={isMemberDetailLoading ? 'Memuat paket...' : 'Pilih paket aktif'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {kickableSubscriptions.map((subscription: Subscription) => (
                      <SelectItem key={subscription.id} value={subscription.id}>
                        {subscription.package_name} |{' '}
                        {getSubscriptionReferenceDate(subscription)
                          ? format(
                              new Date(getSubscriptionReferenceDate(subscription) as string),
                              'dd MMM yyyy'
                            )
                          : '-'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isMemberDetailLoading && kickableSubscriptions.length === 0 && (
                  <p className='text-sm text-muted-foreground'>
                    Member ini tidak punya paket aktif yang bisa dikirimi ulang tautan.
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setIsResendOpen(false)}>
              Batal
            </Button>
            <Button
              isLoading={resendMut.isPending}
              disabled={resendMode === 'single' && !resendSubscriptionId}
              onClick={handleResend}
            >
              Kirim Ulang Tautan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isExtendOpen}
        onOpenChange={(open) => {
          setIsExtendOpen(open);
          if (!open) {
            setSelectedSubscriptionId('');
            setAdditionalDays('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Perpanjang Akses</DialogTitle>
            <DialogDescription>
              Pilih subscription yang mau diperpanjang untuk {data.first_name} {data.last_name},
              lalu isi tambahan durasi dalam hari.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor={`extend-subscription-${data.id}`}>Langganan</Label>
              <Select
                value={selectedSubscriptionId}
                onValueChange={setSelectedSubscriptionId}
                disabled={isMemberDetailLoading || extendableSubscriptions.length === 0}
              >
                <SelectTrigger id={`extend-subscription-${data.id}`} className='w-full'>
                  <SelectValue
                    placeholder={isMemberDetailLoading ? 'Memuat langganan...' : 'Pilih langganan'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {extendableSubscriptions.map((subscription: Subscription) => (
                    <SelectItem key={subscription.id} value={subscription.id}>
                      {subscription.package_name} |{' '}
                      {getSubscriptionReferenceDate(subscription)
                        ? format(
                            new Date(getSubscriptionReferenceDate(subscription) as string),
                            'dd MMM yyyy'
                          )
                        : '-'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor={`extend-days-${data.id}`}>Hari Tambahan</Label>
              <Input
                id={`extend-days-${data.id}`}
                type='number'
                min={1}
                inputMode='numeric'
                placeholder='30'
                value={additionalDays}
                onChange={(event) => setAdditionalDays(event.target.value)}
              />
              <div className='flex gap-2 mt-2'>
                {[7, 30, 90].map((d) => (
                  <Button
                    key={d}
                    variant='outline'
                    size='sm'
                    className='h-7 px-2 text-xs'
                    onClick={() => setAdditionalDays(String(d))}
                  >
                    +{d} hari
                  </Button>
                ))}
              </div>
            </div>

            {selectedSubscription && (
              <p className='text-sm text-muted-foreground'>
                {selectedSubscription.status === 'cancelled'
                  ? 'Dikeluarkan pada'
                  : 'Kedaluwarsa pada'}
                :{' '}
                {format(
                  new Date(getSubscriptionReferenceDate(selectedSubscription) as string),
                  'PP'
                )}
              </p>
            )}

            {!isMemberDetailLoading && extendableSubscriptions.length === 0 && (
              <p className='text-sm text-muted-foreground'>
                Member ini belum punya subscription yang bisa diperpanjang.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setIsExtendOpen(false)}>
              Batal
            </Button>
            <Button
              isLoading={extendMut.isPending}
              disabled={!selectedSubscriptionId || !isAdditionalDaysValid}
              onClick={handleExtendConfirm}
            >
              Konfirmasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isSyncConfirmOpen} onOpenChange={setIsSyncConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sinkron Manual?</AlertDialogTitle>
            <AlertDialogDescription>
              Sinkron manual akan memperbarui data langganan member ini dari Telegram. Gunakan jika
              status langganan tidak sesuai.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                toast.promise(syncMut.mutateAsync(data.id), {
                  loading: 'Sedang sinkron...',
                  success: (res) => res.message,
                  error: 'Gagal sinkron'
                });
              }}
            >
              Sinkronkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='size-8 p-0'>
            <span className='sr-only'>Buka menu</span>
            <Icons.moreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setTimeout(() => setMemberId(data.id), 150)}>
            <Icons.eye /> Lihat Detail
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTimeout(() => setIsExtendOpen(true), 150)}>
            <Icons.calendar /> Perpanjang Akses
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsSyncConfirmOpen(true)}>
            <Icons.settings /> Sinkron Manual
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTimeout(() => setIsResendOpen(true), 150)}>
            <Icons.send /> Kirim Ulang Tautan
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTimeout(() => setIsKickOpen(true), 150)}
            className='text-destructive focus:text-destructive'
          >
            <Icons.trash /> Keluarkan Member
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
