import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { scrollToFirstError } from '@/components/ui/form-context';

interface StepProps {
  form: any;
  onBack: () => void;
  botUsername: string | null;
}

export function ReviewStep({ form, onBack, botUsername }: StepProps) {
  return (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col items-center text-center'>
        <div className='mb-4 inline-flex size-14 items-center justify-center rounded-full bg-emerald-500/10 ring-4 ring-emerald-500/5'>
          <Icons.circleCheck className='size-7' />
        </div>
        <h2 className='text-2xl font-bold tracking-tight sm:text-3xl'>Tinjau Konfigurasi Anda</h2>
        <p className='mt-1 max-w-md text-sm text-muted-foreground'>
          Semuanya sudah siap. Tinjau pengaturan Anda di bawah ini sebelum masuk ke dashboard.
        </p>
      </div>

      <form.Subscribe
        selector={(state: any) => ({
          businessName: state.values.businessName,
          businessSlug: state.values.businessSlug,
          category: state.values.category,
          botToken: state.values.botToken,
          sandboxServerKey: state.values.sandboxServerKey,
          productionServerKey: state.values.productionServerKey
        })}
      >
        {(values: {
          businessName: string;
          businessSlug: string;
          category: string;
          botToken: string;
          sandboxServerKey: string;
          productionServerKey: string;
        }) => (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <Card className='shadow-sm transition-all hover:border-foreground/20 hover:shadow-md'>
              <CardHeader className='pb-3'>
                <div className='flex items-center gap-2'>
                  <div className='flex size-8 items-center justify-center rounded-lg bg-primary/10'>
                    <Icons.building className='size-4 text-primary' />
                  </div>
                  <CardTitle className='text-sm font-semibold'>Detail Ruang Kerja</CardTitle>
                </div>
              </CardHeader>
              <CardContent className='flex flex-col gap-3'>
                <div className='flex items-center gap-3'>
                  <div className='flex size-8 shrink-0 items-center justify-center rounded bg-muted/50'>
                    <Icons.building className='size-4 text-muted-foreground' />
                  </div>
                  <div className='min-w-0'>
                    <p className='text-xs text-muted-foreground'>Nama Bisnis</p>
                    <p className='truncate text-sm font-medium'>{values.businessName || '—'}</p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='flex size-8 shrink-0 items-center justify-center rounded bg-muted/50'>
                    <Icons.link className='size-4 text-muted-foreground' />
                  </div>
                  <div className='min-w-0'>
                    <p className='text-xs text-muted-foreground'>Slug Tautan</p>
                    <p className='truncate font-mono text-xs font-medium'>
                      tg.app/{values.businessSlug || '—'}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='flex size-8 shrink-0 items-center justify-center rounded bg-muted/50'>
                    <Icons.tag className='size-4 text-muted-foreground' />
                  </div>
                  <div className='min-w-0'>
                    <p className='text-xs text-muted-foreground'>Kategori</p>
                    <p className='truncate text-sm font-medium capitalize'>
                      {values.category ? values.category.replace(/_/g, ' ') : '—'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='shadow-sm transition-all hover:border-foreground/20 hover:shadow-md'>
              <CardHeader className='pb-3'>
                <div className='flex items-center gap-2'>
                  <div className='flex size-8 items-center justify-center rounded-lg bg-sky-500/10'>
                    <Icons.bot className='size-4' />
                  </div>
                  <CardTitle className='text-sm font-semibold'>Bot Telegram</CardTitle>
                </div>
              </CardHeader>
              <CardContent className='flex flex-col gap-3'>
                <div className='flex items-center gap-3'>
                  <div className='flex size-8 shrink-0 items-center justify-center rounded bg-muted/50'>
                    <Icons.bot className='size-4 text-muted-foreground' />
                  </div>
                  <div className='min-w-0'>
                    <p className='text-xs text-muted-foreground'>Username Bot</p>
                    <p className='truncate font-mono text-xs font-medium'>
                      {values.botToken ? (
                        botUsername || '—'
                      ) : (
                        <span className='text-muted-foreground/60'>—</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='flex size-8 shrink-0 items-center justify-center rounded bg-muted/50'>
                      <Icons.shieldLock className='size-4 text-muted-foreground' />
                    </div>
                    <p className='text-xs text-muted-foreground'>Status Koneksi</p>
                  </div>
                  {values.botToken ? (
                    <Badge
                      variant='default'
                      className='bg-primary/10 text-primary border-transparent'
                    >
                      <span className='mr-1 inline-block size-1.5 rounded-full bg-primary' />
                      Terhubung
                    </Badge>
                  ) : (
                    <Badge variant='secondary'>Belum Terhubung</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className='shadow-sm transition-all hover:border-foreground/20 hover:shadow-md sm:col-span-2'>
              <CardHeader className='pb-3'>
                <div className='flex items-center gap-2'>
                  <div className='flex size-8 items-center justify-center rounded-lg bg-amber-500/10'>
                    <Icons.coin className='size-4' />
                  </div>
                  <CardTitle className='text-sm font-semibold'>Gateway Pembayaran</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div className='flex items-center justify-between rounded-lg border border-border bg-card p-3'>
                    <div className='flex items-center gap-3'>
                      <div className='flex size-8 shrink-0 items-center justify-center rounded bg-muted/50'>
                        <Icons.server className='size-4 text-muted-foreground' />
                      </div>
                      <div>
                        <p className='text-sm font-medium'>Uji Coba</p>
                        <p className='text-xs text-muted-foreground'>Pengujian & pengembangan</p>
                      </div>
                    </div>
                    {values.sandboxServerKey ? (
                      <Badge
                        variant='default'
                        className='bg-primary/10 text-primary border-transparent'
                      >
                        <span className='mr-1 inline-block size-1.5 rounded-full bg-primary' />
                        Aktif
                      </Badge>
                    ) : (
                      <Badge variant='secondary'>Belum Dikonfigurasi</Badge>
                    )}
                  </div>
                  <div className='flex items-center justify-between rounded-lg border border-border bg-card p-3'>
                    <div className='flex items-center gap-3'>
                      <div className='flex size-8 shrink-0 items-center justify-center rounded bg-muted/50'>
                        <Icons.server className='size-4 text-muted-foreground' />
                      </div>
                      <div>
                        <p className='text-sm font-medium'>Produksi</p>
                        <p className='text-xs text-muted-foreground'>Transaksi langsung</p>
                      </div>
                    </div>
                    {values.productionServerKey ? (
                      <Badge
                        variant='default'
                        className='bg-primary/10 text-primary border-transparent'
                      >
                        <span className='mr-1 inline-block size-1.5 rounded-full bg-primary' />
                        Aktif
                      </Badge>
                    ) : (
                      <Badge variant='secondary'>Belum Dikonfigurasi</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </form.Subscribe>

      <div className='flex items-center justify-center gap-4 pt-2'>
        <Button type='button' variant='outline' className='min-w-[120px]' onClick={onBack}>
          <Icons.arrowLeft />
          Kembali
        </Button>
        <Button
          type='button'
          size='lg'
          className='min-w-[200px]'
          onClick={(e) => {
            e.preventDefault();
            form.handleSubmit();
            scrollToFirstError();
          }}
        >
          Ke Dashboard
          <Icons.arrowRight />
        </Button>
      </div>
    </div>
  );
}
