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

export function TenantLoginForm({ className, ...props }: React.ComponentProps<'form'>) {
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
      toast.success('Verification email resent', {
        description: res.message || 'Please check your inbox.'
      });
      setCooldown(RESEND_COOLDOWN);
    } else {
      toast.error('Resend failed', {
        description: res.message || 'Please try again later.'
      });
    }
  }, [unverifiedEmail, cooldown, resendMutation]);

  const form = useAppForm({
    defaultValues: {
      email: '',
      password: ''
    } as TenantLoginInput,
    validators: {
      onChange: tenantLoginSchema
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
          const msg = res.message || 'Invalid credentials';
          // BE guide: Detect 403 unverified email and show resend option
          if (isUnverifiedEmailError(msg)) {
            setUnverifiedEmail(value.email);
            setCooldown(RESEND_COOLDOWN);
          } else {
            toast.error('Login failed', { description: msg });
          }
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Please try again later';
        toast.error('Login failed', { description: message });
      }
    }
  });

  return (
    <div className='flex flex-col w-full'>
      {/* BEGIN: Header Section */}
      <header className='flex flex-col items-center text-center mb-6'>
        <div className='relative flex items-center justify-center mb-4 h-16 w-full max-w-[250px]'>
          <img
            src='/uration-blue-version.png'
            alt='Uration Logo'
            className='relative h-full w-auto object-contain'
          />
        </div>
        <h1 className='text-2xl font-bold text-foreground mb-2'>Welcome back</h1>
        <p className='text-muted-foreground text-sm'>Please enter your details to sign in.</p>
      </header>

      <form.AppForm>
        <form.Form className='space-y-5 w-full' {...props}>
          {/* Unverified Email Alert */}
          {unverifiedEmail && (
            <Alert className='mb-4 border-amber-500/30 bg-amber-500/5 [&>svg]:mt-0.5'>
              <Icons.warning className='text-amber-500' />
              <AlertTitle className='text-sm font-semibold text-foreground'>
                Email Not Verified
              </AlertTitle>
              <AlertDescription className='space-y-3 text-muted-foreground'>
                <p className='text-sm'>
                  Please verify your email address before signing in. Check your inbox for the
                  verification link.
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
                        Sending...
                      </>
                    ) : cooldown > 0 ? (
                      <>
                        <Icons.clock className='mr-1.5 h-3.5 w-3.5' />
                        Resend in {cooldown}s
                      </>
                    ) : (
                      <>
                        <Icons.refresh className='mr-1.5 h-3.5 w-3.5' />
                        Resend Verification Email
                      </>
                    )}
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => setUnverifiedEmail(null)}
                  >
                    Dismiss
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
                label=''
                type='email'
                placeholder='Enter your email...'
                className='px-4 h-12 border border-border rounded-xl focus-visible:ring-ring text-base placeholder:text-muted-foreground bg-background'
              />
            )}
          />

          {/* Password */}
          <form.AppField
            name='password'
            children={(field) => (
              <TextField
                label=''
                type={showPassword ? 'text' : 'password'}
                placeholder='••••••••••'
                rightElement={
                  <button
                    type='button'
                    tabIndex={-1}
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
                className='px-4 h-12 border border-border rounded-xl focus-visible:ring-ring font-mono tracking-widest text-base placeholder:text-muted-foreground bg-background'
              />
            )}
          />

          {/* Remember Me & Forgot Password */}
          <div className='flex items-center justify-between text-sm py-2'>
            <div className='flex items-center gap-2'>
              <Checkbox
                id='remember-me'
                className='h-4 w-4 rounded border-primary text-primary-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary'
              />
              <Label
                htmlFor='remember-me'
                className='cursor-pointer text-sm font-medium text-foreground'
              >
                Remember me
              </Label>
            </div>
            <Link
              href='/forgot-password'
              className='text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 decoration-border'
            >
              Forgot password?
            </Link>
          </div>

          <form.SubmitButton
            className='w-full bg-primary text-primary-foreground font-semibold h-12 rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all mt-4 text-base'
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <Icons.spinner className='mr-2 h-5 w-5 animate-spin' />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </form.SubmitButton>
        </form.Form>
      </form.AppForm>

      {/* BEGIN: Footer */}
      <footer className='mt-6 text-center'>
        <p className='text-sm text-muted-foreground'>
          Don&apos;t have an account yet?{' '}
          <Link
            href='/register-tenant'
            className='text-foreground font-bold hover:underline transition-all'
          >
            Sign Up
          </Link>
        </p>
      </footer>
    </div>
  );
}
