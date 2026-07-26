'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PageTabs } from '@/components/ui/page-tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  plansQueryOptions,
  subscriptionsQueryOptions,
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,
  useAssignPlan,
  useCancelSubscription,
  clientsQueryOptions
} from '../../../../features/superadmin/api/queries';
import type { BillingPlan, CreatePlanRequest } from '../../../../features/superadmin/api/types';
import { cn } from '@/lib/utils';

const FORMATTER = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0
});

const STATUS_STYLES: Record<string, string> = {
  active: 'border-emerald-300 bg-emerald-50 text-emerald-700',
  expired: 'border-amber-300 bg-amber-50 text-amber-700',
  cancelled: 'border-red-300 bg-red-50 text-red-700'
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  expired: 'Expired',
  cancelled: 'Cancelled'
};

function initPlanForm(): CreatePlanRequest {
  return {
    name: '',
    description: '',
    price_monthly: 0,
    price_yearly: 0,
    max_bots: 1,
    max_groups: 1,
    max_members: 100,
    max_packages: 5,
    max_custom_commands: 10,
    max_broadcasts: 100,
    allow_media_broadcast: false,
    allow_discount_system: false,
    allow_reports_export: false,
    allow_high_priority: false
  };
}

function fillPlanForm(p: BillingPlan): CreatePlanRequest {
  return {
    name: p.name,
    description: p.description || '',
    price_monthly: p.price_monthly,
    price_yearly: p.price_yearly || 0,
    max_bots: p.max_bots,
    max_groups: p.max_groups,
    max_members: p.max_members,
    max_packages: p.max_packages,
    max_custom_commands: p.max_custom_commands,
    max_broadcasts: p.max_broadcasts,
    allow_media_broadcast: p.allow_media_broadcast,
    allow_discount_system: p.allow_discount_system,
    allow_reports_export: p.allow_reports_export,
    allow_high_priority: p.allow_high_priority
  };
}

// ─── Main Page ───────────────────────────────────────────────────────

export default function PlansPage() {
  const [tab, setTab] = useState('plans');
  const tabs = [
    { value: 'plans', label: 'Paket Harga' },
    { value: 'subscriptions', label: 'Langganan Tenant' }
  ];

  return (
    <PageContainer
      pageTitle='Billing & Plans'
      pageDescription='Kelola paket harga dan langganan tenant'
    >
      <PageTabs value={tab} onValueChange={setTab} items={tabs} />
      <div className='mt-6'>{tab === 'plans' ? <PlansTab /> : <SubscriptionsTab />}</div>
    </PageContainer>
  );
}

// ─── Shared Stat Card ────────────────────────────────────────────────

function StatPill({
  label,
  value,
  icon: Icon,
  accent
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-border/70 bg-gradient-to-br p-4',
        accent
      )}
    >
      <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-background/60 backdrop-blur shadow-xs'>
        <Icon className='size-5' />
      </div>
      <div>
        <p className='text-muted-foreground text-xs font-medium'>{label}</p>
        <p className='text-xl font-bold tabular-nums'>{value}</p>
      </div>
    </div>
  );
}

// ─── Plans Tab ───────────────────────────────────────────────────────

