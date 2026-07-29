import { cn } from '@/lib/utils';

// -- Payment: QRIS checkout mock --
const PaymentMock = () => (
  <div className='flex flex-col gap-3 p-6'>
    <div className='flex items-center justify-between'>
      <div>
        <p className='text-sm font-semibold'>Paket Premium</p>
        <p className='text-xs text-muted-foreground'>1 bulan akses penuh</p>
      </div>
      <span className='text-sm font-bold'>Rp 199.000</span>
    </div>
    <div className='flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-2.5'>
      <span className='flex size-5 items-center justify-center rounded bg-sky-500 text-[10px] font-bold text-white'>
        Q
      </span>
      <span className='text-xs font-medium'>QRIS</span>
      <span className='ml-auto rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-600'>
        Cepat
      </span>
    </div>
    <div className='flex items-center gap-2 rounded-lg border border-border/40 bg-background px-3 py-2.5 opacity-60'>
      <span className='flex size-5 items-center justify-center rounded bg-violet-500 text-[10px] font-bold text-white'>
        VA
      </span>
      <span className='text-xs'>Virtual Account</span>
    </div>
    <div className='mt-1 rounded-lg bg-primary py-2 text-center text-xs font-semibold text-primary-foreground'>
      Bayar Sekarang
    </div>
  </div>
);

// -- Gatekeeping: bot + connected groups mock --
const GatekeepingMock = () => (
  <div className='flex flex-col gap-3 p-6'>
    <div className='flex items-center gap-2.5'>
      <div className='relative shrink-0'>
        <div className='flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20'>
          <svg
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='size-5 text-primary'
          >
            <rect x='3' y='3' width='18' height='14' rx='2' />
            <path d='M12 17v3' />
            <path d='M8 21h8' />
            <path d='M9 9h.01' />
            <path d='M15 9h.01' />
          </svg>
        </div>
        <span className='absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background bg-emerald-500' />
      </div>
      <div>
        <p className='text-sm font-semibold'>@guardBot</p>
        <p className='text-xs text-muted-foreground'>Gatekeeper</p>
      </div>
      <span className='ml-auto rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600'>
        Terproteksi
      </span>
    </div>
    <div className='flex flex-col gap-2'>
      {['Grup Premium', 'Grup VIP'].map((name, i) => (
        <div
          key={name}
          className='flex items-center gap-2 rounded-lg border border-border/40 bg-background px-3 py-2'
        >
          <svg
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='size-4 text-muted-foreground'
          >
            <path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' />
            <circle cx='9' cy='7' r='4' />
            <path d='M23 21v-2a4 4 0 0 0-3-3.87' />
            <path d='M16 3.13a4 4 0 0 1 0 7.75' />
          </svg>
          <span className='text-xs'>{name}</span>
          <span className='ml-auto text-[11px] text-muted-foreground'>{[128, 45][i]} member</span>
        </div>
      ))}
    </div>
  </div>
);

