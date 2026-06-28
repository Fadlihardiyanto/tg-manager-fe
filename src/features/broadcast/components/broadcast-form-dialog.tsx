'use client';

import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { useStore } from '@tanstack/react-form';
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
import { Icons } from '@/components/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getPresignedUrl, createBroadcast } from '../api/service';
import { broadcastKeys } from '../api/queries';
import { toast } from 'sonner';
import * as z from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CreateBroadcastRequest } from '../api/types';

const MAX_TEXT = 4096;
const MAX_CAPTION = 1024;

const broadcastFormSchema = z.object({
  target_type: z.string().min(1, 'Pilih target pengiriman'),
  message_type: z.string().min(1, 'Pilih tipe pesan'),
  message_text: z.string().min(1, 'Isi pesan wajib diisi'),
  file: z.array(z.any()),
  scheduled_at: z.string()
});

type BroadcastFormValues = z.infer<typeof broadcastFormSchema>;

const TARGET_OPTIONS = [
  { value: 'group', label: 'Group (semua grup aktif)' },
  { value: 'member', label: 'Member (semua chat DM member)' }
];

const TYPE_OPTIONS = [
  { value: 'text', label: 'Text' },
  { value: 'photo', label: 'Photo' },
  { value: 'document', label: 'Document' }
];

interface BroadcastFormDialogProps {
  botId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BroadcastFormDialog({ botId, open, onOpenChange }: BroadcastFormDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showQuotaAlert, setShowQuotaAlert] = useState(false);

