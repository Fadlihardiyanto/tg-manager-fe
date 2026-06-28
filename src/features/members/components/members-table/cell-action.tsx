'use client';

import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
import { Icons } from '@/components/icons';
import {
  kickMemberMutation,
  extendAccessMutation,
  manualSyncMutation,
  resendLinkMutation
} from '../../api/mutations';
import type { Member } from '../../api/types';

interface CellActionProps {
  data: Member;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [_, setMemberId] = useQueryState('memberId');

  const [isKickOpen, setIsKickOpen] = useState(false);
  const [isExtendOpen, setIsExtendOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const kickMut = useMutation(kickMemberMutation);
  const extendMut = useMutation(extendAccessMutation);
  const syncMut = useMutation(manualSyncMutation);
  const resendMut = useMutation(resendLinkMutation);

  const minDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (data.global_status && data.nearest_expiry) {
      const expiry = new Date(data.nearest_expiry);
      expiry.setHours(0, 0, 0, 0);
      return expiry > today ? expiry : today;
    }

    return today;
  }, [data.global_status, data.nearest_expiry]);

  const defaultMonth = useMemo(() => {
    if (data.nearest_expiry) {
      return new Date(data.nearest_expiry);
    }
    return new Date();
  }, [data.nearest_expiry]);

  const handleKick = async () => {
    try {
      const res = await kickMut.mutateAsync(data.id);
      if (res.success) {
        toast.success(res.message);
        setIsKickOpen(false);
      }
    } catch {
      toast.error('Failed to kick member');
    }
  };

  const handleExtendConfirm = async () => {
    if (!selectedDate) return;

    try {
      const res = await extendMut.mutateAsync({
        id: data.id,
        newExpiryAt: format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
      });
      if (res.success) {
        toast.success(res.message);
        setIsExtendOpen(false);
        setSelectedDate(undefined);
      }
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
            setSelectedDate(undefined);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Access</DialogTitle>
            <DialogDescription>
              Select the new expiry date for {data.first_name} {data.last_name}.
              {data.global_status && data.nearest_expiry && (
                <> Current expiry: {format(new Date(data.nearest_expiry), 'PP')}.</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className='flex justify-center py-4'>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant='outline' className='w-[280px] justify-start text-left font-normal'>
                  <Icons.calendar className='mr-2 size-4' />
                  {selectedDate ? (
                    format(selectedDate, 'PP')
                  ) : (
                    <span className='text-muted-foreground'>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start' side='bottom' sideOffset={4}>
                <Calendar
                  mode='single'
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setIsDatePickerOpen(false);
                  }}
                  disabled={{ before: minDate }}
                  defaultMonth={defaultMonth}
                  fixedWeeks
                />
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setIsExtendOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!selectedDate || extendMut.isPending} onClick={handleExtendConfirm}>
              {extendMut.isPending && <Icons.spinner className='mr-2 size-4 animate-spin' />}
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
