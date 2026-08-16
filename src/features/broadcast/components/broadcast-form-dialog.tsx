'use client';

import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { useStore } from '@tanstack/react-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { getPresignedUrl, createBroadcast } from '../api/service';
import { broadcastKeys, broadcastReachQueryOptions } from '../api/queries';
import { groupsQueryOptions } from '@/features/groups/api/queries';
import { useActivePlan } from '@/features/billing/components/active-plan-provider';
import { toast } from 'sonner';
import * as z from 'zod';
import { useState, useCallback, useEffect } from 'react';
import type { CreateBroadcastRequest } from '../api/types';
import { FormTelegramEditor } from './telegram-editor';
import { BroadcastConfirmDialog } from './broadcast-confirm-dialog';

const MAX_TEXT = 4096;
const MAX_CAPTION = 1024;

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

const broadcastFormSchema = z.object({
  send_mode: z.enum(['now', 'scheduled']),
  target_type: z.string().min(1, 'Pilih target pengiriman'),
  message_type: z.string().min(1, 'Pilih tipe pesan'),
  message_text: z.string().min(1, 'Isi pesan wajib diisi'),
  file: z.array(z.any()),
  scheduled_at: z.string(),
  group_ids: z.array(z.string()).optional()
});

type BroadcastFormValues = z.infer<typeof broadcastFormSchema>;

const TARGET_OPTIONS = [
  { value: 'group', label: 'Grup' },
  { value: 'member', label: 'Member (semua chat DM member)' }
];

const TYPE_OPTIONS = [
  { value: 'text', label: 'Teks' },
  { value: 'photo', label: 'Foto' },
  { value: 'document', label: 'Dokumen' }
];

