'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useAppForm } from '@/components/ui/tanstack-form';
import { TextField } from '@/components/forms/fields';
import { forgotPasswordSchema, type ForgotPasswordInput } from '../schemas/auth-schema';
import { forgotPassword } from '../api/service';

export function ForgotPasswordForm({ ...props }: React.ComponentProps<'form'>) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useAppForm({
    defaultValues: {
      email: ''
    } as ForgotPasswordInput,
    validators: {
      onBlur: forgotPasswordSchema
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      setError(null);
      try {
        await forgotPassword(value);
        setIsSubmitted(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.');
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  const handleRetry = () => {
    form.reset();
    setError(null);
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className='flex flex-col w-full text-center'>
        <div className='flex justify-center mb-6'>
          <div className='flex h-16 w-16 items-center justify-center rounded-full bg-primary/10'>
            <Icons.check className='h-8 w-8 text-primary' />
          </div>
        </div>

        <h1 className='text-2xl font-bold text-foreground mb-2'>Periksa Email Anda</h1>
        <p className='text-sm text-muted-foreground mb-4'>
          Kami telah mengirim tautan reset kata sandi ke{' '}
          <span className='font-semibold text-foreground'>{form.state.values.email}</span>. Silakan
          periksa kotak masuk Anda dan ikuti petunjuknya.
        </p>
        <p className='text-xs text-muted-foreground mb-8'>
          Tidak menemukan email? Coba periksa folder spam atau promosi.
        </p>

        <div className='flex flex-col gap-4'>
          <Button asChild className='w-full h-11 rounded-xl font-semibold text-sm'>
            <Link href='/login'>Kembali ke Masuk</Link>
          </Button>
          <p className='text-center text-sm text-muted-foreground'>
            Belum menerima email?{' '}
            <button
              type='button'
              onClick={handleRetry}
              className='cursor-pointer font-bold text-foreground transition-colors hover:underline'
            >
              Coba lagi
            </button>
          </p>
        </div>
      </div>
    );
  }

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
        <h1 className='text-2xl font-bold text-foreground mb-2'>Lupa kata sandi?</h1>
        <p className='text-muted-foreground text-sm'>
          Masukkan email Anda, kami akan mengirim tautan reset.
        </p>
      </header>

      <form.AppForm>
        <form.Form className='space-y-5 w-full' {...props}>
          <form.AppField
            name='email'
            children={(_field) => (
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

          {error && (
            <p className='text-sm text-destructive' role='alert'>
              {error}
            </p>
          )}

          <form.SubmitButton
            disabled={isSubmitting}
            className='w-full h-11 rounded-xl font-semibold text-sm'
          >
            {isSubmitting ? (
              <span className='flex items-center gap-2'>
                <Icons.spinner className='h-4 w-4 animate-spin' />
                Mengirim...
              </span>
            ) : (
              'Kirim Tautan Reset'
            )}
          </form.SubmitButton>
        </form.Form>
      </form.AppForm>

      <footer className='mt-6 text-center'>
        <Link
          href='/login'
          className='inline-flex items-center gap-1.5 text-sm font-bold text-foreground transition-colors hover:underline'
        >
          <Icons.arrowLeft className='h-4 w-4' />
          Kembali ke Masuk
        </Link>
      </footer>
    </div>
  );
}
