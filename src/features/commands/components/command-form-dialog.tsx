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
import { Icons } from '@/components/icons';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { createCommandMutation, updateCommandMutation } from '../api/mutations';
import { getPresignedUrl } from '../api/service';
import { commandKeys } from '../api/queries';
import { botsQueryOptions } from '@/features/bots/api/queries';
import type { Command, CreateCommandRequest } from '../api/types';
import { toast } from 'sonner';
import * as z from 'zod';

const BLACKLIST = ['/start', '/packages', '/mysub', '/status', '/myorders', '/connect'];

type CommandFormValues = {
  bot_id: string;
  command_trigger: string;
  response_type: string;
  response_text: string;
  file: any[];
};

const commandFormSchema = z.object({
  bot_id: z.string().min(1, 'Pilih bot'),
  command_trigger: z.string().min(1, 'Nama perintah wajib diisi').max(31, 'Maksimal 31 karakter'),
  response_type: z.string().min(1, 'Pilih tipe respon'),
  response_text: z.string().min(1, 'Isi pesan wajib diisi'),
  file: z.array(z.any())
});

interface CommandFormDialogProps {
  command?: Command | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandFormDialog({ command, open, onOpenChange }: CommandFormDialogProps) {
  const isEdit = !!command;
  const queryClient = useQueryClient();

  const { data: botsData } = useSuspenseQuery(botsQueryOptions());
  const bots = (botsData?.data ?? []).filter((b) => b.is_active);

  const createMutation = useMutation({
    ...createCommandMutation,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Perintah berhasil dibuat');
        onOpenChange(false);
        form.reset();
        void queryClient.invalidateQueries({ queryKey: commandKeys.all });
      } else {
        toast.error(res.message || 'Gagal membuat perintah');
      }
    },
    onError: () => toast.error('Gagal membuat perintah')
  });

  const updateMutation = useMutation({
    ...updateCommandMutation,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Perintah berhasil diperbarui');
        onOpenChange(false);
        void queryClient.invalidateQueries({ queryKey: commandKeys.all });
      } else {
        toast.error(res.message || 'Gagal memperbarui perintah');
      }
    },
    onError: () => toast.error('Gagal memperbarui perintah')
  });

  const form = useAppForm({
    defaultValues: {
      bot_id: command?.bot_id ?? '',
      command_trigger: command?.command_trigger?.replace(/^\//, '') ?? '',
      response_type: command?.response_type ?? 'text',
      response_text: command?.response_text ?? '',
      file: []
    } as CommandFormValues,
    validators: {
      onSubmit: commandFormSchema
    },
    onSubmit: async ({ value }) => {
      let trigger = value.command_trigger.trim().toLowerCase();
      if (!trigger.startsWith('/')) trigger = '/' + trigger;

      const triggerRegex = /^\/[a-z0-9_]{1,31}$/;
      if (!triggerRegex.test(trigger)) {
        toast.error(
          'Format perintah salah! Hanya gunakan huruf kecil, angka, dan underscore (maks 32 karakter).'
        );
        return;
      }

      if (BLACKLIST.includes(trigger)) {
        toast.error(
          `Perintah "${trigger}" adalah perintah bawaan sistem dan tidak bisa digunakan.`
        );
        return;
      }

      const maxText = value.response_type === 'text' ? 4096 : 1024;
      if (Array.from(value.response_text).length > maxText) {
        toast.error(`Isi pesan terlalu panjang! Maksimal ${maxText} karakter.`);
        return;
      }

      const needsUpload = value.response_type === 'photo' || value.response_type === 'document';
      let file_url: string | null = null;
      if (needsUpload) {
        if (value.file.length > 0) {
          const file = value.file[0];
          const maxSize = value.response_type === 'document' ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
          if (file.size > maxSize) {
            toast.error(
              `Ukuran berkas terlalu besar! Maksimal ${value.response_type === 'document' ? '5' : '2'} MB.`
            );
            return;
          }

          const presignRes = await getPresignedUrl({
            file_name: file.name,
            content_type: file.type
          });
          if (!presignRes.success) {
            toast.error(presignRes.message || 'Gagal mendapatkan link upload');
            return;
          }
          const { upload_url, public_url } = presignRes.data;

          let s3Res: Response;
          try {
            s3Res = await fetch(upload_url, {
              method: 'PUT',
              headers: { 'Content-Type': file.type },
              body: file
            });
          } catch {
            toast.error(
              `Gagal mengunggah file ke ${upload_url.slice(0, 60)}... — periksa konfigurasi CORS bucket S3`
            );
            return;
          }
          if (!s3Res.ok) {
            toast.error('Gagal mengunggah file');
            return;
          }
          file_url = public_url;
        } else if (isEdit && command?.file_url) {
          file_url = command.file_url;
        } else {
          toast.error(value.response_type === 'photo' ? 'Pilih file gambar' : 'Pilih file PDF');
          return;
        }
      }

      const payload: CreateCommandRequest = {
        bot_id: value.bot_id,
        command_trigger: trigger,
        response_type: value.response_type as 'text' | 'photo' | 'document',
        response_text: value.response_text,
        ...(needsUpload && file_url ? { file_url } : {})
      };

      if (isEdit && command) {
        await updateMutation.mutateAsync({ id: command.id, values: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    }
  });

  const { FormTextField, FormTextareaField, FormSelectField, FormFileUploadField } =
    useFormFields<CommandFormValues>();

  const responseType = useStore(form.store, (state) => state.values.response_type);
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) form.reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className='sm:max-w-[520px] max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Perintah' : 'Tambah Perintah Baru'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Perbarui perintah custom bot.'
              : 'Buat perintah baru untuk respon otomatis bot.'}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form id='command-form-dialog' className='space-y-4'>
            <FormSelectField
              name='bot_id'
              label='Bot'
              required
              options={bots.map((b) => ({ value: b.id, label: `@${b.username}` }))}
              placeholder='Pilih bot'
              validators={{
                onBlur: z.string().min(1, 'Pilih bot')
              }}
            />

            <FormTextField
              name='command_trigger'
              label='Perintah'
              required
              placeholder='rules'
              description='Hanya huruf kecil, angka, dan underscore. Akan otomatis ditambahkan tanda /'
              sanitize={(val) => val.toLowerCase().replace(/[^a-z0-9_]/g, '')}
              validators={{
                onBlur: z
                  .string()
                  .min(1, 'Nama perintah wajib diisi')
                  .max(31, 'Maksimal 31 karakter')
              }}
            />

            <FormSelectField
              name='response_type'
              label='Tipe Respon'
              required
              options={[
                { value: 'text', label: 'Text' },
                { value: 'photo', label: 'Photo' },
                { value: 'document', label: 'Document' }
              ]}
              placeholder='Pilih tipe respon'
            />

            <FormTextareaField
              name='response_text'
              label={
                responseType === 'photo'
                  ? 'Keterangan Gambar (Caption)'
                  : responseType === 'document'
                    ? 'Keterangan Dokumen (Caption)'
                    : 'Isi Pesan Balasan'
              }
              required
              placeholder={
                responseType === 'photo'
                  ? 'Tulis caption untuk gambar...'
                  : responseType === 'document'
                    ? 'Tulis caption untuk dokumen...'
                    : 'Tulis pesan balasan...'
              }
              validators={{
                onBlur: z.string().min(1, 'Isi pesan wajib diisi')
              }}
            />

            {(responseType === 'photo' || responseType === 'document') && (
              <div className='space-y-2'>
                <FormFileUploadField
                  name='file'
                  label={responseType === 'photo' ? 'Upload Gambar' : 'Upload Dokumen'}
                  maxFiles={1}
                  maxSize={responseType === 'document' ? 5 * 1024 * 1024 : 2 * 1024 * 1024}
                  accept={
                    responseType === 'document'
                      ? { 'application/pdf': [] }
                      : { 'image/png': [], 'image/jpeg': [], 'image/webp': [] }
                  }
                />
                {isEdit && command?.file_url && (
                  <p className='text-muted-foreground text-xs'>
                    File saat ini: {command.file_url.split('/').pop()}
                  </p>
                )}
              </div>
            )}
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
          <Button type='submit' form='command-form-dialog' isLoading={isPending}>
            <Icons.check className='mr-2 h-4 w-4' />
            {isEdit ? 'Perbarui' : 'Tambah'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
