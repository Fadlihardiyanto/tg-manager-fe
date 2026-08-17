'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { reportSettingsQueryOptions, useSaveReportSettings } from '../api/queries';
import { botsQueryOptions } from '@/features/bots/api/queries';

export function ReportSettingsForm() {
  const { data: settingsRes, isLoading } = useQuery(reportSettingsQueryOptions());
  const { data: botsData } = useQuery(botsQueryOptions());
  const saveMut = useSaveReportSettings();

  const [enabled, setEnabled] = useState(false);
  const [targetChatId, setTargetChatId] = useState('');
  const [botId, setBotId] = useState('');
  const [reportTime, setReportTime] = useState('08:00');

  const bots = (botsData?.data ?? []).filter((b) => b.is_active);

  useEffect(() => {
    const s = settingsRes?.success ? settingsRes.data : null;
    if (s) {
      setEnabled(s.enabled);
      setTargetChatId(s.target_chat_id ? String(s.target_chat_id) : '');
      setBotId(s.bot_id);
      setReportTime(s.report_time || '08:00');
    } else {
      // server mengembalikan state default walau belum pernah disimpan
      setEnabled(false);
      setReportTime('08:00');
    }
  }, [settingsRes]);

  const handleSave = async () => {
    const chatId = Number(targetChatId.trim());
    if (!targetChatId.trim() || !Number.isInteger(chatId) || chatId < 1) {
      toast.error('Target chat ID wajib diisi angka minimal 1');
      return;
    }
    if (!botId) {
      toast.error('Pilih bot pengirim laporan');
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(reportTime)) {
      toast.error('Waktu laporan harus format HH:MM');
      return;
    }

    const res = await saveMut.mutateAsync({
      enabled,
      target_chat_id: chatId,
      bot_id: botId,
      report_time: reportTime
    });
    if (res.success) toast.success('Pengaturan laporan disimpan');
    else toast.error(res.message || 'Gagal menyimpan pengaturan');
  };

  return (
    <div className='grid gap-4 lg:grid-cols-2'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Icons.post className='size-4 text-primary' />
            Pengaturan Laporan Harian
          </CardTitle>
          <CardDescription>
            Laporan ringkas akan dikirim sebagai DM Telegram setiap hari pada waktu yang ditentukan.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {isLoading ? (
            <p className='py-4 text-sm text-muted-foreground'>Memuat pengaturan...</p>
          ) : (
            <>
              <div className='flex items-center justify-between gap-3 rounded-lg border border-border/70 p-3'>
                <div className='space-y-0.5'>
                  <Label htmlFor='report-enabled' className='text-sm font-semibold'>
                    Aktifkan laporan harian
                  </Label>
                  <p className='text-xs text-muted-foreground'>
                    Kirim DM laporan ringkas ke target chat setiap hari.
                  </p>
                </div>
                <Switch id='report-enabled' checked={enabled} onCheckedChange={setEnabled} />
              </div>

              <div className='flex flex-col gap-2'>
                <Label htmlFor='report-target-chat'>Target Chat ID</Label>
                <Input
                  id='report-target-chat'
                  value={targetChatId}
                  onChange={(e) => setTargetChatId(e.target.value)}
                  placeholder='123456789'
                  inputMode='numeric'
                />
                <p className='text-xs text-muted-foreground'>
                  Chat ID tujuan DM (DM pribadi Anda). Bisa dicek lewat{' '}
                  <a
                    href='https://t.me/userinfobot'
                    target='_blank'
                    rel='noreferrer'
                    className='text-primary underline'
                  >
                    @userinfobot
                  </a>
                  .
                </p>
              </div>

              <div className='flex flex-col gap-2'>
                <Label htmlFor='report-bot'>Bot Pengirim</Label>
                <Select value={botId} onValueChange={setBotId}>
                  <SelectTrigger id='report-bot'>
                    <SelectValue placeholder='Pilih bot...' />
                  </SelectTrigger>
                  <SelectContent>
                    {bots.map((bot) => (
                      <SelectItem key={bot.id} value={bot.id}>
                        @{bot.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className='text-xs text-muted-foreground'>
                  Laporan dikirim dari bot ini. Pastikan pemilik target chat sudah pernah menekan
                  Start pada bot tersebut.
                </p>
              </div>

              <div className='flex flex-col gap-2'>
                <Label htmlFor='report-time'>Waktu Laporan</Label>
                <Input
                  id='report-time'
                  type='time'
                  value={reportTime}
                  onChange={(e) => setReportTime(e.target.value)}
                />
              </div>

              <Button
                onClick={handleSave}
                isLoading={saveMut.isPending}
                className='w-full rounded-full'
              >
                <Icons.check className='mr-2 h-4 w-4' />
                Simpan Pengaturan
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card className='h-fit'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Icons.info className='size-4 text-primary' />
            Contoh Laporan Harian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='rounded-xl border border-border/70 bg-muted/20 p-4 font-mono text-xs leading-relaxed'>
            <p>📊 Laporan Harian — 15/08/2026</p>
            <p className='mt-2'>🔨 Kick member: 12 ✅ · 2 ❌</p>
            <p>⏰ Pengingat: 8 ✅ · 1 ❌</p>
            <p>✉️ DM aktivasi: 5 ✅ · 1 ❌</p>
            <p>📥 Outbox DLQ: 1</p>
            <p className='mt-2'>Total gagal: 4 — cek detail di dashboard › Laporan › Kegagalan</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
