'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { memberDetailQueryOptions } from '../api/queries';
import type { Subscription } from '../api/types';
import { format } from 'date-fns';
import { Icons } from '@/components/icons';
import { MemberDetailSkeleton } from './member-detail-drawer';
import { useQueryState } from 'nuqs';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface MemberDetailProps {
  memberId: string;
}

function getSubscriptionDateText(sub: Subscription) {
  if (sub.status === 'cancelled') {
    return sub.kicked_at
      ? `Kicked at ${format(new Date(sub.kicked_at), 'dd MMMM yyyy')}`
      : 'Kicked';
  }

  return sub.expired_at ? `Expired at ${format(new Date(sub.expired_at), 'dd MMMM yyyy')}` : '-';
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
        <p>Member not found</p>
      </div>
    );
  }

  const initials = `${member.first_name?.[0] || ''}${member.last_name?.[0] || ''}`.toUpperCase();
  const activeSubs = member.subscriptions?.filter((s: Subscription) => s.status === 'active') || [];
  const historySubs = member.subscriptions || [];

  return (
    <Tabs value={tab} onValueChange={setTab} className='flex flex-col h-full bg-background'>
      <div className='p-6 pb-0 border-b border-border relative bg-background shrink-0'>
        <button
          className='absolute top-6 right-6 p-2 hover:bg-muted rounded-full transition-colors'
          onClick={() => setMemberId(null)}
        >
          <Icons.close className='size-5 text-muted-foreground' />
        </button>

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
              'rounded-none border-b-2 border-transparent px-0 pb-3 text-[13px] font-medium data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-none',
              'text-muted-foreground hover:text-foreground'
            )}
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value='groups'
            className={cn(
              'rounded-none border-b-2 border-transparent px-0 pb-3 text-[13px] font-medium data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-none ml-6',
              'text-muted-foreground hover:text-foreground'
            )}
          >
            Active Groups
          </TabsTrigger>
          <TabsTrigger
            value='history'
            className={cn(
              'rounded-none border-b-2 border-transparent px-0 pb-3 text-[13px] font-medium data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-none ml-6',
              'text-muted-foreground hover:text-foreground'
            )}
          >
            History
          </TabsTrigger>
        </TabsList>
      </div>

      <div className='flex-1 overflow-y-auto p-6 scrollbar-hide'>
        <TabsContent value='overview' className='mt-0'>
          <div className='flex flex-col gap-6'>
            <section>
              <h3 className='text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4'>
                Member Information
              </h3>
              <div className='grid grid-cols-2 gap-4'>
                <Card>
                  <CardContent className='p-4'>
                    <p className='text-[11px] font-medium text-muted-foreground mb-1'>
                      Telegram ID
                    </p>
                    <p className='text-sm font-bold text-foreground'>{member.telegram_user_id}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className='p-4'>
                    <p className='text-[11px] font-medium text-muted-foreground mb-1'>Join Date</p>
                    <p className='text-sm font-bold text-foreground'>
                      {member.created_at
                        ? format(new Date(member.created_at), 'dd MMM, yyyy')
                        : '-'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className='p-4'>
                    <p className='text-[11px] font-medium text-muted-foreground mb-1'>
                      Total Orders
                    </p>
                    <p className='text-sm font-bold text-primary'>{member.total_orders}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className='p-4'>
                    <p className='text-[11px] font-medium text-muted-foreground mb-1'>Phone</p>
                    <p className='text-sm font-bold text-foreground'>{member.phone || '-'}</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <Separator />

            <section>
              <h3 className='text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4'>
                Current Subscriptions
              </h3>
              <div className='flex flex-col gap-3'>
                {activeSubs.length > 0 ? (
                  activeSubs.map((sub: Subscription) => (
                    <div
                      key={sub.id}
                      className='flex items-center justify-between p-4 bg-background border border-border rounded-xl shadow-sm'
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
                      <span className='text-sm font-bold text-foreground'>Active</span>
                    </div>
                  ))
                ) : (
                  <div className='text-center p-4 border border-dashed rounded-xl text-muted-foreground text-sm'>
                    No active subscriptions
                  </div>
                )}
              </div>
            </section>

            <Alert>
              <Icons.warning className='size-4' />
              <AlertTitle>Risk Analysis</AlertTitle>
              <AlertDescription>
                This user has reported {member.total_orders} billing issues in the last 6 months.
                High engagement rate.
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>

        <TabsContent value='groups' className='mt-0'>
          <div className='flex flex-col gap-4'>
            <h3 className='text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4'>
              Active Telegram Groups
            </h3>
            <div className='flex flex-col gap-2'>
              <div className='flex items-center p-3 bg-muted/40 rounded-lg border border-border'>
                <Icons.chat className='size-5 mr-3 text-primary' />
                <span className='text-sm font-medium'>VIP Signals</span>
              </div>
              <div className='flex items-center p-3 bg-muted/40 rounded-lg border border-border'>
                <Icons.user className='size-5 mr-3 text-primary' />
                <span className='text-sm font-medium'>Main Discussion</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value='history' className='mt-0'>
          <div className='flex flex-col gap-4'>
            <h3 className='text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4'>
              Subscription History
            </h3>
            <div className='relative border-l-2 border-border ml-3 flex flex-col gap-6 pb-4'>
              {historySubs.length > 0 ? (
                historySubs.map((sub: Subscription) => (
                  <div key={sub.id} className='relative pl-6'>
                    <div
                      className={cn(
                        'absolute -left-[9px] top-1 size-4 rounded-full border-2 border-background',
                        sub.status === 'active' ? 'bg-primary' : 'bg-muted-foreground'
                      )}
                    />
                    <p className='text-[11px] font-medium text-muted-foreground'>
                      {sub.status === 'cancelled' && sub.kicked_at
                        ? format(new Date(sub.kicked_at), 'MMM dd, yyyy')
                        : sub.activated_at
                          ? format(new Date(sub.activated_at), 'MMM dd, yyyy')
                          : '-'}
                    </p>
                    <p className='text-sm font-bold capitalize'>{sub.status} Subscription</p>
                    <p className='text-xs text-muted-foreground'>{sub.package_name}</p>
                  </div>
                ))
              ) : (
                <p className='text-sm text-muted-foreground pl-6'>No history found</p>
              )}
            </div>
          </div>
        </TabsContent>
      </div>

      <Separator />
      <div className='p-6 bg-muted/20 flex gap-3 shrink-0'>
        <button className='flex-1 py-3 bg-primary text-primary-foreground rounded-xl text-[13px] font-bold hover:shadow-lg transition-all active:scale-[0.98]'>
          Send Message
        </button>
        <button className='p-3 border border-border rounded-xl hover:bg-muted transition-colors'>
          <Icons.close className='size-5 text-foreground' />
        </button>
      </div>
    </Tabs>
  );
}
