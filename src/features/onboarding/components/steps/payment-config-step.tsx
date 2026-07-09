import { Icons } from '@/components/icons';
import { Heading } from '@/components/ui/heading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFormFields } from '@/components/ui/tanstack-form';
import { paymentGatewaySchema, requiredKeySchema } from '../../schemas/onboarding';

interface StepProps {
  form: any;
}

export function PaymentConfigStep({ form }: StepProps) {
  const { FormTextField } = useFormFields<any>();

  return (
    <div className='flex flex-col gap-8'>
      <Heading
        title='Gateway Pembayaran'
        description='Hubungkan akun Midtrans Anda untuk mulai menerima pembayaran dari member komunitas secara aman.'
      />

      <Alert className='bg-muted/40 [&>svg]:mt-0.5'>
        <Icons.info className='text-primary' />
        <AlertTitle>Di mana menemukan API key?</AlertTitle>
        <AlertDescription className='flex flex-col gap-4'>
          <div>
            <p className='mb-2'>
              Masuk ke dashboard Midtrans, pilih lingkungan Anda, lalu buka
              <strong>Setelan &rarr; Kunci Akses</strong>.
            </p>
            <a
              href='https://dashboard.midtrans.com'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-1 font-medium text-primary hover:underline'
            >
              Buka Dashboard Midtrans
              <Icons.externalLink className='size-3.5' />
            </a>
          </div>

          <div className='group relative flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden rounded-md border border-border bg-background/50 shadow-sm transition-colors hover:bg-background/80'>
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='flex size-12 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition-transform group-hover:scale-110'>
                <Icons.play className='ml-1 size-5 fill-primary text-primary' />
              </div>
            </div>
            <span className='absolute bottom-3 right-3 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-foreground backdrop-blur'>
              0:15
            </span>
            <p className='absolute left-3 top-3 text-xs font-medium text-muted-foreground'>
              [Video/GIF: Kunci API Midtrans]
            </p>
          </div>
        </AlertDescription>
      </Alert>

      <div className='flex flex-col gap-5'>
        <h4 className='text-lg font-semibold'>Kunci API Midtrans</h4>
        <p className='text-sm text-muted-foreground'>
          Masukkan kunci sandbox atau produksi Midtrans Anda untuk mengaktifkan pemrosesan
          pembayaran.
        </p>

        <form.AppField
          name='midtransEnvironment'
          validators={{
            onChange: paymentGatewaySchema.shape.midtransEnvironment
          }}
        >
          {(field: any) => (
            <div className='flex flex-col gap-2'>
              <Label className='text-sm font-medium'>Lingkungan</Label>
              <Tabs value={field.state.value} onValueChange={(v) => field.handleChange(v)}>
                <TabsList>
                  <TabsTrigger value='sandbox'>Uji Coba</TabsTrigger>
                  <TabsTrigger value='production'>Produksi (Langsung)</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}
        </form.AppField>

        <form.Subscribe selector={(state: any) => state.values.midtransEnvironment}>
          {(env: 'sandbox' | 'production') => {
            const envLabel = env === 'sandbox' ? 'Uji Coba' : 'Produksi';

            return (
              <div className='mt-6 flex flex-col gap-4 rounded-lg border border-border p-5'>
                <h5 className='mb-2 text-sm font-semibold capitalize text-foreground'>
                  Kredensial {envLabel}
                </h5>

                {env === 'sandbox' ? (
                  <>
                    <FormTextField
                      name='sandboxMerchantId'
                      label='Merchant ID (Uji Coba)'
                      placeholder='mis. G-xxxx...'
                      validators={{ onChange: requiredKeySchema }}
                    />
                    <FormTextField
                      name='sandboxClientKey'
                      label='Client Key (Uji Coba)'
                      placeholder='mis. SB-Mid-client-...'
                      validators={{ onChange: requiredKeySchema }}
                    />
                    <FormTextField
                      name='sandboxServerKey'
                      label='Server Key (Uji Coba)'
                      placeholder='mis. SB-Mid-server-...'
                      validators={{ onChange: requiredKeySchema }}
                    />
                  </>
                ) : (
                  <>
                    <FormTextField
                      name='productionMerchantId'
                      label='Merchant ID (Produksi)'
                      placeholder='mis. G-xxxx...'
                      validators={{ onChange: requiredKeySchema }}
                    />
                    <FormTextField
                      name='productionClientKey'
                      label='Client Key (Produksi)'
                      placeholder='mis. Mid-client-...'
                      validators={{ onChange: requiredKeySchema }}
                    />
                    <FormTextField
                      name='productionServerKey'
                      label='Server Key (Produksi)'
                      placeholder='mis. Mid-server-...'
                      validators={{ onChange: requiredKeySchema }}
                    />
                  </>
                )}
              </div>
            );
          }}
        </form.Subscribe>

        <div className='flex items-center gap-1 px-1 text-xs text-muted-foreground'>
          <Icons.lock className='size-3.5' />
          <span>Key dienkripsi dan disimpan dengan aman</span>
        </div>
      </div>
    </div>
  );
}
