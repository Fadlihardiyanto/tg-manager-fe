'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useAppForm } from '@/components/ui/tanstack-form';
import { TextField } from '@/components/forms/fields';
import { IconMail, IconCheck } from '@tabler/icons-react';
import { forgotPasswordSchema, type ForgotPasswordInput } from '../schemas/auth-schema';
import { forgotPassword } from '../api/service';

export function ForgotPasswordForm({ className, ...props }: React.ComponentProps<'form'>) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useAppForm({
    defaultValues: {
      email: ''
    } as ForgotPasswordInput,
    validators: {
      onChange: forgotPasswordSchema
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

  if (isSubmitted) {
    return (
      <div className='flex flex-col w-full text-center'>
        {/* Success Icon */}
        <div className='flex justify-center mb-6'>
          <div className='flex h-16 w-16 items-center justify-center rounded-full bg-primary/10'>
            <IconCheck className='h-8 w-8 text-primary' />
          </div>
        </div>

        {/* Success Message */}
        <h1 className='text-2xl font-bold text-foreground mb-2'>Periksa Email Anda</h1>
        <p className='text-sm text-muted-foreground mb-8'>
          Kami telah mengirim tautan reset kata sandi ke{' '}
          <span className='font-semibold text-foreground'>{form.state.values.email}</span>. Silakan
          periksa kotak masuk Anda dan ikuti petunjuknya.
        </p>

        {/* Actions */}
        <div className='flex flex-col gap-4'>
          <Button
            asChild
            className='w-full h-12 rounded-xl bg-primary text-base font-semibold text-primary-foreground transition-opacity hover:bg-primary/90'
          >
            <Link href='/login'>Kembali ke Masuk</Link>
          </Button>
          <p className='text-center text-sm text-muted-foreground'>
            Belum menerima email?{' '}
            <button
              type='button'
              onClick={() => setIsSubmitted(false)}
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
      {/* BEGIN: Header Section */}
      <header className='flex flex-col items-center text-center mb-6'>
        <div className='relative flex items-center justify-center mb-4 h-16 w-full max-w-[250px]'>
          <img
            src='/uration-blue-version.png'
            alt='Urator Logo'
            className='relative h-full w-auto object-contain'
          />
        </div>
        <h1 className='text-2xl font-bold text-foreground mb-2'>Lupa kata sandi?</h1>
        <p className='text-muted-foreground text-sm'>
          Tidak masalah, kami akan mengirim petunjuk reset.
        </p>
      </header>

      <form.AppForm>
        <form.Form className='space-y-5 w-full' {...props}>
          {/* Email */}
          <form.AppField
            name='email'
            children={(field) => (
              <TextField
                label=''
                type='email'
                placeholder='Alamat email'
                className='px-4 h-12 border border-border rounded-xl focus-visible:ring-ring text-base placeholder:text-muted-foreground bg-background'
              />
            )}
          />

          {/* Error Message */}
          {error && <p className='text-sm text-destructive'>{error}</p>}

          {/* Submit Button */}
          <form.SubmitButton
            disabled={isSubmitting}
            className='w-full bg-primary text-primary-foreground font-semibold h-12 rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all mt-4 text-base'
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

      {/* BEGIN: Footer */}
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