  const mutation = useMutation({
    mutationFn: (params: { botId: string; data: CreateBroadcastRequest }) =>
      createBroadcast(params.botId, params.data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Broadcast berhasil dibuat dan mulai diproses');
        onOpenChange(false);
        form.reset();
        void queryClient.invalidateQueries({ queryKey: broadcastKeys.all });
      } else {
        if (res.message?.toLowerCase().includes('kuota')) {
          setShowQuotaAlert(true);
        } else {
          toast.error(res.message || 'Gagal membuat broadcast');
        }
      }
    },
    onError: () => toast.error('Gagal membuat broadcast')
  });

  const form = useAppForm({
    defaultValues: {
      target_type: 'group',
      message_type: 'text',
      message_text: '',
      file: [],
      scheduled_at: ''
    } as BroadcastFormValues,
    validators: {
      onSubmit: broadcastFormSchema
    },
    onSubmit: async ({ value }) => {
      const maxChars = value.message_type === 'text' ? MAX_TEXT : MAX_CAPTION;
      if (Array.from(value.message_text).length > maxChars) {
        toast.error(`Pesan terlalu panjang! Maksimal ${maxChars} karakter.`);
        return;
      }

      const needsUpload = value.message_type === 'photo' || value.message_type === 'document';
      let file_url: string | undefined;

      if (needsUpload) {
        if (value.file.length > 0) {
          const file = value.file[0];
          const maxSize = value.message_type === 'document' ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
          if (file.size > maxSize) {
            toast.error(
              `Ukuran file terlalu besar! Maksimal ${value.message_type === 'document' ? '5' : '2'} MB.`
            );
            return;
          }

          const presignRes = await getPresignedUrl({
            file_name: file.name,
            content_type: file.type
          });

          if (!presignRes.success || !presignRes.data) {
            toast.error(presignRes.message || 'Gagal mendapatkan link upload');
            return;
          }

          const { upload_url, public_url } = presignRes.data;

          try {
            const uploadRes = await fetch(upload_url, {
              method: 'PUT',
              headers: { 'Content-Type': file.type },
              body: file
            });
            if (!uploadRes.ok) {
              toast.error('Gagal mengunggah file');
              return;
            }
          } catch {
            toast.error('Gagal mengunggah file — periksa koneksi');
            return;
          }

          file_url = public_url;
        } else {
          toast.error(value.message_type === 'photo' ? 'Pilih file gambar' : 'Pilih file PDF');
          return;
        }
      }

      await mutation.mutateAsync({
        botId,
        data: {
          target_type: value.target_type as 'group' | 'member',
          message_type: value.message_type as 'text' | 'photo' | 'document',
          message_text: value.message_text,
          ...(file_url ? { file_url } : {}),
          ...(value.scheduled_at
            ? { scheduled_at: new Date(value.scheduled_at).toISOString() }
            : {})
        }
      });
    }
  });

  const { FormTextField, FormTextareaField, FormSelectField, FormFileUploadField } =
    useFormFields<BroadcastFormValues>();

  const messageType = useStore(form.store, (s) => s.values.message_type);
  const messageText = useStore(form.store, (s) => s.values.message_text);
  const maxChars = messageType === 'text' ? MAX_TEXT : MAX_CAPTION;
  const remaining = maxChars - Array.from(messageText).length;
  const isPending = mutation.isPending;

  const handleFormat = (tag: string, href?: string) => {
    const el = document.getElementById('message_text') as HTMLTextAreaElement;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selected = text.substring(start, end);

    let wrapped: string;
    if (tag === 'a' && href) {
      wrapped = selected ? `<a href="${href}">${selected}</a>` : `<a href="${href}">link</a>`;
    } else {
      wrapped = selected ? `<${tag}>${selected}</${tag}>` : `<${tag}></${tag}>`;
    }

    const newValue = text.substring(0, start) + wrapped + text.substring(end);
    form.setFieldValue('message_text', newValue);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + wrapped.length, start + wrapped.length);
    }, 0);
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) form.reset();
          onOpenChange(v);
        }}
      >
        <DialogContent className='sm:max-w-[560px] max-h-[85vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Buat Broadcast Baru</DialogTitle>
            <DialogDescription>Kirim pesan massal ke seluruh grup atau member.</DialogDescription>
          </DialogHeader>

          <form.AppForm>
            <form.Form id='broadcast-form' className='space-y-4'>
              <FormSelectField
                name='target_type'
                label='Target Pengiriman'
                required
                options={TARGET_OPTIONS}
                placeholder='Pilih target'
                validators={{
                  onBlur: z.string().min(1, 'Pilih target')
                }}
              />

              <FormSelectField
                name='message_type'
                label='Tipe Pesan'
                required
                options={TYPE_OPTIONS}
                placeholder='Pilih tipe pesan'
                validators={{
                  onBlur: z.string().min(1, 'Pilih tipe')
                }}
              />

              <div className='space-y-1'>
                <div className='flex items-center gap-1'>
                  {messageType !== 'text' && (
                    <p className='text-xs text-muted-foreground'>
                      Teks ini akan menjadi caption untuk{' '}
                      {messageType === 'photo' ? 'gambar' : 'dokumen'}.
                    </p>
                  )}
                </div>

                <div className='flex items-center gap-1 border rounded-md p-1'>
                  <button
                    type='button'
                    className='hover:bg-muted rounded px-2 py-1 text-sm font-bold'
                    onClick={() => handleFormat('b')}
                    title='Bold'
                  >
                    <Icons.bold className='size-4' />
                  </button>
                  <button
                    type='button'
                    className='hover:bg-muted rounded px-2 py-1 text-sm italic'
                    onClick={() => handleFormat('i')}
                    title='Italic'
                  >
                    <Icons.italic className='size-4' />
                  </button>
                  <button
                    type='button'
                    className='hover:bg-muted rounded px-2 py-1 text-sm underline'
                    onClick={() => handleFormat('u')}
                    title='Underline'
                  >
                    <Icons.underline className='size-4' />
                  </button>
                  <span className='text-muted-foreground mx-1'>|</span>
                  <button
                    type='button'
                    className='hover:bg-muted rounded px-2 py-1 text-sm'
                    onClick={() => {
                      const url = window.prompt('Masukkan URL:');
                      if (url) handleFormat('a', url);
                    }}
                    title='Link'
                  >
                    <Icons.link className='size-4' />
                  </button>
                  <button
                    type='button'
                    className='hover:bg-muted rounded px-2 py-1 text-sm'
                    onClick={() => handleFormat('code')}
                    title='Code'
                  >
                    <Icons.code className='size-4' />
                  </button>
                  <button
                    type='button'
                    className='hover:bg-muted rounded px-2 py-1 text-sm'
                    onClick={() => handleFormat('s')}
                    title='Strikethrough'
                  >
                    <Icons.slash className='size-4' />
                  </button>
                </div>

                <FormTextareaField
                  name='message_text'
                  label={
                    messageType === 'photo' || messageType === 'document' ? 'Caption' : 'Isi Pesan'
                  }
                  required
                  placeholder={
                    messageType === 'text' ? 'Tulis pesan broadcast...' : 'Tulis caption...'
                  }
                  className='min-h-[120px]'
                  validators={{
                    onBlur: z.string().min(1, 'Isi pesan wajib diisi')
                  }}
                />

                <div
                  className={`text-right text-xs ${
                    remaining < 0
                      ? 'text-destructive font-medium'
                      : remaining < 50
                        ? 'text-yellow-600'
                        : 'text-muted-foreground'
                  }`}
                >
                  {remaining} karakter tersisa
                </div>
              </div>

              {(messageType === 'photo' || messageType === 'document') && (
                <FormFileUploadField
                  name='file'
                  label={messageType === 'photo' ? 'Upload Gambar' : 'Upload Dokumen'}
                  maxFiles={1}
                  maxSize={messageType === 'document' ? 5 * 1024 * 1024 : 2 * 1024 * 1024}
                  accept={
                    messageType === 'document'
                      ? { 'application/pdf': [] }
                      : { 'image/png': [], 'image/jpeg': [], 'image/webp': [] }
                  }
                />
              )}

              <FormTextField
                name='scheduled_at'
                label='Jadwalkan (opsional)'
                placeholder='Kosongkan untuk kirim sekarang'
                description='Format: YYYY-MM-DD HH:MM (waktu lokal). Minimal 1 menit dari sekarang.'
                type='text'
              />
            </form.Form>
          </form.AppForm>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                form.reset();
                onOpenChange(false);
              }}
            >
              Batal
            </Button>
            <Button type='submit' form='broadcast-form' isLoading={isPending}>
              <Icons.send className='mr-2 h-4 w-4' />
              {isPending ? 'Mengirim...' : 'Kirim Broadcast'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showQuotaAlert} onOpenChange={setShowQuotaAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kuota Broadcast Penuh</AlertDialogTitle>
            <AlertDialogDescription>
              Kuota broadcast bulanan Anda sudah habis. Silakan upgrade paket platform untuk
              mendapatkan kuota lebih besar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tutup</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/dashboard/billing')}>
              Upgrade Paket
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
