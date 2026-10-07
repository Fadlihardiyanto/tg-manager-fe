'use client';

import { z } from 'zod';
import { toast } from 'sonner';
import { useStore } from '@tanstack/react-form';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppForm } from '@/components/ui/tanstack-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { TextField } from '@/components/forms/fields';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';
import {
  initiatePaymentKeyExchange,
  updateEncryptedPaymentSettings,
  updatePaymentSettings
} from '@/features/onboarding/api/service';
import {
  paymentSettingsKeys,
  paymentSettingsQueryOptions
} from '@/features/onboarding/api/queries';
import { encryptPaymentCredentials } from '../lib/payment-credential-crypto';

const midtransSettingsSchema = z.object({
  midtransEnvironment: z.enum(['sandbox', 'production']),
  sandboxMerchantId: z.string().optional(),
  sandboxClientKey: z.string().optional(),
  sandboxServerKey: z.string().optional(),
  productionMerchantId: z.string().optional(),
  productionClientKey: z.string().optional(),
  productionServerKey: z.string().optional()
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
  const [showSwitchDialog, setShowSwitchDialog] = useState(false);
  const [pendingEnvironment, setPendingEnvironment] = useState<'sandbox' | 'production' | null>(
    null
  );

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

  // Environment switch mutation
  const switchEnvironmentMutation = useMutation({
    mutationFn: (isSandbox: boolean) => updatePaymentSettings({ is_sandbox: isSandbox }),
    onSuccess: (res, isSandbox) => {
      if (res.success) {
        toast.success(`Berhasil switch ke ${isSandbox ? 'Sandbox' : 'Production'}`);
        void queryClient.invalidateQueries({ queryKey: paymentSettingsKeys.all });
        setShowSwitchDialog(false);
        setPendingEnvironment(null);
      } else {
        toast.error(res.message || 'Gagal mengganti environment');
      }
    },
    onError: () => {
      toast.error('Gagal mengganti environment');
      setShowSwitchDialog(false);
      setPendingEnvironment(null);
    }
  });

  const handleEnvironmentSwitch = (newEnv: 'sandbox' | 'production') => {
    // Check if target environment is configured
    const isConfigured = newEnv === 'sandbox' ? sandboxConfigured : productionConfigured;

    if (!isConfigured) {
      toast.error(`Kredensial ${newEnv === 'sandbox' ? 'Sandbox' : 'Production'} belum lengkap`);
      return;
    }

    setPendingEnvironment(newEnv);
    setShowSwitchDialog(true);
  };

  const confirmSwitch = () => {
    if (pendingEnvironment) {
      switchEnvironmentMutation.mutate(pendingEnvironment === 'sandbox');
    }
  };

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
            sandbox_merchant_id: editableSecret(value.sandboxMerchantId),
            sandbox_server_key: editableSecret(value.sandboxServerKey),
            sandbox_client_key: editableSecret(value.sandboxClientKey),
            production_merchant_id: editableSecret(value.productionMerchantId),
            production_server_key: editableSecret(value.productionServerKey),
            production_client_key: editableSecret(value.productionClientKey)
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

  return (
    <div className='w-full'>
      <Card className='rounded-2xl border-border/70'>
        <CardHeader>
          <CardTitle>Kredensial Midtrans</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Section: Environment */}
          <div className='space-y-4'>
            <p className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
              Environment
            </p>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    settings?.is_sandbox
                      ? 'bg-sky-500/10 ring-1 ring-sky-500/20'
                      : 'bg-violet-500/10 ring-1 ring-violet-500/20'
                  )}
                >
                  {settings?.is_sandbox ? (
                    <Icons.flask className='h-5 w-5 text-sky-600 dark:text-sky-400' />
                  ) : (
                    <Icons.rocket className='h-5 w-5 text-violet-600 dark:text-violet-400' />
                  )}
                </div>
                <div>
                  <p className='text-sm font-semibold'>
                    {settings?.is_sandbox ? 'Sandbox' : 'Production'}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {settings?.is_sandbox ? 'Environment uji coba' : 'Environment live'}
                  </p>
                </div>
              </div>
            </div>
            <div className='space-y-3'>
              <Label className='text-xs font-medium text-muted-foreground'>Switch ke:</Label>
              <div className='flex flex-col gap-2 sm:flex-row sm:gap-3'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  disabled={settings?.is_sandbox === true || switchEnvironmentMutation.isPending}
                  onClick={() => handleEnvironmentSwitch('sandbox')}
                  className={cn(
                    'justify-start gap-2 sm:flex-1',
                    !settings?.is_sandbox &&
                      sandboxConfigured &&
                      'border-sky-500/30 bg-sky-500/5 hover:bg-sky-500/10'
                  )}
                >
                  <Icons.flask className='h-4 w-4 text-sky-600 dark:text-sky-400' />
                  Sandbox
                  {!sandboxConfigured && (
                    <Badge variant='outline' className='ml-auto text-[10px]'>
                      Belum lengkap
                    </Badge>
                  )}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  disabled={settings?.is_sandbox === false || switchEnvironmentMutation.isPending}
                  onClick={() => handleEnvironmentSwitch('production')}
                  className={cn(
                    'justify-start gap-2 sm:flex-1',
                    settings?.is_sandbox &&
                      productionConfigured &&
                      'border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/10'
                  )}
                >
                  <Icons.rocket className='h-4 w-4 text-violet-600 dark:text-violet-400' />
                  Production
                  {!productionConfigured && (
                    <Badge variant='outline' className='ml-auto text-[10px]'>
                      Belum lengkap
                    </Badge>
                  )}
                </Button>
              </div>
              {switchEnvironmentMutation.isPending && (
                <p className='text-xs text-muted-foreground flex items-center gap-1.5'>
                  <Icons.spinner className='h-3 w-3 animate-spin' />
                  Mengganti environment...
                </p>
              )}
            </div>
          </div>

          <Separator />

          <form.AppForm>
            <form.Form id='midtrans-settings-form' className='mx-0 gap-5 p-0'>
              <p className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                Kredensial API
              </p>
              <div className='grid gap-5 sm:grid-cols-2'>
                <form.AppField name='sandboxMerchantId'>
                  {(field) => (
                    <TextField label='Merchant ID Sandbox' type='text' placeholder='G123456789' />
                  )}
                </form.AppField>
                <form.AppField name='sandboxClientKey'>
                  {(field) => (
                    <TextField
                      label='Client Key Sandbox'
                      type='text'
                      placeholder='SB-Mid-client-...'
                    />
                  )}
                </form.AppField>
                <div className='sm:col-span-2'>
                  <form.AppField name='sandboxServerKey'>
                    {(field) => (
                      <TextField
                        label='Server Key Sandbox'
                        type={showSandboxKey ? 'text' : 'password'}
                        placeholder='SB-Mid-server-...'
                        rightElement={
                          <button
                            type='button'
                            tabIndex={-1}
                            aria-label={
                              showSandboxKey ? 'Sembunyikan Server Key' : 'Tampilkan Server Key'
                            }
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
                <form.AppField name='productionMerchantId'>
                  {(field) => (
                    <TextField
                      label='Merchant ID Production'
                      type='text'
                      placeholder='G123456789'
                    />
                  )}
                </form.AppField>
                <form.AppField name='productionClientKey'>
                  {(field) => (
                    <TextField
                      label='Client Key Production'
                      type='text'
                      placeholder='Mid-client-...'
                    />
                  )}
                </form.AppField>
                <div className='sm:col-span-2'>
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
                            aria-label={
                              showProductionKey ? 'Sembunyikan Server Key' : 'Tampilkan Server Key'
                            }
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
              </div>
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

      {/* Confirmation Dialog */}
      <AlertDialog open={showSwitchDialog} onOpenChange={setShowSwitchDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch Environment?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan switch ke{' '}
              <strong className='text-foreground'>
                {pendingEnvironment === 'sandbox' ? 'Sandbox' : 'Production'}
              </strong>
              .
              {pendingEnvironment === 'production' && (
                <span className='block mt-2 text-amber-600 dark:text-amber-400 font-medium'>
                  Production environment akan memproses transaksi nyata dengan uang asli.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={switchEnvironmentMutation.isPending}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSwitch}
              disabled={switchEnvironmentMutation.isPending}
              className={cn(
                pendingEnvironment === 'production'
                  ? 'bg-violet-600 hover:bg-violet-700'
                  : 'bg-sky-600 hover:bg-sky-700'
              )}
            >
              {switchEnvironmentMutation.isPending ? (
                <>
                  <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
                  Mengganti...
                </>
              ) : (
                <>
                  {pendingEnvironment === 'production' ? (
                    <Icons.rocket className='mr-2 h-4 w-4' />
                  ) : (
                    <Icons.flask className='mr-2 h-4 w-4' />
                  )}
                  Switch ke {pendingEnvironment === 'sandbox' ? 'Sandbox' : 'Production'}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
