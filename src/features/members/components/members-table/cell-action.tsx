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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface CellActionProps {
  data: Member;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [_, setMemberId] = useQueryState('memberId');

  const [isKickOpen, setIsKickOpen] = useState(false);
  const [isExtendOpen, setIsExtendOpen] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState('');
  const [additionalDays, setAdditionalDays] = useState('');

  const kickMut = useMutation(kickMemberMutation);
  const extendMut = useMutation(extendAccessMutation);
  const syncMut = useMutation(manualSyncMutation);
  const resendMut = useMutation(resendLinkMutation);
  const { data: memberDetail, isLoading: isMemberDetailLoading } = useQuery({
    ...memberDetailQueryOptions(data.id),
    enabled: isExtendOpen
  });

  const subscriptions = useMemo(
    () => (memberDetail?.success ? memberDetail.data.subscriptions : []),
    [memberDetail]
  );
  const selectedSubscription = useMemo(
    () => subscriptions.find((subscription) => subscription.id === selectedSubscriptionId),
    [selectedSubscriptionId, subscriptions]
  );
  const parsedAdditionalDays = Number.parseInt(additionalDays, 10);
  const isAdditionalDaysValid = Number.isInteger(parsedAdditionalDays) && parsedAdditionalDays > 0;

  const handleKick = async () => {
    try {
      const res = await kickMut.mutateAsync(data.id);
      if (res.success) {
        toast.success(res.message);
        setIsKickOpen(false);
        return;
      }
      toast.error(res.message);
    } catch {
      toast.error('Failed to kick member');
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
      toast.error('Failed to extend access');
    }
  };

  return (
    <>
      <AlertDialog open={isKickOpen} onOpenChange={setIsKickOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will kick {data.first_name} {data.last_name} from the community. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleKick();
              }}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {kickMut.isPending ? 'Kicking...' : 'Kick Member'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            <DialogTitle>Extend Access</DialogTitle>
            <DialogDescription>
              Pilih subscription yang mau diperpanjang untuk {data.first_name} {data.last_name},
              lalu isi tambahan durasi dalam hari.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor={`extend-subscription-${data.id}`}>Subscription</Label>
              <Select
                value={selectedSubscriptionId}
                onValueChange={setSelectedSubscriptionId}
                disabled={isMemberDetailLoading || subscriptions.length === 0}
              >
                <SelectTrigger id={`extend-subscription-${data.id}`} className='w-full'>
                  <SelectValue
                    placeholder={
                      isMemberDetailLoading ? 'Loading subscriptions...' : 'Pilih subscription'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {subscriptions.map((subscription: Subscription) => (
                    <SelectItem key={subscription.id} value={subscription.id}>
                      {subscription.package_name} |{' '}
                      {subscription.expired_at
                        ? format(new Date(subscription.expired_at), 'dd MMM yyyy')
                        : '-'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor={`extend-days-${data.id}`}>Additional Days</Label>
              <Input
                id={`extend-days-${data.id}`}
                type='number'
                min={1}
                inputMode='numeric'
                placeholder='30'
                value={additionalDays}
                onChange={(event) => setAdditionalDays(event.target.value)}
              />
            </div>

            {selectedSubscription && (
              <p className='text-sm text-muted-foreground'>
                Current expiry: {format(new Date(selectedSubscription.expired_at), 'PP')}
              </p>
            )}

            {!isMemberDetailLoading && subscriptions.length === 0 && (
              <p className='text-sm text-muted-foreground'>
                Member ini belum punya subscription yang bisa diperpanjang.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setIsExtendOpen(false)}>
              Cancel
            </Button>
            <Button
              isLoading={extendMut.isPending}
              disabled={!selectedSubscriptionId || !isAdditionalDaysValid}
              onClick={handleExtendConfirm}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='size-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <Icons.moreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setTimeout(() => setMemberId(data.id), 150)}>
            <Icons.eye /> View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTimeout(() => setIsExtendOpen(true), 150)}>
            <Icons.calendar /> Extend Access
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              toast.promise(syncMut.mutateAsync(data.id), {
                loading: 'Syncing...',
                success: (res) => res.message,
                error: 'Failed to sync'
              });
            }}
          >
            <Icons.settings /> Manual Sync
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              toast.promise(resendMut.mutateAsync(data.id), {
                loading: 'Resending...',
                success: (res) => res.message,
                error: 'Failed to resend'
              });
            }}
          >
            <Icons.send /> Resend Link
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTimeout(() => setIsKickOpen(true), 150)}
            className='text-destructive focus:text-destructive'
          >
            <Icons.trash /> Kick Member
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
