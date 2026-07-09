'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { useResendVerificationMutation } from '../api/queries';
import { toast } from 'sonner';

const COOLDOWN_SECONDS = 60;

export default function CheckEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';
  const resendMutation = useResendVerificationMutation();

  const [cooldown, setCooldown] = useState(COOLDOWN_SECONDS);
  const [isCooldownActive, setIsCooldownActive] = useState(true);

  // Countdown timer
  useEffect(() => {
    if (!isCooldownActive) return;
    if (cooldown <= 0) {
      setIsCooldownActive(false);
      return;
    }
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown, isCooldownActive]);

  const handleResend = useCallback(async () => {
    if (!email || isCooldownActive || resendMutation.isPending) return;

    const res = await resendMutation.mutateAsync({ email });
    if (res.success) {
      toast.success('Email verifikasi terkirim ulang', {
        description: res.message || 'Silakan periksa kotak masuk Anda lagi.'
      });
      // Restart cooldown
      setCooldown(COOLDOWN_SECONDS);
      setIsCooldownActive(true);
    } else {
      toast.error('Gagal mengirim ulang', {
        description: res.message || 'Silakan coba lagi nanti.'
      });
    }
  }, [email, isCooldownActive, resendMutation]);

  // If no email param, redirect back to register
  useEffect(() => {
    if (!email) {
      router.replace('/register-tenant');
    }
  }, [email, router]);

  if (!email) return null;

  return (
    <div className='flex h-svh items-center justify-center overflow-hidden bg-background p-4 md:p-6'>
      <Card className='relative flex w-full max-w-[480px] flex-col items-center overflow-hidden rounded-2xl p-0 shadow-sm'>
        <CardContent className='flex flex-col items-center gap-6 p-8 text-center md:p-10'>
          {/* Back to home */}
          <div className='flex w-full justify-start'>
            <Button asChild variant='outline' size='icon' className='rounded-lg'>
              <Link href='/'>
                <Icons.arrowLeft className='h-4 w-4' />
              </Link>
            </Button>
          </div>

          {/* Mail Icon */}
          <div className='flex h-16 w-16 items-center justify-center rounded-full bg-primary/10'>
            <Icons.send className='h-7 w-7 text-primary' />
          </div>

          {/* Heading */}
          <div className='space-y-2'>
            <h1 className='text-2xl font-bold tracking-tight'>Periksa Email Anda</h1>
            <p className='text-sm text-muted-foreground'>
              Kami telah mengirim tautan verifikasi ke
            </p>
            <p className='text-sm font-semibold text-foreground break-all'>{email}</p>
          </div>

          {/* Instructions */}
          <div className='space-y-3 text-left w-full rounded-lg border border-border bg-muted/40 p-4'>
            <div className='flex items-start gap-3'>
              <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary'>
                1
              </div>
              <p className='text-sm text-muted-foreground'>Buka kotak masuk email Anda</p>
            </div>
            <div className='flex items-start gap-3'>
              <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary'>
                2
              </div>
              <p className='text-sm text-muted-foreground'>
                Klik tautan verifikasi pada email yang kami kirim
              </p>
            </div>
            <div className='flex items-start gap-3'>
              <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary'>
                3
              </div>
              <p className='text-sm text-muted-foreground'>
                Anda akan otomatis masuk dan diarahkan ke pengaturan workspace
              </p>
            </div>
          </div>

          {/* Resend Button */}
          <div className='flex flex-col items-center gap-2'>
            <p className='text-sm text-muted-foreground'>Belum menerima email?</p>
            <Button
              variant='outline'
              size='lg'
              className='min-w-[200px]'
              disabled={isCooldownActive || resendMutation.isPending}
              onClick={handleResend}
            >
              {resendMutation.isPending ? (
                <>
                  <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
                  Mengirim...
                </>
              ) : isCooldownActive ? (
                <>
                  <Icons.clock className='mr-2 h-4 w-4' />
                  Kirim ulang dalam {cooldown} detik
                </>
              ) : (
                <>
                  <Icons.refresh className='mr-2 h-4 w-4' />
                  Kirim Ulang Email Verifikasi
                </>
              )}
            </Button>
          </div>

          {/* Sign in link */}
          <p className='text-sm text-muted-foreground'>
            Sudah verifikasi?{' '}
            <Link
              href='/login'
              className='font-bold text-primary transition-colors hover:text-primary/80'
            >
              Masuk
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
