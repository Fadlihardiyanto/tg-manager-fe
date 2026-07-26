'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useAppForm } from '@/components/ui/tanstack-form';
import { TextField } from '@/components/forms/fields';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { tenantLoginSchema, type TenantLoginInput } from '../schemas/auth-schema';
import { useLoginMutation, useResendVerificationMutation } from '../api/queries';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

const RESEND_COOLDOWN = 60;

/** Check if the error message indicates an unverified email */
function isUnverifiedEmailError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('belum diverifikasi') ||
    lower.includes('not verified') ||
    lower.includes('email not verified') ||
    lower.includes('unverified')
  );
}

export function TenantLoginForm({ ...props }: React.ComponentProps<'form'>) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLoginMutation();
  const resendMutation = useResendVerificationMutation();
  const setAuth = useAuthStore((s) => s.setAuth);

  // Unverified email state
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    if (!unverifiedEmail || cooldown > 0 || resendMutation.isPending) return;
    const res = await resendMutation.mutateAsync({ email: unverifiedEmail });
    if (res.success) {
      toast.success('Email verifikasi terkirim ulang', {
        description: res.message || 'Silakan periksa kotak masuk Anda.'
      });
      setCooldown(RESEND_COOLDOWN);
    } else {
      toast.error('Gagal mengirim ulang', {
        description: res.message || 'Silakan coba lagi nanti.'
      });
    }
  }, [unverifiedEmail, cooldown, resendMutation]);

  const form = useAppForm({
    defaultValues: {
      email: '',
      password: ''
    } as TenantLoginInput,
    validators: {
      onBlur: tenantLoginSchema
    },
    onSubmit: async ({ value }) => {
      try {
        const res = await loginMutation.mutateAsync({
          email: value.email,
          password: value.password
        });

        if (res.success && res.data) {
          setUnverifiedEmail(null);

          setAuth({
            accessToken: res.data.access_token,
            user: res.data.user,
            client: res.data.client,
            role: res.data.role,
            needsOnboarding: res.data.needs_onboarding
          });

          if (res.data.needs_onboarding) {
            router.push('/onboarding');
          } else {
            router.push('/dashboard/overview');
          }
        } else {
          const msg = res.message || 'Kredensial tidak valid';
          // BE guide: Detect 403 unverified email and show resend option
          if (isUnverifiedEmailError(msg)) {
            setUnverifiedEmail(value.email);
            setCooldown(RESEND_COOLDOWN);
          } else {
            toast.error('Gagal masuk', { description: msg });
          }
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Silakan coba lagi nanti';
        toast.error('Gagal masuk', { description: message });
      }
    }
  });

  return (
    <div className='flex flex-col w-full'>
      {/* BEGIN: Header Section */}
      <header className='flex flex-col items-center text-center mb-8'>
        <h1 className='text-2xl font-bold text-foreground'>Selamat datang kembali</h1>
        <p className='text-muted-foreground text-sm mt-1.5'>Silakan masuk ke akun Anda.</p>
      </header>

      <form.AppForm>
        <form.Form className='space-y-4.5 w-full' {...props}>
          {/* Unverified Email Alert */}
          {unverifiedEmail && (
            <Alert className='mb-3 border-amber-500/30 bg-amber-500/5 [&>svg]:mt-0.5'>
              <Icons.warning className='text-amber-500' />
              <AlertTitle className='text-sm font-semibold text-foreground'>
                Email belum diverifikasi
              </AlertTitle>
              <AlertDescription className='space-y-3 text-muted-foreground'>
                <p className='text-sm'>
                  Verifikasi alamat email Anda sebelum masuk. Periksa kotak masuk Anda untuk tautan
                  verifikasi.
                </p>
                <div className='flex items-center gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    disabled={cooldown > 0 || resendMutation.isPending}
                    onClick={handleResend}
                  >
                    {resendMutation.isPending ? (
                      <>
                        <Icons.spinner className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                        Mengirim...
                      </>
                    ) : cooldown > 0 ? (
                      <>
                        <Icons.clock className='mr-1.5 h-3.5 w-3.5' />
                        Kirim ulang dalam {cooldown} detik
                      </>
                    ) : (
                      <>
                        <Icons.refresh className='mr-1.5 h-3.5 w-3.5' />
                        Kirim Ulang Email Verifikasi
                      </>
                    )}
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => setUnverifiedEmail(null)}
                  >
                    Tutup
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Email */}
          <form.AppField
            name='email'
            children={(field) => (
              <TextField
                label='Email'
                type='email'
                placeholder='Masukkan email Anda'
                leftIcon={<Icons.mail className='h-5 w-5' />}
                className='pl-10 h-11 border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/40 text-sm placeholder:text-muted-foreground bg-background'
              />
            )}
          />

          {/* Password */}
          <form.AppField
            name='password'
            children={(field) => (
              <TextField
                label='Kata Sandi'
                type={showPassword ? 'text' : 'password'}
                placeholder='Masukkan kata sandi'
                leftIcon={<Icons.lock className='h-5 w-5' />}
                rightElement={
                  <button
                    type='button'
                    tabIndex={-1}
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    onClick={() => setShowPassword(!showPassword)}
                    className='cursor-pointer text-muted-foreground hover:text-foreground transition-colors'
                  >
                    {showPassword ? (
                      <Icons.eyeOff className='h-5 w-5' />
                    ) : (
                      <Icons.eye className='h-5 w-5' />
                    )}
                  </button>
                }
                className='pl-10 h-11 border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/40 text-sm placeholder:text-muted-foreground bg-background'
              />
            )}
          />

          {/* Remember Me & Forgot Password */}
          <div className='flex items-center justify-between text-sm pt-1'>
            <div className='flex items-center gap-2'>
              <Checkbox
                id='remember-me'
                className='h-4 w-4 rounded border-primary text-primary-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary'
              />
              <Label
                htmlFor='remember-me'
                className='cursor-pointer text-sm font-medium text-foreground select-none'
              >
                Ingat saya
              </Label>
            </div>
            <Link
              href='/forgot-password'
              className='text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 decoration-border'
            >
              Lupa kata sandi?
            </Link>
          </div>

          <form.SubmitButton
            className='w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold h-11 rounded-xl hover:from-primary/90 hover:to-primary/70 active:scale-[0.98] transition-all mt-2 text-sm'
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <Icons.spinner className='mr-2 h-5 w-5 animate-spin' />
                Sedang masuk...
              </>
            ) : (
              'Masuk'
            )}
          </form.SubmitButton>
        </form.Form>
      </form.AppForm>
    </div>
  );
}
