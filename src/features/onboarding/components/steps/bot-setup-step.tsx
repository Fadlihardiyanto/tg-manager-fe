import { Icons } from '@/components/icons';
import { Heading } from '@/components/ui/heading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { useFormFields } from '@/components/ui/tanstack-form';
import { telegramBotSchema } from '../../schemas/onboarding';

interface StepProps {
  form: any;
}

export function BotSetupStep({ form }: StepProps) {
  const { FormTextField } = useFormFields<any>();

  return (
    <div className='flex flex-col gap-8'>
      <Heading
        title='Hubungkan Bot Anda'
        description='Untuk mengintegrasikan workspace secara aman, masukkan token bot Telegram Anda. Langkah ini memberi izin TG-Manager untuk menangani pesan masuk dan mengotomatisasi respons atas nama Anda.'
      />

      <Alert className='bg-muted/40 [&>svg]:mt-0.5'>
        <Icons.info className='text-primary' />
        <AlertTitle>Perlu token?</AlertTitle>
        <AlertDescription className='flex flex-col gap-4'>
          <div>
            <p className='mb-2'>
              Jika Anda belum membuat bot, Anda perlu melakukannya melalui BotFather resmi Telegram.
            </p>
            <a
              href='https://t.me/BotFather'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-1 font-medium text-primary hover:underline'
            >
              Cara mendapatkan token bot
              <Icons.externalLink className='size-3.5' />
            </a>
          </div>

          <div className='flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground'>
            <Icons.info className='size-4 shrink-0' />
            <span>
              Buka{' '}
              <a
                href='https://t.me/BotFather'
                target='_blank'
                rel='noopener noreferrer'
                className='font-medium text-primary hover:underline'
              >
                @BotFather
              </a>{' '}
              di Telegram, buat bot baru, lalu salin tokennya.
            </span>
          </div>
        </AlertDescription>
      </Alert>

      <div className='flex flex-col gap-4'>
        <h4 className='text-lg font-semibold'>Token Bot Telegram</h4>
        <p className='text-sm text-muted-foreground'>
          Tempel token autentikasi yang dihasilkan oleh BotFather di Telegram.
        </p>

        <div className='relative'>
          <FormTextField
            name='botToken'
            label='Bot Token'
            required
            placeholder='contoh: 1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ'
            validators={{
              onChange: telegramBotSchema.shape.botToken
            }}
            rightElement={
              <button
                type='button'
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    form.setFieldValue('botToken', text);
                  } catch {
                    // Clipboard API not available
                  }
                }}
                className='rounded p-1 text-muted-foreground transition-colors hover:text-primary'
                title='Tempel dari clipboard'
              >
                <Icons.clipboardCopy className='size-4' />
              </button>
            }
          />
          <div className='flex items-center gap-1 px-1 text-xs text-muted-foreground'>
            <Icons.lock className='size-3.5' />
            <span>Dienkripsi saat disimpan</span>
          </div>
        </div>
      </div>

      <div>
        <h4 className='mb-4 text-lg font-semibold'>Apa yang terjadi selanjutnya?</h4>
        <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
          <Card className='shadow-sm transition-all hover:border-foreground/20 hover:shadow-md'>
            <CardContent className='flex h-full flex-col p-4'>
              <div className='mb-2 flex size-10 items-center justify-center rounded-lg border border-border bg-muted'>
                <Icons.refresh className='size-5 text-primary' />
              </div>
              <h5 className='mb-1 text-sm font-medium'>Sinkron Instan</h5>
              <p className='flex-1 text-[13px] text-muted-foreground'>
                Profil dan pengaturan bot Anda akan langsung tersinkron dengan workspace Anda.
              </p>
            </CardContent>
          </Card>
          <Card className='shadow-sm transition-all hover:border-foreground/20 hover:shadow-md'>
            <CardContent className='flex h-full flex-col p-4'>
              <div className='mb-2 flex size-10 items-center justify-center rounded-lg border border-border bg-muted'>
                <Icons.messages className='size-5 text-primary' />
              </div>
              <h5 className='mb-1 text-sm font-medium'>Rute Pesan</h5>
              <p className='flex-1 text-[13px] text-muted-foreground'>
                Percakapan yang masuk akan diarahkan langsung ke inbox tim Anda.
              </p>
            </CardContent>
          </Card>
          <Card className='shadow-sm transition-all hover:border-foreground/20 hover:shadow-md'>
            <CardContent className='flex h-full flex-col p-4'>
              <div className='mb-2 flex size-10 items-center justify-center rounded-lg border border-border bg-muted'>
                <Icons.bolt className='size-5 text-primary' />
              </div>
              <h5 className='mb-1 text-sm font-medium'>Aktifkan Fitur</h5>
              <p className='flex-1 text-[13px] text-muted-foreground'>
                Buka fitur balasan otomatis, tag, dan analitik untuk bot ini.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
