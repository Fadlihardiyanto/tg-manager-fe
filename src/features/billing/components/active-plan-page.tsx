'use client';

import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Icons } from '@/components/icons';
import { formatDate } from '@/lib/format';
import { useActivePlan } from './active-plan-provider';

const quotaItems = [
  { key: 'bots', label: 'Bots', description: 'Jumlah bot Telegram yang masih bisa dikelola.' },
  { key: 'groups', label: 'Groups', description: 'Jumlah grup Telegram yang bisa dihubungkan.' },
  { key: 'packages', label: 'Packages', description: 'Jumlah package yang bisa dibuat.' },
  { key: 'members', label: 'Members', description: 'Total member aktif yang bisa disimpan.' },
  {
    key: 'custom_commands',
    label: 'Custom Commands',
    description: 'Jumlah command kustom yang bisa dipakai.'
  },
  {
    key: 'broadcasts',
    label: 'Broadcasts',
    description: 'Kuota broadcast yang tersedia pada periode aktif.'
  }
] as const;

const featureItems = [
  { key: 'allow_media_broadcast', label: 'Media Broadcast' },
  { key: 'allow_discount_system', label: 'Discount System' },
  { key: 'allow_reports_export', label: 'Reports Export' },
  { key: 'allow_high_priority', label: 'High Priority Queue' }
] as const;

function formatBillingCycle(cycle: string) {
  if (cycle === 'monthly') return 'Bulanan';
  if (cycle === 'yearly') return 'Tahunan';
  return cycle;
}

export function ActivePlanPage() {
  const { billing, plan, usage, isLoading, canUseFeature, getQuota } = useActivePlan();

  if (isLoading) {
    return (
      <div className='grid gap-4 lg:grid-cols-[1.4fr_1fr]'>
        <div className='rounded-xl border bg-card p-6'>
          <div className='bg-muted h-7 w-40 animate-pulse rounded' />
          <div className='bg-muted mt-3 h-4 w-64 animate-pulse rounded' />
          <div className='bg-muted mt-6 h-24 animate-pulse rounded' />
        </div>
        <div className='rounded-xl border bg-card p-6'>
          <div className='bg-muted h-7 w-32 animate-pulse rounded' />
          <div className='bg-muted mt-3 h-4 w-40 animate-pulse rounded' />
          <div className='bg-muted mt-6 h-24 animate-pulse rounded' />
        </div>
      </div>
    );
  }

  if (!billing || !plan || !usage) {
    return (
      <Alert>
        <Icons.warning />
        <AlertTitle>Plan aktif belum tersedia</AlertTitle>
        <AlertDescription>
          Data billing tenant belum bisa ditampilkan sekarang. Coba lagi beberapa saat.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 lg:grid-cols-[1.4fr_1fr]'>
        <Card>
          <CardHeader>
            <div className='flex flex-wrap items-center gap-3'>
              <CardTitle>Plan Tenant Aktif</CardTitle>
              <Badge variant='secondary'>{plan.display_name}</Badge>
              <Badge variant='outline'>{formatBillingCycle(billing.billing_cycle)}</Badge>
            </div>
            <CardDescription>
              Ringkasan paket aktif tenant beserta masa berlaku dan fitur yang tersedia.
            </CardDescription>
          </CardHeader>
          <CardContent className='grid gap-4 md:grid-cols-2'>
            <div className='rounded-lg border p-4'>
              <p className='text-sm text-muted-foreground'>Status</p>
              <p className='mt-1 text-lg font-semibold capitalize'>{billing.status}</p>
            </div>
            <div className='rounded-lg border p-4'>
              <p className='text-sm text-muted-foreground'>Billing Cycle</p>
              <p className='mt-1 text-lg font-semibold'>
                {formatBillingCycle(billing.billing_cycle)}
              </p>
            </div>
            <div className='rounded-lg border p-4'>
              <p className='text-sm text-muted-foreground'>Mulai Aktif</p>
              <p className='mt-1 text-lg font-semibold'>{formatDate(billing.started_at)}</p>
            </div>
            <div className='rounded-lg border p-4'>
              <p className='text-sm text-muted-foreground'>Berakhir Pada</p>
              <p className='mt-1 text-lg font-semibold'>{formatDate(billing.expired_at)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upgrade Plan</CardTitle>
            <CardDescription>
              Saat kuota mulai penuh, upgrade plan supaya operasional tenant tetap jalan.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground'>
              Upgrade bisa membantu menambah limit bot, member, package, command, dan broadcast.
            </div>
            <div className='space-y-2'>
              {featureItems.map((feature) => (
                <div key={feature.key} className='flex items-center justify-between text-sm'>
                  <span>{feature.label}</span>
                  <Badge variant={canUseFeature(feature.key) ? 'secondary' : 'outline'}>
                    {canUseFeature(feature.key) ? 'Aktif' : 'Belum aktif'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className='flex flex-col items-stretch gap-2'>
            <Button asChild>
              <Link href='https://t.me/UrationSupportBot' target='_blank' rel='noreferrer'>
                <Icons.telegram className='h-4 w-4' />
                Upgrade Plan
              </Link>
            </Button>
            <p className='text-xs text-muted-foreground'>
              Tombol ini membuka support Telegram yang sudah dipakai di project untuk proses
              upgrade.
            </p>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quota Tersedia</CardTitle>
          <CardDescription>
            Detail penggunaan dan sisa kuota tenant untuk setiap resource utama.
          </CardDescription>
        </CardHeader>
        <CardContent className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {quotaItems.map((item) => {
            const quota = getQuota(item.key);
            if (!quota) return null;

            return (
              <div key={item.key} className='rounded-lg border p-4'>
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <h3 className='font-medium'>{item.label}</h3>
                    <p className='mt-1 text-sm text-muted-foreground'>{item.description}</p>
                  </div>
                  <Badge variant={quota.hasQuota ? 'secondary' : 'destructive'}>
                    {quota.isUnlimited ? 'Unlimited' : `${quota.remaining} tersisa`}
                  </Badge>
                </div>
                <Separator className='my-4' />
                <div className='space-y-2 text-sm'>
                  <div className='flex items-center justify-between'>
                    <span className='text-muted-foreground'>Terpakai</span>
                    <span className='font-medium tabular-nums'>{quota.used}</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-muted-foreground'>Limit</span>
                    <span className='font-medium tabular-nums'>
                      {quota.isUnlimited ? 'Unlimited' : quota.limit}
                    </span>
                  </div>
                </div>
                {!quota.isUnlimited && <Progress className='mt-4' value={quota.percentage} />}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
