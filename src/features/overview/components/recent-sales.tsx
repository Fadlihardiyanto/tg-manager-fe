import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
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

export function RecentSales({ data }: { data: RecentOrder[] }) {
  return (
    <Card className='h-full overflow-hidden border-border/70 shadow-sm'>
      <CardHeader className='border-b bg-muted/20'>
        <CardTitle className='text-base'>Pesanan Terbaru</CardTitle>
        <CardDescription>{data.length} transaksi terakhir</CardDescription>
      </CardHeader>
      <CardContent className='pt-5'>
        <div className='space-y-3'>
          {data.map((order) => (
            <div
              key={order.id}
              className='group flex items-center rounded-lg border border-transparent p-2 transition-colors hover:border-border hover:bg-muted/35'
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
                <p className='text-muted-foreground text-xs'>
                  {order.external_id} &middot; {formatDate(order.created_at)}
                </p>
              </div>
              <div className='ml-auto text-right'>
                <p className='text-sm font-medium'>{formatRp(order.amount)}</p>
                <Badge
                  variant='outline'
                  className='border-emerald-200 bg-emerald-50 text-xs text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
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