function PlansTab() {
  const { data: plansRes } = useQuery(plansQueryOptions());
  const createMut = useCreatePlan();
  const updateMut = useUpdatePlan();
  const deleteMut = useDeletePlan();
  const plans = plansRes?.success ? plansRes.data : [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BillingPlan | null>(null);
  const [form, setForm] = useState<CreatePlanRequest>(initPlanForm());
  const [deleting, setDeleting] = useState<BillingPlan | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(initPlanForm());
    setDialogOpen(true);
  };
  const openEdit = (p: BillingPlan) => {
    setEditing(p);
    setForm(fillPlanForm(p));
    setDialogOpen(true);
  };

  // ponytail: typed spread into CreatePlanRequest, TS can't narrow computed keys
  const set =
    <K extends keyof CreatePlanRequest>(key: K) =>
    (v: CreatePlanRequest[K]) =>
      setForm((prev) => ({ ...prev, [key]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Nama paket wajib diisi');
      return;
    }
    const res = editing
      ? await updateMut.mutateAsync({ id: editing.id, ...form })
      : await createMut.mutateAsync(form);
    if (res.success) {
      toast.success(editing ? 'Paket diperbarui' : 'Paket dibuat');
      setDialogOpen(false);
    } else toast.error(res.message);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const res = await deleteMut.mutateAsync(deleting.id);
    if (res.success) toast.success('Paket dihapus');
    else toast.error(res.message);
    setDeleting(null);
  };

  const activePlans = plans.filter((p) => p.is_active).length;

  return (
    <div className='space-y-6'>
      {/* Stats bar */}
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        <StatPill
          label='Total Paket'
          value={String(plans.length)}
          icon={Icons.chartBar}
          accent='from-sky-500/10 via-sky-500/5 to-transparent'
        />
        <StatPill
          label='Paket Aktif'
          value={String(activePlans)}
          icon={Icons.check}
          accent='from-emerald-500/10 via-emerald-500/5 to-transparent'
        />
      </div>

      {/* Header */}
      <div className='flex items-center justify-between'>
        <p className='text-muted-foreground text-sm'>{plans.length} paket tersedia</p>
        <Button onClick={openCreate}>
          <Icons.add className='mr-2 size-4' />
          Tambah Paket
        </Button>
      </div>

      {/* Plan cards grid */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {plans.map((plan, i) => (
          <Card
            key={plan.id}
            className='group overflow-hidden border-border/70 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md'
          >
            {/* Gradient header */}
            <div
              className={cn(
                'h-2 bg-gradient-to-r',
                i % 8 === 0 && 'from-sky-400 to-sky-300',
                i % 8 === 1 && 'from-emerald-400 to-emerald-300',
                i % 8 === 2 && 'from-violet-400 to-violet-300',
                i % 8 === 3 && 'from-amber-400 to-amber-300',
                i % 8 === 4 && 'from-rose-400 to-rose-300',
                i % 8 === 5 && 'from-teal-400 to-teal-300',
                i % 8 === 6 && 'from-indigo-400 to-indigo-300',
                i % 8 === 7 && 'from-orange-400 to-orange-300'
              )}
            />

            <CardHeader className='pb-1'>
              <div className='flex items-start justify-between'>
                <div>
                  <CardTitle className='text-base'>{plan.name}</CardTitle>
                  {plan.description && (
                    <p className='text-muted-foreground mt-0.5 text-xs'>{plan.description}</p>
                  )}
                </div>
                <Badge variant={plan.is_active ? 'secondary' : 'outline'} className='shrink-0'>
                  {plan.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className='space-y-4'>
              {/* Price */}
              <div>
                <p className='text-2xl font-bold tabular-nums'>
                  {FORMATTER.format(plan.price_monthly)}
                </p>
                <p className='text-muted-foreground text-xs'>
                  /bulan{plan.price_yearly ? ` · ${FORMATTER.format(plan.price_yearly)}/tahun` : ''}
                </p>
              </div>

              <Separator />

              {/* Limits */}
              <div className='grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm'>
                <LimitRow icon={Icons.bot} label='Bot' value={plan.max_bots} />
                <LimitRow icon={Icons.teams} label='Group' value={plan.max_groups} />
                <LimitRow icon={Icons.user} label='Member' value={plan.max_members} />
                <LimitRow icon={Icons.page} label='Paket' value={plan.max_packages} />
                <LimitRow icon={Icons.text} label='Command' value={plan.max_custom_commands} />
                <LimitRow icon={Icons.send} label='Broadcast' value={plan.max_broadcasts} />
              </div>

              <Separator />

              {/* Feature toggles */}
              <div className='flex flex-wrap gap-1.5'>
                <FeatureBadge label='Media Broadcast' active={plan.allow_media_broadcast} />
                <FeatureBadge label='Diskon' active={plan.allow_discount_system} />
                <FeatureBadge label='Ekspor Laporan' active={plan.allow_reports_export} />
                <FeatureBadge label='Prioritas Tinggi' active={plan.allow_high_priority} />
              </div>

              {/* Actions */}
              <div className='flex gap-2 pt-1'>
                <Button
                  variant='outline'
                  size='sm'
                  className='flex-1'
                  onClick={() => openEdit(plan)}
                >
                  <Icons.edit className='mr-1 size-3' />
                  Edit
                </Button>
                <Button variant='ghost' size='sm' onClick={() => setDeleting(plan)}>
                  <Icons.trash className='size-4 text-destructive' />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {plans.length === 0 && (
          <div className='col-span-full py-16 text-center'>
            <Icons.chartBar className='mx-auto size-10 text-muted-foreground/40' />
            <p className='text-muted-foreground mt-3 text-sm'>Belum ada paket terdaftar</p>
            <Button variant='outline' size='sm' className='mt-3' onClick={openCreate}>
              <Icons.add className='mr-1 size-3' />
              Tambah Paket Pertama
            </Button>
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='max-w-xl max-h-[85vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Paket' : 'Tambah Paket'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'Perbarui detail paket langganan.'
                : 'Buat paket langganan baru untuk tenant.'}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-5 py-2'>
            {/* Info */}
            <fieldset className='space-y-3'>
              <legend className='text-sm font-semibold'>Info Paket</legend>
              <div className='grid grid-cols-2 gap-3'>
                <div className='flex flex-col gap-1.5 col-span-2'>
                  <label htmlFor='plan-name' className='text-xs font-medium'>
                    Nama Paket
                  </label>
                  <Input
                    id='plan-name'
                    value={form.name}
                    onChange={(e) => set('name')(e.target.value)}
                    placeholder='Basic, Pro, Enterprise...'
                  />
                </div>
                <div className='flex flex-col gap-1.5 col-span-2'>
                  <label htmlFor='plan-desc' className='text-xs font-medium'>
                    Deskripsi
                  </label>
                  <Input
                    id='plan-desc'
                    value={form.description ?? ''}
                    onChange={(e) => set('description')(e.target.value)}
                    placeholder='Opsional'
                  />
                </div>
              </div>
            </fieldset>

            <Separator />

            {/* Pricing */}
            <fieldset className='space-y-3'>
              <legend className='text-sm font-semibold'>Harga</legend>
              <div className='grid grid-cols-2 gap-3'>
                <div className='flex flex-col gap-1.5'>
                  <label htmlFor='plan-monthly' className='text-xs font-medium'>
                    Harga Bulanan
                  </label>
                  <Input
                    id='plan-monthly'
                    type='number'
                    value={form.price_monthly}
                    onChange={(e) => set('price_monthly')(Number(e.target.value))}
                  />
                </div>
                <div className='flex flex-col gap-1.5'>
                  <label htmlFor='plan-yearly' className='text-xs font-medium'>
                    Harga Tahunan
                  </label>
                  <Input
                    id='plan-yearly'
                    type='number'
                    value={form.price_yearly ?? 0}
                    onChange={(e) => set('price_yearly')(Number(e.target.value))}
                  />
                </div>
              </div>
            </fieldset>

            <Separator />

            {/* Limits */}
            <fieldset className='space-y-3'>
              <legend className='text-sm font-semibold'>Batas Resurs</legend>
              <div className='grid grid-cols-2 gap-3'>
                {[
                  ['max_bots', 'Max Bot'],
                  ['max_groups', 'Max Group'],
                  ['max_members', 'Max Member'],
                  ['max_packages', 'Max Paket'],
                  ['max_custom_commands', 'Max Command'],
                  ['max_broadcasts', 'Max Broadcast']
                ].map(([key, label]) => {
                  const k = key as keyof CreatePlanRequest;
                  return (
                    <div key={key} className='flex flex-col gap-1.5'>
                      <label htmlFor={`plan-${key}`} className='text-xs font-medium'>
                        {label}
                      </label>
                      <Input
                        id={`plan-${key}`}
                        type='number'
                        value={(form[k] as number) ?? 0}
                        onChange={(e) => set(k)(Number(e.target.value))}
                      />
                    </div>
                  );
                })}
              </div>
            </fieldset>

            <Separator />

            {/* Feature Toggles */}
            <fieldset className='space-y-3'>
              <legend className='text-sm font-semibold'>Fitur Tambahan</legend>
              <div className='grid grid-cols-2 gap-3'>
                {[
                  ['allow_media_broadcast', 'Media Broadcast'],
                  ['allow_discount_system', 'Sistem Diskon'],
                  ['allow_reports_export', 'Ekspor Laporan'],
                  ['allow_high_priority', 'Prioritas Tinggi']
                ].map(([key, label]) => {
                  const k = key as keyof CreatePlanRequest;
                  return (
                    <div
                      key={key}
                      className='flex items-center justify-between rounded-lg border border-border/70 px-3 py-2.5'
                    >
                      <label htmlFor={`plan-${key}`} className='text-sm cursor-pointer'>
                        {label}
                      </label>
                      <Switch
                        id={`plan-${key}`}
                        checked={Boolean(form[k])}
                        onCheckedChange={(v) => set(k)(v)}
                      />
                    </div>
                  );
                })}
              </div>
            </fieldset>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave}>{editing ? 'Simpan' : 'Buat'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleting}
        onOpenChange={(o) => {
          if (!o) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Paket</AlertDialogTitle>
            <AlertDialogDescription>
              Yakin ingin menghapus paket &quot;{deleting?.name}&quot;? Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='bg-destructive text-destructive-foreground'
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Plan card helpers ───────────────────────────────────────────────

function LimitRow({
  icon: Icon,
  label,
  value
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className='flex items-center gap-1.5'>
      <Icon className='text-muted-foreground size-3.5 shrink-0' />
      <span className='text-muted-foreground text-xs'>{label}</span>
      <span className='ml-auto text-xs font-semibold tabular-nums'>
        {value === -1 ? '∞' : value}
      </span>
    </div>
  );
}

function FeatureBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <Badge
      variant='outline'
      className={cn(
        'text-[10px] gap-1',
        active
          ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
          : 'border-border bg-muted/30 text-muted-foreground'
      )}
    >
      {active ? <Icons.check className='size-2.5' /> : <Icons.close className='size-2.5' />}
      {label}
    </Badge>
  );
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

function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

// ─── Subscriptions Tab ───────────────────────────────────────────────

function SubscriptionsTab() {
  const { data: subsRes } = useQuery(subscriptionsQueryOptions());
  const { data: clientsRes } = useQuery(clientsQueryOptions(1, 999));
  const { data: plansRes } = useQuery(plansQueryOptions());
  const assignMut = useAssignPlan();
  const cancelMut = useCancelSubscription();
  const subs = subsRes?.success ? subsRes.data : [];
  const clients = clientsRes?.success ? clientsRes.data : [];
  const plans = plansRes?.success ? plansRes.data : [];

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({ client_id: '', plan_id: '', duration_days: 30 });
  const [cancelling, setCancelling] = useState<{ id: string; client_name: string } | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return subs;
    return subs.filter((s) => s.status === filter);
  }, [subs, filter]);

  const counts = useMemo(
    () => ({
      total: subs.length,
      active: subs.filter((s) => s.status === 'active').length,
      expired: subs.filter((s) => s.status === 'expired').length,
      cancelled: subs.filter((s) => s.status === 'cancelled').length
    }),
    [subs]
  );

  const handleAssign = async () => {
    if (!assignForm.client_id || !assignForm.plan_id) {
      toast.error('Pilih tenant dan paket');
      return;
    }
    const res = await assignMut.mutateAsync(assignForm);
    if (res.success) {
      toast.success('Paket ditugaskan');
      setAssignOpen(false);
      setAssignForm({ client_id: '', plan_id: '', duration_days: 30 });
    } else toast.error(res.message);
  };

  const handleCancel = async () => {
    if (!cancelling) return;
    const res = await cancelMut.mutateAsync(cancelling.id);
    if (res.success) toast.success('Langganan dibatalkan');
    else toast.error(res.message);
    setCancelling(null);
  };

  return (
    <div className='space-y-6'>
      {/* Stats bar */}
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        <StatPill
          label='Total Langganan'
          value={String(counts.total)}
          icon={Icons.chartBar}
          accent='from-sky-500/10 via-sky-500/5 to-transparent'
        />
        <StatPill
          label='Active'
          value={String(counts.active)}
          icon={Icons.check}
          accent='from-emerald-500/10 via-emerald-500/5 to-transparent'
        />
        <StatPill
          label='Expired'
          value={String(counts.expired)}
          icon={Icons.warning}
          accent='from-amber-500/10 via-amber-500/5 to-transparent'
        />
        <StatPill
          label='Cancelled'
          value={String(counts.cancelled)}
          icon={Icons.close}
          accent='from-red-500/10 via-red-500/5 to-transparent'
        />
      </div>

      {/* Toolbar */}
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex gap-1 rounded-lg border border-border/70 bg-muted/30 p-1'>
          {[
            ['all', 'Semua'],
            ['active', 'Active'],
            ['expired', 'Expired'],
            ['cancelled', 'Cancelled']
          ].map(([key, label]) => (
            <button
              key={key}
              type='button'
              onClick={() => setFilter(key)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                filter === key
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {label}
              <span className='text-muted-foreground ml-1 tabular-nums'>
                ({counts[key as keyof typeof counts] ?? subs.filter((s) => s.status === key).length}
                )
              </span>
            </button>
          ))}
        </div>
        <Button onClick={() => setAssignOpen(true)}>
          <Icons.add className='mr-2 size-4' />
          Assign Paket
        </Button>
      </div>

      {/* Table */}
      <div className='overflow-hidden rounded-xl border border-border/70 shadow-sm'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/30 hover:bg-muted/30'>
              <TableHead className='w-12 ps-6 text-xs font-semibold uppercase tracking-wider'>
                <span aria-label='Nomor'>#</span>
              </TableHead>
              <TableHead className='text-xs font-semibold uppercase tracking-wider'>
                Tenant
              </TableHead>
              <TableHead className='text-xs font-semibold uppercase tracking-wider'>
                Paket
              </TableHead>
              <TableHead className='text-xs font-semibold uppercase tracking-wider'>
                Status
              </TableHead>
              <TableHead className='text-xs font-semibold uppercase tracking-wider text-right'>
                Mulai
              </TableHead>
              <TableHead className='text-xs font-semibold uppercase tracking-wider text-right'>
                Berakhir
              </TableHead>
              <TableHead className='pe-6 text-xs font-semibold uppercase tracking-wider text-right'>
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className='divide-y divide-border/80'>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='text-muted-foreground py-12 text-center'>
                  <Icons.chartBar className='mx-auto size-8 text-muted-foreground/30' />
                  <p className='mt-2 text-sm'>Belum ada langganan</p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((sub, i) => (
                <TableRow key={sub.id} className='group transition-colors hover:bg-muted/35'>
                  <TableCell className='text-muted-foreground ps-6 text-sm tabular-nums'>
                    {i + 1}
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2.5'>
                      <Avatar className='size-8 border shadow-xs'>
                        <AvatarFallback className='bg-primary/10 text-primary text-xs font-semibold'>
                          {initials(sub.client_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className='text-sm font-medium'>{sub.client_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className='text-sm font-medium'>{sub.plan_name}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-medium',
                        STATUS_STYLES[sub.status] ?? STATUS_STYLES.cancelled
                      )}
                    >
                      {STATUS_LABELS[sub.status] ?? sub.status}
                    </span>
                  </TableCell>
                  <TableCell className='text-muted-foreground text-right text-xs'>
                    {formatDate(sub.start_date)}
                  </TableCell>
                  <TableCell className='text-muted-foreground text-right text-xs'>
                    {formatDate(sub.end_date)}
                  </TableCell>
                  <TableCell className='pe-6 text-right'>
                    {sub.status === 'active' ? (
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-destructive text-xs h-7'
                        onClick={() => setCancelling({ id: sub.id, client_name: sub.client_name })}
                      >
                        Batalkan
                      </Button>
                    ) : (
                      <span className='text-muted-foreground text-xs'>—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Assign Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Paket ke Tenant</DialogTitle>
            <DialogDescription>
              Pilih tenant dan paket langganan yang ingin ditugaskan.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-2'>
            <div className='flex flex-col gap-1.5'>
              <label htmlFor='assign-tenant' className='text-xs font-medium'>
                Tenant
              </label>
              <Select
                value={assignForm.client_id}
                onValueChange={(v) => setAssignForm((p) => ({ ...p, client_id: v }))}
              >
                <SelectTrigger id='assign-tenant'>
                  <SelectValue placeholder='Pilih tenant...' />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='flex flex-col gap-1.5'>
              <label htmlFor='assign-plan' className='text-xs font-medium'>
                Paket
              </label>
              <Select
                value={assignForm.plan_id}
                onValueChange={(v) => setAssignForm((p) => ({ ...p, plan_id: v }))}
              >
                <SelectTrigger id='assign-plan'>
                  <SelectValue placeholder='Pilih paket...' />
                </SelectTrigger>
                <SelectContent>
                  {plans
                    .filter((p) => p.is_active)
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({FORMATTER.format(p.price_monthly)}/bln)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className='flex flex-col gap-1.5'>
              <label htmlFor='assign-duration' className='text-xs font-medium'>
                Durasi (hari)
              </label>
              <Input
                id='assign-duration'
                type='number'
                value={assignForm.duration_days}
                onChange={(e) =>
                  setAssignForm((p) => ({ ...p, duration_days: Number(e.target.value) }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setAssignOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAssign}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation */}
      <AlertDialog
        open={!!cancelling}
        onOpenChange={(o) => {
          if (!o) setCancelling(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan Langganan</AlertDialogTitle>
            <AlertDialogDescription>
              Yakin ingin membatalkan langganan &quot;{cancelling?.client_name}&quot;? Tenant akan
              kehilangan akses ke fitur paket ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className='bg-destructive text-destructive-foreground'
            >
              Batalkan Langganan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
