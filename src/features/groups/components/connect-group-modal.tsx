'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTenantPath } from '@/lib/tenant-path';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { generateConnectToken } from '../api/service';
import { groupKeys } from '../api/queries';
import { botsQueryOptions } from '@/features/bots/api/queries';
import type { ConnectStatus } from '../api/types';

interface ConnectGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConnectGroupModal({ open, onOpenChange }: ConnectGroupModalProps) {
  const queryClient = useQueryClient();
  const { data: botsData } = useQuery(botsQueryOptions());
  const { getTenantHref } = useTenantPath();
  const activeBots = (botsData?.data ?? []).filter((b) => b.is_active);
  const botOptions = activeBots.map((b) => ({
    value: b.id,
    label: `@${b.username} (${b.bot_role.replace(/_/g, ' ')})`
  }));

  const [selectedBotId, setSelectedBotId] = useState('');
  const [token, setToken] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [connectStatus, setConnectStatus] = useState<ConnectStatus | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [pollCount, setPollCount] = useState(0);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const startedAtRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const selectedBot = activeBots.find((b) => b.id === selectedBotId);
  const botUsername = selectedBot?.username;
  const command = `/connect@${botUsername} ${token}`;
  const inviteLink = `https://t.me/${botUsername}?startgroup=connect_${token}`;

  // Timer countdown
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  // Clear expired token
  useEffect(() => {
    if (secondsLeft <= 0 && token) {
      setToken('');
      setConnectStatus('expired');
    }
  }, [secondsLeft, token]);

