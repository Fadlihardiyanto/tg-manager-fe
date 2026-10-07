'use client';

import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useAppForm } from '@/components/ui/tanstack-form';
import { TextField, authInputClass } from '@/components/forms/fields';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { TenantLoginInput } from '../schemas/auth-schema';
import { useLoginMutation, useResendVerificationMutation } from '../api/queries';
import { useAuthStore } from '@/stores/auth-store';

const RESEND_COOLDOWN = 60;

function isUnverifiedEmailError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('belum diverifikasi') ||
    lower.includes('not verified') ||
    lower.includes('email not verified') ||
    lower.includes('unverified')
  );
}

const emailSchema = z.string().email('Email tidak valid');
const passwordSchema = z.string().min(6, 'Kata sandi minimal 6 karakter');

export function TenantLoginForm({ ...props }: React.ComponentProps<'form'>) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLoginMutation();
  const resendMutation = useResendVerificationMutation();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    if (!unverifiedEmail || cooldown > 0 || resendMutation.isPending) return;
    const res = await resendMutation.mutateAsync({ email: unverifiedEmail });
    if (res.success) {
      setCooldown(RESEND_COOLDOWN);
    }
  }, [unverifiedEmail, cooldown, resendMutation]);

  const form = useAppForm({
    defaultValues: {
      email: '',
      password: ''
    } as TenantLoginInput,
    onSubmit: async ({ value }) => {
      try {
        setLoginError(null);
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
            const slug = res.data.client?.slug;
            router.push(slug ? `/${slug}/dashboard/overview` : '/dashboard/overview');
          }
        } else {
          const msg = res.message || 'Kredensial tidak valid';
          if (isUnverifiedEmailError(msg)) {
            setUnverifiedEmail(value.email);
            setCooldown(RESEND_COOLDOWN);
          } else {
            setLoginError(msg);
          }
        }
      } catch (error: unknown) {
        setLoginError(error instanceof Error ? error.message : 'Silakan coba lagi nanti');
      }
    }
  });

  return (
    <div className='flex flex-col w-full'>
      <header className='flex flex-col items-center text-center mb-8'>
        <div className='md:hidden relative flex items-center justify-center mb-4 h-12 w-full max-w-[200px]'>
          <Image
            src='/assets/urator.png'
            alt='Urator Logo'
            width={96}
            height={32}
            className='relative h-full w-auto object-contain'
          />
        </div>
        <h1 className='text-2xl font-bold tracking-tight text-foreground'>
          Selamat datang kembali
        </h1>
      </header>

      <form.AppForm>
        <form.Form className='space-y-5 w-full' {...props}>
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

          {loginError && (
            <Alert variant='destructive' className='mb-3'>
              <AlertTitle className='text-sm font-semibold'>Gagal masuk</AlertTitle>
              <AlertDescription className='text-sm'>{loginError}</AlertDescription>
            </Alert>
          )}

          <form.AppField
            name='email'
            validators={{ onBlur: emailSchema }}
            children={(field) => (
              <TextField
                label='Email'
                type='email'
                placeholder='Masukkan email Anda'
                autoComplete='email'
                name='email'
                leftIcon={<Icons.mail className='h-5 w-5' />}
                className={authInputClass}
              />
            )}
          />

          <form.AppField
            name='password'
            validators={{ onBlur: passwordSchema }}
            children={(field) => (
              <TextField
                label='Kata Sandi'
                type={showPassword ? 'text' : 'password'}
                placeholder='Masukkan kata sandi'
                autoComplete='current-password'
                name='password'
                leftIcon={<Icons.lock className='h-5 w-5' />}
                rightElement={
                  <button
                    type='button'
                    tabIndex={-1}
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    onClick={() => setShowPassword(!showPassword)}
                    className='cursor-pointer text-muted-foreground hover:text-foreground transition-colors p-2'
                  >
                    {showPassword ? (
                      <Icons.eyeOff className='h-5 w-5' />
                    ) : (
                      <Icons.eye className='h-5 w-5' />
                    )}
                  </button>
                }
                className={authInputClass}
              />
            )}
          />

          <div className='flex items-center justify-end text-sm pt-1'>
            <Link
              href='/forgot-password'
              className='text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 decoration-border'
            >
              Lupa kata sandi?
            </Link>
          </div>

          <form.SubmitButton
            className='w-full h-11 rounded-xl font-semibold text-sm'
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
