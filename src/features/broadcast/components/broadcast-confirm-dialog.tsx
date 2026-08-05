'use client';

import { useMemo, useEffect } from 'react';
import Image from 'next/image';
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

interface BroadcastConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  messageHTML: string;
  targetLabel: string;
  file?: File;
  messageType?: string;
  groupCount?: number;
  memberCount?: number;
  selectedGroupNames?: string[];
  isScheduled?: boolean;
  scheduledAt?: string;
  isPending?: boolean;
}

function MediaPreview({ file, messageType }: { file?: File; messageType?: string }) {
  const objectUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(
    () => () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    },
    [objectUrl]
  );

  if (!file || !messageType) return null;

  if (messageType === 'photo' && objectUrl) {
    return (
      <div className='relative overflow-hidden rounded-lg bg-black/5'>
        {/* ponytail: blob URL preview — unoptimized skips the image loader for local previews */}
        <Image
          src={objectUrl}
          alt={file.name}
          width={400}
          height={200}
          unoptimized
          className='max-h-[200px] w-full object-contain'
        />
      </div>
    );
  }

  if (messageType === 'document') {
    return (
      <div className='flex items-center gap-3 rounded-lg border bg-background p-3'>
        <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-50'>
          <Icons.fileTypePdf className='size-5 text-red-500' />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-medium'>{file.name}</p>
          <p className='text-xs text-muted-foreground'>PDF Document</p>
        </div>
      </div>
    );
  }

  return null;
}

function MessageBubble({ html }: { html: string }) {
  if (!html || html === '<p></p>') return null;
  return (
    <div className='flex justify-end'>
      <div
        className='max-w-[85%] rounded-2xl rounded-br-md bg-[#2b9fd9] px-4 py-2.5 text-sm text-white shadow-sm [&_a]:underline'
        dangerouslySetInnerHTML={{
          __html: html
            .replace(/<p>/g, '')
            .replace(/<\/p>/g, '<br/>')
            .replace(/<br\/>$/, '')
        }}
      />
    </div>
  );
}

export function BroadcastConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  messageHTML,
  targetLabel,
  file,
  messageType,
  groupCount,
  memberCount,
  selectedGroupNames,
  isScheduled,
  scheduledAt,
  isPending
}: BroadcastConfirmDialogProps) {
  const scheduleDisplay =
    isScheduled && scheduledAt
      ? new Date(scheduledAt.replace(' ', 'T')).toLocaleString('id-ID', {
          dateStyle: 'long',
          timeStyle: 'short'
        })
      : null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='sm:max-w-[480px] max-h-[85vh] flex flex-col overflow-hidden p-0 gap-0'>
        <div className='shrink-0 px-6 pt-6 pb-2'>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Siaran</AlertDialogTitle>
            <AlertDialogDescription>
              Periksa kembali pesan dan tujuan sebelum mengirim.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <div className='flex-1 min-h-0 overflow-y-auto px-6 py-4'>
          <div className='space-y-4'>
            <div className='space-y-3 rounded-xl border bg-muted/30 p-4'>
              <MediaPreview file={file} messageType={messageType} />

              {!file && <p className='text-center text-xs text-muted-foreground'>Pesan teks</p>}

              <MessageBubble html={messageHTML} />
            </div>

            <div className='space-y-2 text-sm'>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Icons.teams className='size-4' />
                <span>
                  Tujuan: {targetLabel}
                  {selectedGroupNames && selectedGroupNames.length > 0 ? (
                    <span className='font-medium text-foreground'>
                      {' '}
                      · {selectedGroupNames.length} grup: {selectedGroupNames.join(', ')}
                    </span>
                  ) : groupCount != null ? (
                    <span className='font-medium text-foreground'>
                      {' '}
                      · {groupCount} grup
                      {memberCount != null && memberCount > 0 && <>, {memberCount} member</>}
                    </span>
                  ) : null}
                </span>
              </div>

              {scheduleDisplay && (
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <Icons.clock className='size-4' />
                  <span>Dijadwalkan: {scheduleDisplay}</span>
                </div>
              )}

              {!isScheduled && (
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <Icons.clock className='size-4' />
                  <span>Dikirim sekarang</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='shrink-0 border-t border-border/70 px-6 py-4'>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm} disabled={isPending}>
              {isPending ? (
                <>
                  <Icons.spinner className='mr-2 size-4 animate-spin' />
                  Mengirim...
                </>
              ) : (
                <>
                  <Icons.send className='mr-2 size-4' />
                  Ya, Kirim
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
