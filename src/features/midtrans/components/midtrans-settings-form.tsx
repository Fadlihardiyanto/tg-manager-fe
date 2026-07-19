'use client';

import { z } from 'zod';
import { toast } from 'sonner';
import { useStore } from '@tanstack/react-form';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppForm } from '@/components/ui/tanstack-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { TextField } from '@/components/forms/fields';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  initiatePaymentKeyExchange,
  updateEncryptedPaymentSettings
} from '@/features/onboarding/api/service';
import {
  paymentSettingsKeys,
  paymentSettingsQueryOptions
} from '@/features/onboarding/api/queries';
import { encryptPaymentCredentials } from '../lib/payment-credential-crypto';

const midtransSettingsSchema = z
  .object({
    midtransEnvironment: z.enum(['sandbox', 'production']),
    sandboxMerchantId: z.string().optional(),
    sandboxClientKey: z.string().optional(),
    sandboxServerKey: z.string().optional(),
    productionMerchantId: z.string().optional(),
    productionClientKey: z.string().optional(),
    productionServerKey: z.string().optional()
  })
  .superRefine((value, ctx) => {
    const fields =
      value.midtransEnvironment === 'sandbox'
        ? (['sandboxMerchantId', 'sandboxClientKey', 'sandboxServerKey'] as const)
        : (['productionMerchantId', 'productionClientKey', 'productionServerKey'] as const);

    fields.forEach((field) => {
      if (!value[field]?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: 'Kolom ini wajib diisi'
        });
      }
    });
  });

type MidtransSettingsValues = z.infer<typeof midtransSettingsSchema>;

const requiredKeySchema = z.string().min(1, 'Kolom ini wajib diisi');

function editableSecret(value: string | undefined) {
  if (!value?.trim() || value.includes('*')) return undefined;
  return value;
}

