import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import type { Client, ClientSubscription } from '../../api/types';

export function TopTenantsTable({
  clients,
  subs
}: {
  clients: Client[];
  subs: ClientSubscription[];
}) {
  const planByClient = new Map<string, string>();
  for (const s of subs) {
    if (s.status === 'active') {
      planByClient.set(s.client_id, s.plan_name);
    }
  }

  const top = clients
    .slice()
    .sort((a, b) => {
      const aActive = planByClient.has(a.id) ? 1 : 0;
      const bActive = planByClient.has(b.id) ? 1 : 0;
      return (
        bActive - aActive ||
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
    })
    .slice(0, 5);

  if (clients.length === 0) {
    return (
      <Card className='h-full overflow-hidden border-border/70 shadow-sm'>
        <CardHeader className='border-b bg-muted/20'>
          <CardTitle className='text-base'>Top Tenants</CardTitle>
          <CardDescription>Klien teratas berdasarkan aktivitas</CardDescription>
        </CardHeader>
        <CardContent className='pt-5'>
          <p className='text-muted-foreground py-4 text-center text-sm'>
            Belum ada tenant terdaftar
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='h-full overflow-hidden border-border/70 pt-6 pb-0 shadow-sm'>
      <CardHeader className='px-6'>
        <CardTitle className='text-base'>Top Tenants</CardTitle>
        <CardDescription>5 klien teratas berdasarkan aktivitas</CardDescription>
      </CardHeader>
      <CardContent className='px-0'>
        <Table>
          <TableHeader>
            <TableRow className='border-border/80 bg-muted/30 hover:bg-muted/30'>
              <TableHead className='ps-6 text-xs font-semibold uppercase tracking-wider'>
                <span aria-label='Nomor'>#</span>
              </TableHead>
              <TableHead className='text-xs font-semibold uppercase tracking-wider'>Nama</TableHead>
              <TableHead className='text-xs font-semibold uppercase tracking-wider'>Plan</TableHead>
              <TableHead className='text-xs font-semibold uppercase tracking-wider'>
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className='divide-y divide-border/80'>
            {top.map((client, idx) => {
              const planName = planByClient.get(client.id);
              return (
                <TableRow
                  key={client.id}
                  className='group transition-colors duration-200 hover:bg-muted/35'
                >
                  <TableCell className='text-muted-foreground whitespace-nowrap ps-6 text-sm tabular-nums'>
                    {idx + 1}
                  </TableCell>
                  <TableCell className='whitespace-nowrap'>
                    <p className='text-sm font-semibold'>{client.name}</p>
                    <p className='text-muted-foreground text-xs'>{client.slug}</p>
                  </TableCell>
                  <TableCell className='whitespace-nowrap'>
                    {planName ? (
                      <span className='text-sm font-medium'>{planName}</span>
                    ) : (
                      <span className='text-muted-foreground text-sm'>—</span>
                    )}
                  </TableCell>
                  <TableCell className='whitespace-nowrap'>
                    <Badge
                      variant='outline'
                      className={
                        client.is_active
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 text-xs'
                          : 'border-gray-200 bg-gray-50 text-gray-500 text-xs'
                      }
                    >
                      {client.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
