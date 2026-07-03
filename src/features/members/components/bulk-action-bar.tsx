import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
import { bulkKickMembersMutation } from '../api/mutations';

interface BulkActionBarProps {
  selectedIds: string[];
  onClearSelection: () => void;
}

export function BulkActionBar({ selectedIds, onClearSelection }: BulkActionBarProps) {
  const [isKickModalOpen, setIsKickModalOpen] = useState(false);

  const bulkKickMut = useMutation(bulkKickMembersMutation);

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

  return (
    <div className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-full border border-border bg-background px-4 py-3 shadow-lg animate-in slide-in-from-bottom-10 fade-in duration-300'>
      <div className='flex items-center gap-2 pr-4 border-r border-border'>
        <div className='flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary'>
          {selectedIds.length}
        </div>
        <span className='text-sm font-medium'>selected</span>
      </div>

      <div className='flex items-center gap-2'>
        <AlertDialog open={isKickModalOpen} onOpenChange={setIsKickModalOpen}>
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
                This action will kick {selectedIds.length} selected members from your community.
                This action cannot be undone.
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
