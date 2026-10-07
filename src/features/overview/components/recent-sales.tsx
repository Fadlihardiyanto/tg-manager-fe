import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { RecentOrder } from '../api/types';

function formatRp(value: string) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(parseFloat(value));
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getStatusBadgeClass(status: string) {
  const statusLower = status.toLowerCase();

  if (statusLower.includes('expired') || statusLower.includes('kadaluarsa')) {
    return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300';
  }

  if (statusLower.includes('cancel') || statusLower.includes('batal')) {
    return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300';
  }

  // Default: active/success/paid
  return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300';
}

export function RecentSales({ data }: { data: RecentOrder[] }) {
  return (
    <Card className='h-full overflow-hidden border-border/70'>
      <CardHeader className='border-b bg-muted/20'>
        <CardTitle className='text-base'>Pesanan Terbaru</CardTitle>
        <CardDescription>{data.length} transaksi terakhir</CardDescription>
      </CardHeader>
      <CardContent className='pt-5'>
        <div className='space-y-3'>
          {data.map((order) => (
            <div
              key={order.id}
              className='group flex items-center rounded-lg p-2 transition-colors hover:bg-muted/35'
            >
              <Avatar className='h-10 w-10 border shadow-xs'>
                <AvatarFallback className='bg-primary/10 text-primary text-xs font-semibold'>
                  {initials(order.member_name)}
                </AvatarFallback>
              </Avatar>
              <div className='ml-4 flex-1 space-y-1'>
                <p className='text-sm leading-none font-medium'>{order.member_name}</p>
                <p className='text-muted-foreground text-xs'>
                  @{order.member_username} &middot; {order.package_name}
                </p>
                <p className='text-muted-foreground text-xs truncate'>
                  <span
                    className='inline-block max-w-[14ch] truncate align-bottom'
                    title={order.external_id}
                  >
                    {order.external_id}
                  </span>{' '}
                  &middot; {formatDate(order.created_at)}
                </p>
              </div>
              <div className='ml-auto text-right'>
                <p className='text-sm font-medium'>{formatRp(order.amount)}</p>
                <Badge
                  variant='outline'
                  className={cn('text-xs', getStatusBadgeClass(order.status))}
                >
                  {order.status}
                </Badge>
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <p className='text-muted-foreground text-sm text-center py-4'>Belum ada transaksi</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
