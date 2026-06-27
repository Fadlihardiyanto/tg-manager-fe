import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
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
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Icons } from '@/components/icons';
import {
  bulkKickMembersMutation,
  bulkExtendAccessMutation
} from '../api/mutations';

interface BulkActionBarProps {
  selectedIds: string[];
  onClearSelection: () => void;
}

export function BulkActionBar({
  selectedIds,
  onClearSelection
}: BulkActionBarProps) {
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isKickModalOpen, setIsKickModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const bulkKickMut = useMutation(bulkKickMembersMutation);
  const bulkExtendMut = useMutation(bulkExtendAccessMutation);

  if (selectedIds.length === 0) return null;

  const handleBulkKick = async () => {
    try {
      const res = await bulkKickMut.mutateAsync(selectedIds);
      if (res.success) {
        toast.success(res.message);
        onClearSelection();
        setIsKickModalOpen(false);
      }
    } catch {
      toast.error('Failed to kick members');
    }
  };

  const handleBulkExtendConfirm = async () => {
    if (!selectedDate) return;

    try {
      const res = await bulkExtendMut.mutateAsync({
        ids: selectedIds,
        newExpiryAt: format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
      });
      if (res.success) {
        toast.success(res.message);
        onClearSelection();
        setIsExtendModalOpen(false);
        setSelectedDate(undefined);
      }
    } catch {
      toast.error('Failed to extend access');
    }
  };

  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);

  return (
    <div className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-full border border-border bg-background px-4 py-3 shadow-lg animate-in slide-in-from-bottom-10 fade-in duration-300'>
      <div className='flex items-center gap-2 pr-4 border-r border-border'>
        <div className='flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary'>
          {selectedIds.length}
        </div>
        <span className='text-sm font-medium'>selected</span>
      </div>

      <div className='flex items-center gap-2'>
        <Dialog open={isExtendModalOpen} onOpenChange={(open) => {
          setIsExtendModalOpen(open);
          if (!open) setSelectedDate(undefined);
        }}>
          <Button
            variant='outline'
            size='sm'
            className='h-8'
            onClick={() => setIsExtendModalOpen(true)}
          >
            <Icons.calendar className='mr-1 size-3.5' /> Extend Access...
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Extend Access</DialogTitle>
              <DialogDescription>
                Select a new expiry date for {selectedIds.length} selected
                {selectedIds.length === 1 ? ' member' : ' members'}.
              </DialogDescription>
            </DialogHeader>

            <div className='flex justify-center py-4'>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className='w-[280px] justify-start text-left font-normal'
                  >
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
                    defaultMonth={new Date()}
                    fixedWeeks
                  />
                </PopoverContent>
              </Popover>
            </div>

            <DialogFooter>
              <Button variant='outline' onClick={() => setIsExtendModalOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={!selectedDate || bulkExtendMut.isPending}
                onClick={handleBulkExtendConfirm}
              >
                {bulkExtendMut.isPending && (
                  <Icons.spinner className='mr-2 size-4 animate-spin' />
                )}
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={isKickModalOpen}
          onOpenChange={setIsKickModalOpen}
        >
          <AlertDialogTrigger asChild>
            <Button
              variant='outline'
              size='sm'
              className='h-8 hover:bg-destructive hover:text-destructive-foreground'
            >
              <Icons.trash /> Kick Members
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will kick {selectedIds.length} selected members
                from your community. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleBulkKick();
                }}
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              >
                {bulkKickMut.isPending ? 'Kicking...' : 'Kick Members'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          variant='ghost'
          size='sm'
          className='size-8 p-0 ml-1 rounded-full text-muted-foreground hover:text-foreground'
          onClick={onClearSelection}
        >
          <Icons.close />
        </Button>
      </div>
    </div>
  );
}