// -- Revenue: mini bar chart mock --
const RevenueMock = () => {
  const bars = [35, 48, 62, 55, 78, 94];
  return (
    <div className='flex flex-col gap-3 p-6'>
      <div className='flex items-center justify-between'>
        <span className='text-xs text-muted-foreground'>Pendapatan Bulan Ini</span>
        <span className='rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600'>
          ↑ 18%
        </span>
      </div>
      <p className='text-lg font-bold'>Rp 12.500.000</p>
      <div className='flex items-end gap-1.5 h-20'>
        {bars.map((h, i) => (
          <div key={i} className='flex-1 flex flex-col justify-end gap-1'>
            <div className='w-full rounded-sm bg-primary/25' style={{ height: `${h}%` }} />
            <span className='text-[9px] text-muted-foreground text-center'>
              {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'][i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// -- Kick: member list with expired mock --
const KickMock = () => (
  <div className='flex flex-col gap-3 p-6'>
    <div className='flex items-center justify-between'>
      <span className='text-xs font-medium text-foreground'>Status Member</span>
      <span className='text-[11px] text-muted-foreground'>12 member</span>
    </div>
    <div className='flex flex-col gap-1.5'>
      {[
        { name: '@user_rizal', active: true },
        { name: '@user_ayu', active: true },
        { name: '@user_bagas', active: false },
        { name: '@user_dian', active: false }
      ].map((m) => (
        <div key={m.name} className='flex items-center gap-2 rounded-md bg-background px-3 py-1.5'>
          <span
            className={cn('size-1.5 rounded-full', m.active ? 'bg-emerald-500' : 'bg-red-400')}
          />
          <span className={cn('text-xs', !m.active && 'text-muted-foreground/60 line-through')}>
            {m.name}
          </span>
          <span
            className={cn(
              'ml-auto text-[10px] font-medium',
              m.active ? 'text-emerald-600' : 'text-red-500'
            )}
          >
            {m.active ? 'Aktif' : 'Kedaluwarsa'}
          </span>
        </div>
      ))}
    </div>
    <div className='rounded-md bg-amber-500/10 px-3 py-2 text-center'>
      <p className='text-[11px] font-medium text-amber-700'>Auto-kick dalam hitungan milidetik</p>
    </div>
  </div>
);

// -- Analytics: mini line chart + MRR mock --
const AnalyticsMock = () => (
  <div className='flex flex-col gap-3 p-6'>
    <div className='flex items-center justify-between'>
      <div>
        <p className='text-xs text-muted-foreground'>MRR</p>
        <p className='text-lg font-bold'>Rp 8.200.000</p>
      </div>
      <span className='rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600'>
        ↑ 12%
      </span>
    </div>
    <div className='relative h-16'>
      <svg viewBox='0 0 200 60' className='h-full w-full' preserveAspectRatio='none'>
        <defs>
          <linearGradient id='analyticsGrad' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor='hsl(var(--primary))' stopOpacity='0.25' />
            <stop offset='100%' stopColor='hsl(var(--primary))' stopOpacity='0.02' />
          </linearGradient>
        </defs>
        <path
          d='M0,45 C30,46 50,38 70,30 C90,22 110,25 130,18 C150,11 170,8 200,5 L200,60 L0,60 Z'
          fill='url(#analyticsGrad)'
        />
        <path
          d='M0,45 C30,46 50,38 70,30 C90,22 110,25 130,18 C150,11 170,8 200,5'
          fill='none'
          stroke='hsl(var(--primary))'
          strokeWidth='1.5'
        />
      </svg>
    </div>
    <div className='flex items-center justify-between'>
      {['Jan', 'Mar', 'Mei'].map((m) => (
        <span key={m} className='text-[10px] text-muted-foreground'>
          {m}
        </span>
      ))}
    </div>
  </div>
);

// -- Bot: custom commands mock --
const BotMock = () => (
  <div className='flex flex-col gap-3 p-6'>
    <div className='flex items-center gap-2.5'>
      <div className='flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20'>
        <svg
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='size-5 text-primary'
        >
          <rect x='3' y='3' width='18' height='14' rx='2' />
          <path d='M12 17v3' />
          <path d='M8 21h8' />
          <path d='M9 9h.01' />
          <path d='M15 9h.01' />
        </svg>
      </div>
      <div>
        <p className='text-sm font-semibold'>@myBot</p>
        <p className='text-xs text-muted-foreground'>4 perintah kustom</p>
      </div>
      <span className='ml-auto rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600'>
        Aktif
      </span>
    </div>
    <div className='flex flex-col gap-1.5'>
      {[
        { cmd: '/signal', desc: 'Sinyal trading terbaru' },
        { cmd: '/rules', desc: 'Aturan grup & sanksi' },
        { cmd: '/info', desc: 'Info paket & harga' },
        { cmd: '/payment', desc: 'Link pembayaran' }
      ].map(({ cmd, desc }) => (
        <div key={cmd} className='flex items-center gap-2 rounded-md bg-background px-3 py-1.5'>
          <code className='text-xs font-mono font-medium text-primary'>{cmd}</code>
          <span className='text-[11px] text-muted-foreground truncate'>{desc}</span>
        </div>
      ))}
    </div>
  </div>
);

const MOCKS = {
  payment: PaymentMock,
  gatekeeping: GatekeepingMock,
  revenue: RevenueMock,
  kick: KickMock,
  analytics: AnalyticsMock,
  bot: BotMock
} as const;

export type FeatureMockVariant = keyof typeof MOCKS;

export default function FeatureMock({ variant }: { variant: FeatureMockVariant }) {
  const Component = MOCKS[variant] ?? PaymentMock;
  return <Component />;
}
