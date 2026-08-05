'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useStore } from '@tanstack/react-form';
import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAppForm } from '@/components/ui/tanstack-form';
import { TextField } from '@/components/forms/fields';
import { tenantRegisterSchema, type TenantRegisterInput } from '../schemas/auth-schema';
import { useRegisterMutation } from '../api/queries';

function getPasswordChecks(password: string) {
  return {
    length: password.length >= 8,
    numberOrSymbol: /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password),
    mixedCase: /[a-z]/.test(password) && /[A-Z]/.test(password)
  };
}

const RegisterForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const registerMutation = useRegisterMutation();

  const form = useAppForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    } as TenantRegisterInput,
    validators: {
      onBlur: tenantRegisterSchema
    },
    onSubmit: async ({ value }) => {
      try {
        setRegisterError(null);
        const res = await registerMutation.mutateAsync({
          name: value.name,
          email: value.email,
          password: value.password,
          confirm_password: value.confirmPassword
        });

        if (res.success) {
          router.push(`/check-email?email=${encodeURIComponent(value.email)}`);
        } else {
          setRegisterError(res.message || 'Terjadi kesalahan');
        }
      } catch (error: unknown) {
        setRegisterError(error instanceof Error ? error.message : 'Silakan coba lagi nanti');
      }
    }
  });

  const formValues = useStore(form.store, (s) => s.values);

  const passwordChecks = useMemo(
    () => getPasswordChecks(formValues.password),
    [formValues.password]
  );

  return (
    <div className='flex flex-col w-full'>
      <header className='flex flex-col items-center text-center mb-6'>
        <div className='relative flex items-center justify-center mb-4 h-16 w-full max-w-[250px]'>
          <Image
            src='/uration-blue-version.png'
            alt='Urator Logo'
            width={160}
            height={32}
            className='relative h-full w-auto object-contain'
          />
        </div>
        <h1 className='text-2xl font-bold text-foreground mb-2'>Buat akun</h1>
        <p className='text-muted-foreground text-sm'>Isi data Anda untuk membuat akun.</p>
      </header>

      <form.AppForm>
        <form.Form className='space-y-5 w-full'>
          {registerError && (
            <Alert variant='destructive' className='mb-2'>
              <AlertTitle className='text-sm font-semibold'>Pendaftaran gagal</AlertTitle>
              <AlertDescription className='text-sm'>{registerError}</AlertDescription>
            </Alert>
          )}

          <form.AppField
            name='name'
            children={(field) => (
              <TextField
                label='Nama lengkap'
                type='text'
                placeholder='Nama lengkap'
                autoComplete='name'
                name='name'
                leftIcon={<Icons.user className='h-5 w-5' />}
                className='pl-10 h-11 border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/40 text-sm placeholder:text-muted-foreground bg-background'
              />
            )}
          />

          <form.AppField
            name='email'
            children={(field) => (
              <TextField
                label='Alamat email'
                type='email'
                placeholder='Alamat email'
                autoComplete='email'
                name='email'
                leftIcon={<Icons.mail className='h-5 w-5' />}
                className='pl-10 h-11 border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/40 text-sm placeholder:text-muted-foreground bg-background'
              />
            )}
          />

          <form.AppField
            name='password'
            children={(field) => (
              <TextField
                label='Kata sandi'
                type={showPassword ? 'text' : 'password'}
                placeholder='Kata sandi'
                autoComplete='new-password'
                name='password'
                hideError
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

          <div className='-mt-1 mb-1 flex flex-col gap-1.5'>
            <ValidationItem label='Minimal 8 karakter' valid={passwordChecks.length} />
            <ValidationItem
              label='Minimal satu angka (0-9) atau simbol'
              valid={passwordChecks.numberOrSymbol}
            />
            <ValidationItem
              label='Huruf kecil (a-z) dan huruf besar (A-Z)'
              valid={passwordChecks.mixedCase}
            />
          </div>

          <form.AppField
            name='confirmPassword'
            children={(field) => (
              <TextField
                label='Ulangi kata sandi'
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder='Ulangi kata sandi'
                autoComplete='new-password'
                name='confirmPassword'
                leftIcon={<Icons.lock className='h-5 w-5' />}
                rightElement={
                  <button
                    type='button'
                    tabIndex={-1}
                    aria-label={
                      showConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'
                    }
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='cursor-pointer text-muted-foreground hover:text-foreground transition-colors'
                  >
                    {showConfirmPassword ? (
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

          <form.SubmitButton
            className='w-full h-11 rounded-xl font-semibold text-sm'
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? (
              <>
                <Icons.spinner className='mr-2 h-5 w-5 animate-spin' />
                Sedang mendaftar...
              </>
            ) : (
              'Daftar'
            )}
          </form.SubmitButton>
        </form.Form>
      </form.AppForm>

      <footer className='mt-6 text-center'>
        <p className='text-sm text-muted-foreground'>
          Sudah punya akun?{' '}
          <Link href='/login' className='text-foreground font-bold hover:underline transition-all'>
            Masuk
          </Link>
        </p>
      </footer>
    </div>
  );
};

function ValidationItem({ label, valid }: { label: string; valid: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 text-xs ${
        valid ? 'text-green-500' : 'text-muted-foreground'
      }`}
    >
      {valid ? (
        <Icons.check className='h-3.5 w-3.5 text-green-500' />
      ) : (
        <span className='h-1.5 w-1.5 rounded-full bg-muted-foreground' />
      )}
      <span>{label}</span>
    </div>
  );
}

export default RegisterForm;
