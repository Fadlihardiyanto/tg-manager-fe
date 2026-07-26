import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import type { AuditLog } from '../../api/types';

const ACTION_STYLES: Record<string, string> = {
  create: 'border-green-200 bg-green-50 text-green-700',
  created: 'border-green-200 bg-green-50 text-green-700',
  update: 'border-amber-200 bg-amber-50 text-amber-700',
  updated: 'border-amber-200 bg-amber-50 text-amber-700',
  delete: 'border-red-200 bg-red-50 text-red-700',
  deleted: 'border-red-200 bg-red-50 text-red-700',
  activate: 'border-sky-200 bg-sky-50 text-sky-700',
  deactivate: 'border-gray-200 bg-gray-50 text-gray-600',
  login: 'border-violet-200 bg-violet-50 text-violet-700',
  assign: 'border-teal-200 bg-teal-50 text-teal-700',
  cancel: 'border-rose-200 bg-rose-50 text-rose-700'
};

function getActionStyle(action: string) {
  const key = action.toLowerCase();
  return ACTION_STYLES[key] ?? 'border-slate-200 bg-slate-50 text-slate-600';
}

function initials(name: string) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins}m lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}j lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}h lalu`;
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function RecentActivity({ logs }: { logs: AuditLog[] }) {
  const recent = logs.slice(0, 8);

  return (
    <Card className='h-full overflow-hidden border-border/70 shadow-sm'>
      <CardHeader className='border-b bg-muted/20'>
        <CardTitle className='text-base'>Aktivitas Admin Terbaru</CardTitle>
        <CardDescription>{logs.length} aktivitas tercatat</CardDescription>
      </CardHeader>
      <CardContent className='pt-5'>
        <div className='space-y-3'>
          {recent.map((log) => (
            <div
              key={log.id}
              className='group flex items-start rounded-lg border border-transparent p-2 transition-colors hover:border-border hover:bg-muted/35'
            >
              <Avatar className='h-10 w-10 border shadow-xs shrink-0'>
                <AvatarFallback className='bg-primary/10 text-primary text-xs font-semibold'>
                  {initials(log.admin_name)}
                </AvatarFallback>
              </Avatar>
              <div className='ml-3 min-w-0 flex-1 space-y-1'>
                <div className='flex items-center gap-2'>
                  <p className='text-sm font-medium truncate'>{log.admin_name || 'Unknown'}</p>
                  <Badge
                    variant='outline'
                    className={`text-[10px] leading-none px-1.5 py-px ${getActionStyle(log.action)}`}
                  >
                    {log.action}
                  </Badge>
                </div>
                <p className='text-muted-foreground text-xs truncate'>
                  {log.resource}
                  {log.resource_id && (
                    <span className='text-muted-foreground/60'> #{log.resource_id}</span>
                  )}
                </p>
                {log.details && (
                  <p className='text-muted-foreground/80 text-xs line-clamp-1'>{log.details}</p>
                )}
              </div>
              <p className='text-muted-foreground ml-2 shrink-0 text-[11px] whitespace-nowrap'>
                {timeAgo(log.created_at)}
              </p>
            </div>
          ))}
          {logs.length === 0 && (
            <p className='text-muted-foreground py-4 text-center text-sm'>
              Belum ada aktivitas tercatat
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