export function MidtransSettingsForm() {
  const queryClient = useQueryClient();
  const { data: settingsResponse, isLoading } = useQuery(paymentSettingsQueryOptions());

  const [showSandboxKey, setShowSandboxKey] = useState(false);
  const [showProductionKey, setShowProductionKey] = useState(false);

  const settings = settingsResponse?.data;

  const sandboxConfigured = !!(
    settings?.has_sandbox_merchant_id &&
    settings?.has_sandbox_client_key &&
    settings?.has_sandbox_server_key
  );

  const productionConfigured = !!(
    settings?.has_production_merchant_id &&
    settings?.has_production_client_key &&
    settings?.has_production_server_key
  );

  const form = useAppForm({
    defaultValues: {
      midtransEnvironment: 'sandbox',
      sandboxMerchantId: '',
      sandboxClientKey: '',
      sandboxServerKey: '',
      productionMerchantId: '',
      productionClientKey: '',
      productionServerKey: ''
    } as MidtransSettingsValues,
    validators: {
      onSubmit: midtransSettingsSchema
    },
    onSubmit: async ({ value }) => {
      try {
        const isSandbox = value.midtransEnvironment === 'sandbox';
        const { sessionId, encryptedFields } = await encryptPaymentCredentials(
          {
            sandbox_merchant_id: isSandbox ? editableSecret(value.sandboxMerchantId) : undefined,
            sandbox_server_key: isSandbox ? editableSecret(value.sandboxServerKey) : undefined,
            sandbox_client_key: isSandbox ? editableSecret(value.sandboxClientKey) : undefined,
            production_merchant_id: !isSandbox
              ? editableSecret(value.productionMerchantId)
              : undefined,
            production_server_key: !isSandbox
              ? editableSecret(value.productionServerKey)
              : undefined,
            production_client_key: !isSandbox
              ? editableSecret(value.productionClientKey)
              : undefined
          },
          async (clientPublicKey) => {
            const res = await initiatePaymentKeyExchange({
              client_public_key: clientPublicKey
            });

            if (!res.success) {
              throw new Error(res.message || 'Gagal memulai enkripsi pembayaran');
            }

            return res.data;
          }
        );
        const res = await updateEncryptedPaymentSettings({
          session_id: sessionId,
          is_sandbox: isSandbox,
          ...encryptedFields
        });

        if (res.success) {
          toast.success('Pengaturan Midtrans berhasil disimpan');
          void queryClient.invalidateQueries({ queryKey: paymentSettingsKeys.all });
          return;
        }

        toast.error(res.message || 'Gagal menyimpan pengaturan Midtrans');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Gagal mengenkripsi credential';
        toast.error(message);
      }
    }
  });
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  useEffect(() => {
    const s = settingsResponse?.data;
    if (!s) return;

    form.reset({
      midtransEnvironment: s.is_sandbox ? 'sandbox' : 'production',
      sandboxMerchantId: s.sandbox_merchant_id ?? '',
      sandboxClientKey: s.sandbox_client_key ?? '',
      sandboxServerKey: s.sandbox_server_key ?? '',
      productionMerchantId: s.production_merchant_id ?? '',
      productionClientKey: s.production_client_key ?? '',
      productionServerKey: s.production_server_key ?? ''
    });
  }, [form, settingsResponse?.data]);

  const env = useStore(form.store, (state) => state.values.midtransEnvironment);

  return (
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
      {/* ────── Form Card ────── */}
      <div className='lg:col-span-2'>
        <Card className='rounded-2xl border-border/70 shadow-sm'>
          <CardHeader>
            <div className='flex items-center justify-between gap-4'>
              <div>
                <CardTitle>Kredensial Midtrans</CardTitle>
                <CardDescription>Atur kredensial Midtrans untuk pembayaran member.</CardDescription>
              </div>
              {settings && (
                <Badge
                  variant='outline'
                  className={cn(
                    'shrink-0 gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
                    env === 'sandbox'
                      ? sandboxConfigured
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                      : productionConfigured
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-1.5 w-1.5 rounded-full',
                      (env === 'sandbox' ? sandboxConfigured : productionConfigured)
                        ? 'bg-emerald-500'
                        : 'bg-amber-500'
                    )}
                  />
                  {(env === 'sandbox' ? sandboxConfigured : productionConfigured)
                    ? 'Terkonfigurasi'
                    : 'Belum lengkap'}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form.AppForm>
              <form.Form id='midtrans-settings-form' className='mx-0 gap-5 p-0'>
                <form.AppField name='midtransEnvironment'>
                  {(field) => (
                    <div className='flex flex-col gap-2'>
                      <Label className='text-sm font-medium'>Lingkungan Aktif</Label>
                      <div className='inline-flex items-center gap-2 rounded-full border bg-muted/50 p-0.5 w-fit'>
                        <button
                          type='button'
                          onClick={() => field.handleChange('sandbox')}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                            field.state.value === 'sandbox'
                              ? 'bg-background shadow-sm text-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                        >
                          <span
                            className={cn(
                              'inline-block h-2 w-2 rounded-full',
                              sandboxConfigured ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                            )}
                          />
                          Sandbox
                        </button>
                        <button
                          type='button'
                          onClick={() => field.handleChange('production')}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                            field.state.value === 'production'
                              ? 'bg-background shadow-sm text-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                        >
                          <span
                            className={cn(
                              'inline-block h-2 w-2 rounded-full',
                              productionConfigured ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                            )}
                          />
                          Production
                        </button>
                      </div>
                    </div>
                  )}
                </form.AppField>

                <form.Subscribe selector={(state) => state.values.midtransEnvironment}>
                  {(e) =>
                    e === 'sandbox' ? (
                      <div className='grid gap-5 rounded-xl border bg-muted/30 p-5'>
                        <p className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                          Kredensial Sandbox
                        </p>
                        <form.AppField
                          name='sandboxMerchantId'
                          validators={{ onBlur: requiredKeySchema }}
                        >
                          {(field) => (
                            <TextField
                              label='Merchant ID Sandbox'
                              type='text'
                              placeholder='G123456789'
                            />
                          )}
                        </form.AppField>
                        <form.AppField
                          name='sandboxClientKey'
                          validators={{ onBlur: requiredKeySchema }}
                        >
                          {(field) => (
                            <TextField
                              label='Client Key Sandbox'
                              type='text'
                              placeholder='SB-Mid-client-...'
                            />
                          )}
                        </form.AppField>
                        <form.AppField
                          name='sandboxServerKey'
                          validators={{ onBlur: requiredKeySchema }}
                        >
                          {(field) => (
                            <TextField
                              label='Server Key Sandbox'
                              type={showSandboxKey ? 'text' : 'password'}
                              placeholder='SB-Mid-server-...'
                              rightElement={
                                <button
                                  type='button'
                                  tabIndex={-1}
                                  onClick={() => setShowSandboxKey(!showSandboxKey)}
                                  className='cursor-pointer text-muted-foreground hover:text-foreground transition-colors'
                                >
                                  {showSandboxKey ? (
                                    <Icons.eyeOff className='h-4 w-4' />
                                  ) : (
                                    <Icons.eye className='h-4 w-4' />
                                  )}
                                </button>
                              }
                            />
                          )}
                        </form.AppField>
                      </div>
                    ) : (
                      <div className='grid gap-5 rounded-xl border bg-muted/30 p-5'>
                        <p className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                          Kredensial Production
                        </p>
                        <form.AppField
                          name='productionMerchantId'
                          validators={{ onBlur: requiredKeySchema }}
                        >
                          {(field) => (
                            <TextField
                              label='Merchant ID Production'
                              type='text'
                              placeholder='G123456789'
                            />
                          )}
                        </form.AppField>
                        <form.AppField
                          name='productionClientKey'
                          validators={{ onBlur: requiredKeySchema }}
                        >
                          {(field) => (
                            <TextField
                              label='Client Key Production'
                              type='text'
                              placeholder='Mid-client-...'
                            />
                          )}
                        </form.AppField>
                        <form.AppField
                          name='productionServerKey'
                          validators={{ onBlur: requiredKeySchema }}
                        >
                          {(field) => (
                            <TextField
                              label='Server Key Production'
                              type={showProductionKey ? 'text' : 'password'}
                              placeholder='Mid-server-...'
                              rightElement={
                                <button
                                  type='button'
                                  tabIndex={-1}
                                  onClick={() => setShowProductionKey(!showProductionKey)}
                                  className='cursor-pointer text-muted-foreground hover:text-foreground transition-colors'
                                >
                                  {showProductionKey ? (
                                    <Icons.eyeOff className='h-4 w-4' />
                                  ) : (
                                    <Icons.eye className='h-4 w-4' />
                                  )}
                                </button>
                              }
                            />
                          )}
                        </form.AppField>
                      </div>
                    )
                  }
                </form.Subscribe>
              </form.Form>
            </form.AppForm>
          </CardContent>
          <CardFooter className='justify-between border-t'>
            <p className='flex items-center gap-1.5 text-xs text-muted-foreground'>
              <Icons.lock className='h-3.5 w-3.5' />
              Kredensial dienkripsi sebelum dikirim
            </p>
            <Button
              type='submit'
              form='midtrans-settings-form'
              isLoading={isSubmitting}
              disabled={isLoading}
            >
              <Icons.check className='mr-1.5 h-4 w-4' />
              Simpan
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* ────── Sidebar ────── */}
      <div className='flex flex-col gap-6'>
        {/* Status Card */}
        <Card className='rounded-2xl border-border/70 shadow-sm'>
          <CardHeader>
            <CardTitle className='text-sm font-semibold'>Status Konfigurasi</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <span
                  className={cn(
                    'inline-block h-2 w-2 rounded-full',
                    sandboxConfigured ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                  )}
                />
                <span className='text-sm'>Sandbox</span>
              </div>
              {sandboxConfigured ? (
                <span className='flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400'>
                  <Icons.check className='h-3.5 w-3.5' />
                  Lengkap
                </span>
              ) : (
                <span className='text-xs text-muted-foreground'>Belum diatur</span>
              )}
            </div>
            <Separator />
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <span
                  className={cn(
                    'inline-block h-2 w-2 rounded-full',
                    productionConfigured ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                  )}
                />
                <span className='text-sm'>Production</span>
              </div>
              {productionConfigured ? (
                <span className='flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400'>
                  <Icons.check className='h-3.5 w-3.5' />
                  Lengkap
                </span>
              ) : (
                <span className='text-xs text-muted-foreground'>Belum diatur</span>
              )}
            </div>
            <Separator />
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>Lingkungan Aktif</span>
              <Badge variant='secondary' className='text-xs font-medium'>
                {env === 'sandbox' ? 'Sandbox' : 'Production'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Guide Card */}
        <Card className='rounded-2xl border-border/70 shadow-sm'>
          <CardHeader>
            <CardTitle className='text-sm font-semibold'>Panduan</CardTitle>
            <CardDescription>Cara mendapatkan API key Midtrans</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <ol className='space-y-3 text-sm'>
              <li className='flex gap-3'>
                <span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary'>
                  1
                </span>
                <span className='text-muted-foreground'>
                  Login ke{' '}
                  <a
                    href='https://dashboard.midtrans.com'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='font-medium text-primary hover:underline'
                  >
                    dashboard Midtrans
                  </a>
                </span>
              </li>
              <li className='flex gap-3'>
                <span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary'>
                  2
                </span>
                <span className='text-muted-foreground'>
                  Pilih lingkungan (Sandbox / Production)
                </span>
              </li>
              <li className='flex gap-3'>
                <span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary'>
                  3
                </span>
                <span className='text-muted-foreground'>
                  Buka <strong>Setelan &rarr; Kunci Akses</strong>
                </span>
              </li>
              <li className='flex gap-3'>
                <span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary'>
                  4
                </span>
                <span className='text-muted-foreground'>
                  Salin Merchant ID, Client Key & Server Key
                </span>
              </li>
            </ol>
            <Button variant='outline' size='sm' className='w-full rounded-xl' asChild>
              <a href='https://dashboard.midtrans.com' target='_blank' rel='noopener noreferrer'>
                <Icons.externalLink className='mr-2 h-4 w-4' />
                Buka Dashboard Midtrans
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
