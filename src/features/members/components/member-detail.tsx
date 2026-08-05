'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { memberDetailQueryOptions } from '../api/queries';
import type { Subscription } from '../api/types';
import { format } from 'date-fns';
import { Icons } from '@/components/icons';
import { MemberDetailSkeleton } from './member-detail-drawer';
import { useQueryState } from 'nuqs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface MemberDetailProps {
  memberId: string;
}

function getSubscriptionDateText(sub: Subscription) {
  if (sub.status === 'cancelled') {
    return sub.kicked_at
      ? `Dikeluarkan pada ${format(new Date(sub.kicked_at), 'dd MMMM yyyy')}`
      : 'Dikeluarkan';
  }

  return sub.expired_at
    ? `Kedaluwarsa pada ${format(new Date(sub.expired_at), 'dd MMMM yyyy')}`
    : '-';
}

export function MemberDetail({ memberId }: MemberDetailProps) {
  const [_, setMemberId] = useQueryState('memberId');
  const [tab, setTab] = useState('overview');
  const { data, isLoading } = useQuery(memberDetailQueryOptions(memberId));

  if (isLoading || !data) {
    return <MemberDetailSkeleton />;
  }

  const member = data.success ? data.data : undefined;

  if (!member) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center h-full p-6 text-muted-foreground'>
        <Icons.user className='size-12 mb-4 opacity-20' />
        <p>Member tidak ditemukan</p>
      </div>
    );
  }

  const initials = `${member.first_name?.[0] || ''}${member.last_name?.[0] || ''}`.toUpperCase();
  const activeSubs = member.subscriptions?.filter((s: Subscription) => s.status === 'active') || [];
  const historySubs = member.subscriptions || [];
  const groups = member.subscriptions || [];
  const memberTelegramUrl = member.username ? `https://t.me/${member.username}` : undefined;

  return (
    <Tabs value={tab} onValueChange={setTab} className='flex flex-col h-full bg-background'>
      <div className='p-6 pb-0 border-b border-border relative bg-background shrink-0'>
        <Button
          variant='ghost'
          size='icon'
          aria-label='Tutup detail member'
          className='absolute top-6 right-6 rounded-full'
          onClick={() => setMemberId(null)}
        >
          <Icons.close className='size-5' />
        </Button>

        <div className='flex items-center gap-4 mb-6'>
          <div className='size-16 rounded-2xl bg-primary/20 text-primary flex items-center justify-center font-bold text-3xl shadow-lg border-2 border-background'>
            {initials}
          </div>
          <div>
            <h2 className='text-2xl font-bold text-foreground'>
              {member.first_name} {member.last_name}
            </h2>
            <p className='text-sm text-primary font-medium'>@{member.username}</p>
          </div>
        </div>

        <TabsList className='w-full justify-start rounded-none border-b-0 bg-transparent p-0 h-auto'>
          <TabsTrigger
            value='overview'
            className={cn(
              'rounded-none border-b border-transparent px-0 pb-3 text-[13px] font-medium data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-none',
              'text-muted-foreground hover:text-foreground'
            )}
          >
            Ikhtisar
          </TabsTrigger>
          <TabsTrigger
            value='groups'
            className={cn(
              'rounded-none border-b border-transparent px-0 pb-3 text-[13px] font-medium data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-none ml-6',
              'text-muted-foreground hover:text-foreground'
            )}
          >
            Langganan per Grup
          </TabsTrigger>
          <TabsTrigger
            value='history'
            className={cn(
              'rounded-none border-b border-transparent px-0 pb-3 text-[13px] font-medium data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-none ml-6',
              'text-muted-foreground hover:text-foreground'
            )}
          >
            Riwayat
          </TabsTrigger>
        </TabsList>
      </div>

      <div className='flex-1 overflow-y-auto p-6 scrollbar-hide'>
        <TabsContent value='overview' className='mt-0'>
          <div className='flex flex-col gap-6'>
            <section>
              <h3 className='text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4'>
                Informasi Member
              </h3>
              <div className='grid grid-cols-2 gap-4'>
                <Card>
                  <CardContent className='p-4'>
                    <div className='flex items-center gap-1.5 mb-1'>
                      <Icons.telegram className='size-3.5 text-muted-foreground' />
                      <p className='text-[11px] font-medium text-muted-foreground'>Telegram ID</p>
                    </div>
                    <p className='text-sm font-bold text-foreground'>{member.telegram_user_id}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className='p-4'>
                    <div className='flex items-center gap-1.5 mb-1'>
                      <Icons.calendar className='size-3.5 text-muted-foreground' />
                      <p className='text-[11px] font-medium text-muted-foreground'>
                        Tanggal Bergabung
                      </p>
                    </div>
                    <p className='text-sm font-bold text-foreground'>
                      {member.created_at
                        ? format(new Date(member.created_at), 'dd MMM, yyyy')
                        : '-'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className='p-4'>
                    <div className='flex items-center gap-1.5 mb-1'>
                      <Icons.clipboardList className='size-3.5 text-muted-foreground' />
                      <p className='text-[11px] font-medium text-muted-foreground'>Total Pesanan</p>
                    </div>
                    <p className='text-sm font-bold text-primary'>{member.total_orders}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className='p-4'>
                    <div className='flex items-center gap-1.5 mb-1'>
                      <Icons.phone className='size-3.5 text-muted-foreground' />
                      <p className='text-[11px] font-medium text-muted-foreground'>Telepon</p>
                    </div>
                    <p className='text-sm font-bold text-foreground'>{member.phone || '-'}</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className='text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4'>
                Langganan Aktif
              </h3>
              <div className='flex flex-col gap-3'>
                {activeSubs.length > 0 ? (
                  activeSubs.map((sub: Subscription) => (
                    <div
                      key={sub.id}
                      className='flex items-center justify-between p-4 bg-primary/5 border border-primary/10 rounded-xl'
                    >
                      <div className='flex items-center gap-3'>
                        <div className='p-2 bg-primary/10 rounded-lg'>
                          <Icons.trendingUp className='size-5 text-primary' />
                        </div>
                        <div>
                          <p className='text-sm font-bold'>{sub.package_name}</p>
                          <p className='text-[11px] text-muted-foreground'>
                            {getSubscriptionDateText(sub)}
                          </p>
                        </div>
                      </div>
                      <Badge variant='secondary'>Aktif</Badge>
                    </div>
                  ))
                ) : (
                  <div className='text-center p-4 border border-dashed rounded-xl text-muted-foreground text-sm'>
                    Belum ada langganan aktif
                  </div>
                )}
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent value='groups' className='mt-0'>
          <div className='flex flex-col gap-4'>
            <h3 className='text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4'>
              Langganan per Grup
            </h3>
            <div className='flex flex-col gap-2'>
              {groups.length > 0 ? (
                groups.map((group) => {
                  const isActive = group.status === 'active';

                  return (
                    <div
                      key={group.id}
                      className={cn(
                        'flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors',
                        isActive
                          ? 'bg-muted/40 border-border'
                          : 'bg-muted/20 border-dashed opacity-60'
                      )}
                    >
                      <div className='flex items-center min-w-0 gap-3'>
                        <Icons.chat className='size-5 shrink-0 text-primary' />
                        <div className='min-w-0'>
                          <p className='truncate text-sm font-medium'>{group.package_name}</p>
                          <Badge variant={isActive ? 'secondary' : 'outline'} className='text-xs'>
                            {isActive ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className='text-center p-4 border border-dashed rounded-xl text-muted-foreground text-sm'>
                  Tidak ada grup
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value='history' className='mt-0'>
          <div className='flex flex-col gap-4'>
            <h3 className='text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4'>
              Riwayat Langganan
            </h3>
            <div className='relative border-l-2 border-border ml-3 flex flex-col gap-6 pb-4'>
              {historySubs.length > 0 ? (
                historySubs.map((sub: Subscription) => (
                  <div key={sub.id} className='relative pl-6'>
                    <div
                      className={cn(
                        'absolute -left-[9px] top-1 size-4 rounded-full border-2 border-background',
                        sub.status === 'active'
                          ? 'bg-emerald-500'
                          : sub.status === 'cancelled'
                            ? 'bg-red-400'
                            : 'bg-amber-400'
                      )}
                    />
                    <p className='text-[11px] font-medium text-muted-foreground'>
                      {sub.status === 'cancelled' && sub.kicked_at
                        ? format(new Date(sub.kicked_at), 'MMM dd, yyyy')
                        : sub.activated_at
                          ? format(new Date(sub.activated_at), 'MMM dd, yyyy')
                          : '-'}
                    </p>
                    <p className='text-sm font-bold capitalize'>Langganan {sub.status}</p>
                    <p className='text-xs text-muted-foreground'>{sub.package_name}</p>
                  </div>
                ))
              ) : (
                <p className='text-sm text-muted-foreground pl-6'>Riwayat tidak ditemukan</p>
              )}
            </div>
          </div>
        </TabsContent>
      </div>

      <Separator />
      <div className='p-6 bg-muted/20 flex gap-3 shrink-0'>
        <Button
          className='flex-1 rounded-xl text-[13px] font-bold'
          aria-label='Kirim pesan ke member'
          disabled={!memberTelegramUrl}
          asChild
        >
          <a href={memberTelegramUrl ?? '#'} target='_blank' rel='noopener noreferrer'>
            Kirim Pesan
          </a>
        </Button>
        <Button
          variant='outline'
          size='icon'
          className='rounded-xl'
          aria-label='Tutup detail member'
          onClick={() => setMemberId(null)}
        >
          <Icons.close className='size-5' />
        </Button>
      </div>
    </Tabs>
  );
}
