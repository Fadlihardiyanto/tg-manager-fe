'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useAppForm } from '@/components/ui/tanstack-form';
import { useStore } from '@tanstack/react-form';
import { useSuperadminAuthStore } from '@/stores/superadmin-auth-store';
import { loginAdmin, verifyAdminOtp, resendAdminOtp } from '../api/service';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi')
});

const RESEND_COOLDOWN = 30;

export function AdminLoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const otpCode = digits.join('');
  const clearOTP = () => setDigits(Array(6).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const setAuth = useSuperadminAuthStore((s) => s.setAuth);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    if (!tempToken || cooldown > 0) return;
    const res = await resendAdminOtp({ temp_token: tempToken });
    if (res.success) {
      toast.success('Kode OTP terkirim ulang');
      setCooldown(RESEND_COOLDOWN);
    } else {
      toast.error('Gagal mengirim ulang', { description: res.message });
    }
  }, [tempToken, cooldown]);

  const handleOTPChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    if (!digit) return;
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[index]) {
        const next = [...digits];
        next[index] = '';
        setDigits(next);
      } else if (index > 0) {
        const prev = [...digits];
        prev[index - 1] = '';
        setDigits(prev);
        requestAnimationFrame(() => inputRefs.current[index - 1]?.focus());
      }
    }
  };

  const handleOTPPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    const focusIdx = Math.min(pasted.length, 5);
    requestAnimationFrame(() => inputRefs.current[focusIdx]?.focus());
  };

  const handleVerifyOtp = useCallback(async () => {
    if (!tempToken || otpCode.length < 6) return;
    setIsVerifying(true);
    try {
      const res = await verifyAdminOtp({ temp_token: tempToken, otp_code: otpCode });
      if (res.success && res.data) {
        setAuth({
          accessToken: res.data.access_token,
          admin: res.data.user,
          role: res.data.roles?.[0] || 'superadmin',
          permissions: ['*']
        });
        toast.success('Login berhasil');
        router.push('/superadmin');
      } else {
        toast.error('Kode OTP salah', { description: res.message || 'Silakan coba lagi.' });
      }
    } catch {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsVerifying(false);
    }
  }, [tempToken, otpCode, setAuth, router]);

  const form = useAppForm({
    defaultValues: { email: '', password: '' },
    validators: { onBlur: loginSchema },
    onSubmit: async ({ value }) => {
      try {
        const res = await loginAdmin({ email: value.email, password: value.password });
        if (res.success && res.data) {
          if (res.data.requires_2fa) {
            setTempToken(res.data.temp_token!);
            setStep('otp');
            setCooldown(RESEND_COOLDOWN);
            toast.success('Masukkan kode OTP yang dikirim ke email Anda');
          } else {
            setAuth({
              accessToken: res.data.access_token!,
              admin: res.data.user!,
              role: res.data.roles?.[0] || 'superadmin',
              permissions: ['*']
            });
            toast.success('Login berhasil');
            router.push('/superadmin');
          }
        } else {
          toast.error('Gagal masuk', { description: res.message || 'Kredensial tidak valid.' });
        }
      } catch {
        toast.error('Terjadi kesalahan');
      }
    }
  });

  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);

  if (step === 'otp') {
    return (
      <div className='flex flex-col w-full'>
        <header className='flex flex-col items-center text-center mb-8'>
          <Icons.shieldLock className='size-10 text-primary mb-4' />
          <h1 className='text-2xl font-bold text-foreground'>Verifikasi Dua Langkah</h1>
          <p className='text-muted-foreground text-sm mt-1.5 max-w-sm'>
            Masukkan kode OTP 6 digit yang telah dikirim ke email terdaftar Anda.
          </p>
        </header>

        <div className='flex flex-col gap-6'>
          <div className='flex justify-center gap-3'>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type='text'
                inputMode='numeric'
                autoComplete='one-time-code'
                maxLength={1}
                value={digit}
                onChange={(e) => handleOTPChange(i, e.target.value)}
                onKeyDown={(e) => handleOTPKeyDown(i, e)}
                onPaste={handleOTPPaste}
                aria-label={`Digit ${i + 1}`}
                data-filled={!!digit}
                className='size-12 rounded-lg border text-center text-xl font-bold tabular-nums outline-none transition-all duration-150
                  focus:border-primary focus:ring-2 focus:ring-primary/20
                  data-[filled=true]:border-foreground/30 data-[filled=true]:bg-muted/30
                  [&:not([data-filled=true])]:border-border'
              />
            ))}
          </div>

          <Button
            size='lg'
            className='w-full'
            disabled={otpCode.length < 6 || isVerifying}
            onClick={handleVerifyOtp}
          >
            {isVerifying ? (
              <>
                <Icons.spinner className='mr-2 size-4 animate-spin' />
                Memverifikasi...
              </>
            ) : (
              'Verifikasi'
            )}
          </Button>

          <div className='flex items-center justify-center gap-1 text-sm text-muted-foreground'>
            <span>Tidak menerima kode?</span>
            <Button
              type='button'
              variant='link'
              size='sm'
              className='p-0 h-auto text-sm font-medium'
              disabled={cooldown > 0}
              onClick={handleResend}
            >
              {cooldown > 0 ? `Kirim ulang (${cooldown}s)` : 'Kirim ulang'}
            </Button>
          </div>

          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='text-muted-foreground'
            onClick={() => {
              setStep('login');
              setTempToken(null);
              clearOTP();
            }}
          >
            <Icons.arrowLeft className='mr-2 size-4' />
            Kembali ke login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col w-full'>
      <header className='flex flex-col items-center text-center mb-8'>
        <h1 className='text-2xl font-bold text-foreground'>Panel Admin</h1>
        <p className='text-muted-foreground text-sm mt-1.5'>
          Masuk ke dashboard operator platform.
        </p>
      </header>

      <form.AppForm>
        <form.Form className='space-y-4.5 w-full'>
          <form.TextField
            name='email'
            label='Email'
            type='email'
            placeholder='admin@example.com'
            required
          />

          <form.TextField
            name='password'
            label='Password'
            type='password'
            placeholder='Masukkan password'
            required
          />

          <Button type='submit' size='lg' className='w-full' isLoading={isSubmitting}>
            Masuk
          </Button>
        </form.Form>
      </form.AppForm>
    </div>
  );
}