  // Polling connection status every 3s
  useEffect(() => {
    if (!token || !selectedBotId || !secondsLeft) return;

    let cancelled = false;
    let localPollCount = 0;

    const poll = async () => {
      try {
        const res = await fetch(`/api/tenant/bots/${selectedBotId}/groups/connect-status/${token}`);
        const json = await res.json();
        if (cancelled) return;
        if (!json.success || !json.data) return;

        const status = json.data.status as ConnectStatus;
        setConnectStatus(status);
        setPollCount((c) => c + 1);
        setConsecutiveErrors(0);

        if (status === 'success') {
          toast.success('Grup berhasil dihubungkan!');
          void queryClient.invalidateQueries({ queryKey: groupKeys.all });
          setTimeout(() => onOpenChange(false), 800);
        } else if (status === 'expired') {
          setToken('');
          setPollCount(0);
        }
      } catch {
        if (cancelled) return;
        localPollCount++;
        setPollCount((c) => c + 1);
        setConsecutiveErrors((c) => {
          const next = c + 1;
          if (next >= 2) toast.warning('Gagal mengecek status. Mencoba lagi...');
          return next;
        });
      }
    };

    poll();
    const id = setInterval(poll, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [token, selectedBotId, secondsLeft, queryClient, onOpenChange]);

  const timeString = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`;
  const elapsedSeconds = startedAtRef.current
    ? Math.floor((Date.now() - startedAtRef.current) / 1000)
    : 0;

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setSelectedBotId('');
      setToken('');
      setSecondsLeft(0);
      setCopied(false);
      setConnectStatus(null);
      setPollCount(0);
      setConsecutiveErrors(0);
      startedAtRef.current = 0;
    }
  }, [open]);

  const handleCancel = () => {
    setToken('');
    setSecondsLeft(0);
    setConnectStatus(null);
    setPollCount(0);
    setConsecutiveErrors(0);
    startedAtRef.current = 0;
  };

  const handleGenerate = async () => {
    if (!selectedBotId) return;
    setLoading(true);
    const res = await generateConnectToken(selectedBotId);
    setLoading(false);
    if (res.success && res.data) {
      setToken(res.data.token);
      setSecondsLeft(res.data.expires_in);
      setConnectStatus('pending');
      startedAtRef.current = Date.now();
    } else {
      toast.error(res.message || 'Gagal generate kode');
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[480px]'>
        <DialogHeader>
          <DialogTitle>Hubungkan Grup Telegram Baru</DialogTitle>
          <DialogDescription>
            Hubungkan bot Telegram Anda dengan grup menggunakan kode koneksi unik.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-5'>
          {!token && (
            <button
              type='button'
              onClick={() => setShowTutorial(!showTutorial)}
              className='flex items-center gap-2 text-sm text-primary hover:underline'
            >
              <Icons.video className='h-4 w-4' />
              Butuh bantuan?{' '}
              {showTutorial ? 'Sembunyikan tutorial' : 'Tonton tutorial menghubungkan grup'}
            </button>
          )}

          {showTutorial && !token && (
            <div className='rounded-lg overflow-hidden border bg-black'>
              <video
                ref={videoRef}
                src='/group-tutorial.mp4'
                controls
                className='w-full max-h-[300px]'
                preload='metadata'
              >
                Browser tidak mendukung video.
                <track kind='captions' />
              </video>
            </div>
          )}

          {!token && (
            <div className='space-y-2'>
              <label className='text-sm font-medium' htmlFor='connect-group-bot-select'>
                Pilih Bot
              </label>
              {activeBots.length === 0 ? (
                <div className='rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-800'>
                  <p className='font-medium'>Belum ada bot aktif.</p>
                  <p className='mt-1 text-amber-700'>
                    Aktifkan bot Telegram Anda terlebih dahulu sebelum menghubungkan grup.
                  </p>
                  <Button asChild size='sm' className='mt-3 rounded-full'>
                    <Link href={getTenantHref('/dashboard/bots')}>Kelola Bot</Link>
                  </Button>
                </div>
              ) : (
                <Select
                  value={selectedBotId}
                  onValueChange={(v) => {
                    setSelectedBotId(v);
                    setToken('');
                  }}
                  disabled={!!token}
                >
                  <SelectTrigger id='connect-group-bot-select'>
                    <SelectValue placeholder='Pilih bot...' />
                  </SelectTrigger>
                  <SelectContent>
                    {botOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {!token && selectedBotId && (
            <Button onClick={handleGenerate} isLoading={loading} className='w-full'>
              <Icons.add className='mr-2 h-4 w-4' /> Buat Kode Koneksi
            </Button>
          )}

          {token && connectStatus === 'pending' && (
            <>
              <button
                type='button'
                onClick={() => setShowInstructions(!showInstructions)}
                className='flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors'
              >
                <Icons.chevronsDown
                  className={cn('size-4 transition-transform', !showInstructions && '-rotate-90')}
                />
                {showInstructions ? 'Sembunyikan Instruksi' : 'Lihat Instruksi'}
              </button>

              {showInstructions && (
                <div className='space-y-2 text-sm text-muted-foreground'>
                  <ol className='list-decimal list-inside space-y-1'>
                    <li>
                      Masukkan bot ke grup Telegram Anda{' '}
                      <a
                        href={inviteLink}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-primary hover:underline'
                      >
                        (klik di sini)
                      </a>
                      .
                    </li>
                    <li>Jadikan bot sebagai Administrator grup.</li>
                    <li>Kirim kode berikut di dalam grup:</li>
                  </ol>
                </div>
              )}

              <div className='flex items-center gap-2 rounded-lg border bg-muted p-3'>
                <code className='flex-1 font-mono text-sm font-bold text-primary'>{command}</code>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={handleCopy}
                  aria-label='Salin kode koneksi ke clipboard'
                >
                  <Icons.clipboardCopy className={cn('h-4 w-4', copied && 'text-green-500')} />
                  {copied ? 'Tersalin' : 'Salin'}
                  {copied && <span className='sr-only'>Kode berhasil disalin</span>}
                </Button>
              </div>

              <p className='text-sm'>
                <a
                  href={inviteLink}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-2 text-primary hover:underline'
                >
                  <Icons.externalLink className='h-4 w-4' />
                  Tambahkan Bot ke Grup secara Instan
                </a>
              </p>

              <div className='space-y-2 rounded-lg border bg-muted/50 p-3' aria-live='polite'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Icons.clock className='h-4 w-4' />
                  Kode kadaluarsa dalam{' '}
                  <span className='font-mono font-bold text-foreground'>{timeString}</span>
                </div>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Icons.spinner className='h-4 w-4 animate-spin' />
                  Menunggu konfirmasi di Telegram
                  {elapsedSeconds > 0 && ` (${elapsedSeconds} detik)`}
                  ...
                </div>
                {consecutiveErrors >= 2 && (
                  <p className='text-xs text-amber-600'>
                    Gangguan jaringan terdeteksi. Polling tetap berjalan otomatis.
                    {consecutiveErrors >= 3 && (
                      <button
                        type='button'
                        onClick={() => {
                          setConsecutiveErrors(0);
                          setPollCount(0);
                        }}
                        className='ml-2 text-primary hover:underline'
                      >
                        Coba lagi manual
                      </button>
                    )}
                  </p>
                )}
                <button
                  type='button'
                  onClick={handleCancel}
                  className='text-xs text-muted-foreground hover:text-foreground transition-colors'
                >
                  Batalkan koneksi
                </button>
              </div>
            </>
          )}

          {connectStatus === 'expired' && (
            <p className='text-sm text-destructive text-center'>
              Kode koneksi sudah kedaluwarsa. Generate ulang untuk mendapatkan kode baru.
            </p>
          )}
        </div>

        <DialogFooter className='gap-2'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {connectStatus === 'expired' ? 'Tutup' : 'Batal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