interface BroadcastFormDialogProps {
  botId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BroadcastFormDialog({ botId, open, onOpenChange }: BroadcastFormDialogProps) {
  const queryClient = useQueryClient();
  const { canUseFeature, hasQuota } = useActivePlan();
  const [showQuotaAlert, setShowQuotaAlert] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [groupScope, setGroupScope] = useState<'all' | 'selected'>('all');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<string | undefined> => {
    setIsUploading(true);
    setUploadError(null);

    const presignRes = await getPresignedUrl({
      file_name: file.name,
      content_type: file.type
    });

    if (!presignRes.success || !presignRes.data) {
      setUploadError(presignRes.message || 'Gagal mendapatkan tautan unggah');
      setIsUploading(false);
      return undefined;
    }

    const { upload_url, public_url } = presignRes.data;

    try {
      const uploadRes = await fetch(upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      });

      if (!uploadRes.ok) {
        if (uploadRes.status === 403) {
          setUploadError(
            'Penyimpanan menolak akses (403). URL unggah sudah kedaluwarsa atau tidak valid. Coba lagi.'
          );
        } else {
          setUploadError(`Gagal mengunggah file (${uploadRes.status}). Silakan coba lagi.`);
        }
        setIsUploading(false);
        return undefined;
      }

      setIsUploading(false);
      setUploadError(null);
      return public_url;
    } catch {
      setUploadError('Gagal mengunggah file — periksa koneksi internet Anda.');
      setIsUploading(false);
      return undefined;
    }
  };

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
      send_mode: 'now' as 'now' | 'scheduled',
      target_type: 'group',
      message_type: 'text',
      message_text: '',
      file: [],
      scheduled_at: '',
      group_ids: []
    } as BroadcastFormValues,
    validators: {
      onSubmit: broadcastFormSchema
    },
    onSubmit: async ({ value }) => {
      if (!canUseFeature('allow_media_broadcast') && value.message_type !== 'text') {
        toast.error('Paket aktif Anda hanya mengizinkan siaran teks.');
        return;
      }

      const maxChars = value.message_type === 'text' ? MAX_TEXT : MAX_CAPTION;
      const plainText = stripHtml(value.message_text);
      if (!plainText) {
        toast.error('Isi pesan wajib diisi');
        return;
      }
      if (Array.from(plainText).length > maxChars) {
        toast.error(`Pesan terlalu panjang! Maksimal ${maxChars} karakter.`);
        return;
      }

      if (value.send_mode === 'scheduled') {
        if (!value.scheduled_at) {
          toast.error('Pilih waktu pengiriman atau ubah ke mode Kirim Sekarang.');
          return;
        }
        const scheduled = new Date(value.scheduled_at.replace(' ', 'T'));
        if (scheduled.getTime() <= Date.now()) {
          toast.error('Waktu yang dipilih sudah terlewat. Silakan pilih waktu yang akan datang.');
          return;
        }
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

          file_url = await uploadFile(file);
          if (!file_url) return;
        } else {
          toast.error(value.message_type === 'photo' ? 'Pilih file gambar' : 'Pilih file PDF');
          return;
        }
      }

      if (value.target_type === 'group' && groupScope === 'selected' && !value.group_ids?.length) {
        toast.error('Pilih minimal satu grup untuk dikirim');
        return;
      }

      await mutation.mutateAsync({
        botId,
        data: {
          target_type: value.target_type as 'group' | 'member',
          message_type: value.message_type as 'text' | 'photo' | 'document',
          message_text: value.message_text,
          ...(file_url ? { file_url } : {}),
          ...(value.send_mode === 'scheduled' && value.scheduled_at
            ? { scheduled_at: new Date(value.scheduled_at).toISOString() }
            : { is_immediate: true }),
          ...(value.group_ids?.length ? { group_ids: value.group_ids } : {})
        }
      });
    }
  });

  const { FormSelectField, FormFileUploadField, FormDateTimeField, FormRadioGroupField } =
    useFormFields<BroadcastFormValues>();

  const canCreateBroadcast = hasQuota('broadcasts');
  const allowMediaBroadcast = canUseFeature('allow_media_broadcast');
  const { data: reachData } = useQuery({
    ...broadcastReachQueryOptions(botId),
    enabled: open
  });
  const reach = reachData?.success ? reachData.data : null;
  const messageType = useStore(form.store, (s) => s.values.message_type);
  const maxChars = messageType === 'text' ? MAX_TEXT : MAX_CAPTION;
  const isPending = mutation.isPending;
  const minDateTime = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  })();
  const scheduledAt = useStore(form.store, (s) => s.values.scheduled_at);
  const sendMode = useStore(form.store, (s) => s.values.send_mode) as 'now' | 'scheduled';
  const isSchedulePast =
    sendMode === 'scheduled' &&
    !!scheduledAt &&
    new Date(scheduledAt.replace(' ', 'T')).getTime() <= Date.now();

  const handleConfirmSend = useCallback(() => {
    setIsConfirmOpen(false);
    const formEl = document.getElementById('broadcast-form') as HTMLFormElement | null;
    if (formEl) formEl.requestSubmit();
  }, []);

  const targetType = useStore(form.store, (s) => s.values.target_type);
  const targetLabel = TARGET_OPTIONS.find((o) => o.value === targetType)?.label || '';
  const uploadedFile = useStore(form.store, (s) => s.values.file)?.[0];
  const messageHTML = useStore(form.store, (s) => s.values.message_text);
  const selectedGroupIds = useStore(form.store, (s) => s.values.group_ids ?? []) as string[];
  const submissionAttempts = useStore(form.store, (s) => s.submissionAttempts);

  // Auto-scroll to first validation error on submit
  useEffect(() => {
    if (submissionAttempts === 0) return;
    setTimeout(() => {
      const scrollEl = document.getElementById('broadcast-form-scroll');
      const firstError = scrollEl?.querySelector('.text-destructive');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  }, [submissionAttempts]);

  const { data: groupsData } = useQuery({
    ...groupsQueryOptions(),
    enabled: open && targetType === 'group'
  });
  const allGroups = groupsData?.data ?? [];
  const botGroups = allGroups.filter((g) => g.bot_id === botId && g.is_active);
  const selectedGroupNames =
    selectedGroupIds.length > 0
      ? botGroups.filter((g) => selectedGroupIds.includes(g.id)).map((g) => g.name)
      : undefined;

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) {
            form.reset();
            setUploadError(null);
            setIsUploading(false);
            setGroupScope('all');
          }
          onOpenChange(v);
        }}
      >
        <DialogContent className='sm:max-w-[560px] max-h-[85vh] flex flex-col overflow-hidden p-0 gap-0'>
          <div className='shrink-0 px-6 pt-6'>
            <DialogHeader>
              <DialogTitle>Buat Siaran Baru</DialogTitle>
              <DialogDescription>Kirim pesan massal ke seluruh grup atau member.</DialogDescription>
            </DialogHeader>
          </div>

          <div id='broadcast-form-scroll' className='flex-1 min-h-0 overflow-y-auto px-6 py-4'>
            <form.AppForm>
              <form.Form id='broadcast-form' className='space-y-4'>
                <FormSelectField
                  name='target_type'
                  label='Tujuan Pengiriman'
                  required
                  options={TARGET_OPTIONS}
                  placeholder='Pilih tujuan'
                  validators={{
                    onBlur: z.string().min(1, 'Pilih target')
                  }}
                />
                {reach && (
                  <p className='-mt-3 text-xs text-muted-foreground'>
                    Jangkauan: <strong>{reach.group_count} grup</strong>
                    {reach.member_count > 0 && (
                      <>
                        {' '}
                        · <strong>{reach.member_count} member</strong>
                      </>
                    )}
                  </p>
                )}

                {targetType === 'group' && botGroups.length > 0 && (
                  <div className='space-y-2'>
                    <div className='flex flex-col gap-1.5'>
                      <label className='flex cursor-pointer items-center gap-2 text-sm'>
                        <input
                          type='radio'
                          aria-label='Semua grup aktif'
                          className='accent-primary'
                          checked={groupScope === 'all'}
                          onChange={() => {
                            setGroupScope('all');
                            form.setFieldValue('group_ids', []);
                          }}
                        />
                        Semua grup aktif
                      </label>
                      <label className='flex cursor-pointer items-center gap-2 text-sm'>
                        <input
                          type='radio'
                          aria-label='Pilih grup tertentu'
                          className='accent-primary'
                          checked={groupScope === 'selected'}
                          onChange={() => setGroupScope('selected')}
                        />
                        Pilih grup tertentu
                      </label>
                    </div>

                    {groupScope === 'selected' && (
                      <div className='space-y-2'>
                        <div className='flex items-center justify-between gap-2'>
                          <p className='text-xs text-muted-foreground'>
                            {selectedGroupIds.length > 0
                              ? `${selectedGroupIds.length} grup terpilih`
                              : 'Belum ada grup dipilih'}
                          </p>
                          <button
                            type='button'
                            className='text-xs text-primary hover:underline'
                            onClick={() =>
                              form.setFieldValue(
                                'group_ids',
                                selectedGroupIds.length > 0 ? [] : botGroups.map((g) => g.id)
                              )
                            }
                          >
                            {selectedGroupIds.length > 0 ? 'Hapus Semua' : 'Pilih Semua'}
                          </button>
                        </div>
                        <div className='max-h-[160px] overflow-y-auto rounded-lg border p-2 space-y-0.5'>
                          {botGroups.length === 0 && (
                            <p className='py-2 text-center text-xs text-muted-foreground'>
                              Tidak ada grup terhubung
                            </p>
                          )}
                          {botGroups.map((group) => {
                            return (
                              <div
                                key={group.id}
                                role='checkbox'
                                aria-checked={selectedGroupIds.includes(group.id)}
                                aria-label={group.name}
                                tabIndex={0}
                                className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50 text-sm'
                                onClick={() => {
                                  const isChecked = selectedGroupIds.includes(group.id);
                                  const next = isChecked
                                    ? selectedGroupIds.filter((id) => id !== group.id)
                                    : [...selectedGroupIds, group.id];
                                  form.setFieldValue('group_ids', next);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    const isChecked = selectedGroupIds.includes(group.id);
                                    const next = isChecked
                                      ? selectedGroupIds.filter((id) => id !== group.id)
                                      : [...selectedGroupIds, group.id];
                                    form.setFieldValue('group_ids', next);
                                  }
                                }}
                              >
                                <Checkbox
                                  checked={selectedGroupIds.includes(group.id)}
                                  tabIndex={-1}
                                  aria-hidden
                                  className='pointer-events-none'
                                />
                                <span className='flex-1 truncate'>{group.name}</span>
                                <span className='shrink-0 text-xs text-muted-foreground tabular-nums'>
                                  {group.member_count}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <FormSelectField
                  name='message_type'
                  label='Tipe Pesan'
                  required
                  options={allowMediaBroadcast ? TYPE_OPTIONS : [TYPE_OPTIONS[0]]}
                  placeholder='Pilih tipe pesan'
                  validators={{
                    onBlur: z.string().min(1, 'Pilih tipe')
                  }}
                />

                {!allowMediaBroadcast && (
                  <Alert>
                    <Icons.lock />
                    <AlertTitle>Media broadcast belum tersedia</AlertTitle>
                    <AlertDescription>
                      Paket aktif Anda hanya mengizinkan siaran teks.
                    </AlertDescription>
                  </Alert>
                )}

                <div className='space-y-4'>
                  {messageType !== 'text' && (
                    <p className='text-xs text-muted-foreground'>
                      Teks ini akan menjadi caption untuk{' '}
                      {messageType === 'photo' ? 'gambar' : 'dokumen'}.
                    </p>
                  )}

                  <FormTelegramEditor
                    name='message_text'
                    label={
                      messageType === 'photo' || messageType === 'document'
                        ? 'Keterangan'
                        : 'Isi Pesan'
                    }
                    placeholder={messageType === 'text' ? 'Tulis siaran...' : 'Tulis keterangan...'}
                    maxChars={maxChars}
                  />
                </div>

                {(messageType === 'photo' || messageType === 'document') && (
                  <>
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
                    {isUploading && (
                      <p className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <Icons.spinner className='size-3.5 animate-spin' />
                        Mengunggah file...
                      </p>
                    )}
                    {uploadError && (
                      <div className='flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm'>
                        <Icons.warning className='mt-0.5 size-4 shrink-0 text-destructive' />
                        <div>
                          <p className='text-destructive'>{uploadError}</p>
                          <p className='mt-1 text-muted-foreground'>
                            Anda bisa mengirim ulang dengan klik Kirim Siaran lagi.
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <FormRadioGroupField
                  name='send_mode'
                  label='Mode Pengiriman'
                  options={[
                    { value: 'now', label: 'Kirim Sekarang' },
                    { value: 'scheduled', label: 'Jadwalkan' }
                  ]}
                  listeners={{
                    onChange: ({ value: newValue }) => {
                      if (newValue === 'now') form.setFieldValue('scheduled_at', '');
                    }
                  }}
                />

                {sendMode === 'scheduled' && (
                  <>
                    <FormDateTimeField
                      name='scheduled_at'
                      label='Waktu Pengiriman'
                      description=''
                      min={minDateTime}
                      required
                    />
                    {isSchedulePast && (
                      <p className='text-xs text-destructive'>
                        Waktu yang dipilih sudah terlewat. Silakan pilih waktu yang akan datang.
                      </p>
                    )}
                  </>
                )}
              </form.Form>
            </form.AppForm>
          </div>

          <div className='shrink-0 border-t border-border/70 px-6 py-4 bg-background'>
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
              <Button
                type='button'
                isLoading={isPending || isUploading}
                disabled={!canCreateBroadcast || isUploading || isSchedulePast}
                onClick={() => setIsConfirmOpen(true)}
              >
                {isUploading ? (
                  <>
                    <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
                    Mengunggah...
                  </>
                ) : (
                  <>
                    <Icons.send className='mr-2 h-4 w-4' />
                    Kirim Siaran
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <BroadcastConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={handleConfirmSend}
        messageHTML={messageHTML}
        targetLabel={targetLabel}
        file={uploadedFile}
        messageType={messageType}
        groupCount={groupScope === 'selected' ? selectedGroupIds.length : reach?.group_count}
        memberCount={reach?.member_count}
        selectedGroupNames={selectedGroupNames}
        isScheduled={sendMode === 'scheduled'}
        scheduledAt={scheduledAt}
        isPending={isPending}
      />

      <AlertDialog open={showQuotaAlert} onOpenChange={setShowQuotaAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kuota Siaran Penuh</AlertDialogTitle>
            <AlertDialogDescription>
              Kuota siaran bulanan Anda sudah habis. Silakan tingkatkan paket platform untuk
              mendapatkan kuota lebih besar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tutup</AlertDialogCancel>
            <AlertDialogAction onClick={() => setShowQuotaAlert(false)}>Tutup</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
