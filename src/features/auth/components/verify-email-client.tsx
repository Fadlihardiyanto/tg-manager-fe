'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useVerifyEmailQuery } from '../api/queries';
import { useAuthStore } from '@/stores/auth-store';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    if (!token) {
      toast.error('Tautan verifikasi tidak valid', {
        description: 'Token verifikasi tidak ditemukan.'
      });
      router.push('/login');
    }
  }, [token, router]);

  const verifyQuery = useVerifyEmailQuery(token || '');

  useEffect(() => {
    if (!token) return;

    if (verifyQuery.isSuccess) {
      const res = verifyQuery.data;
      if (res && res.success) {
        setAuth({
          accessToken: res.data.access_token,
          user: res.data.user,
          client: res.data.client,
          role: res.data.role,
          needsOnboarding: res.data.needs_onboarding
        });

        toast.success('Email berhasil diverifikasi', {
          description: res.message || 'Anda telah otomatis masuk.'
        });

        if (res.data?.needs_onboarding) {
          router.push('/onboarding');
        } else {
          const slug = res.data?.client?.slug;
          router.push(slug ? `/${slug}/dashboard/overview` : '/dashboard/overview');
        }
      }
    }
  }, [verifyQuery.isSuccess, verifyQuery.data, router, token, setAuth]);

  if (!token) return null;

  return (
    <div className='flex flex-col items-center justify-center gap-6 max-w-sm mx-auto text-center p-6'>
      {verifyQuery.isPending ? (
        <>
          <Icons.spinner className='h-10 w-10 animate-spin text-primary' />
          <div className='space-y-2'>
            <h1 className='text-xl font-semibold tracking-tight'>Memverifikasi email Anda</h1>
            <p className='text-sm text-muted-foreground'>
              Mohon tunggu sementara kami memverifikasi alamat email Anda.
            </p>
          </div>
        </>
      ) : verifyQuery.isError || (verifyQuery.isSuccess && !verifyQuery.data?.success) ? (
        <>
          <div className='h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center'>
            <Icons.close className='h-6 w-6 text-destructive' />
          </div>
          <div className='space-y-4'>
            <h1 className='text-xl font-semibold tracking-tight'>Verifikasi Gagal</h1>
            <p className='text-sm text-muted-foreground'>
              {verifyQuery.data?.message ||
                verifyQuery.error?.message ||
                'Tautan mungkin tidak valid atau sudah kedaluwarsa.'}
            </p>
            <Button asChild>
              <Link href='/login'>Kembali ke Masuk</Link>
            </Button>
          </div>
        </>
      ) : verifyQuery.isSuccess && verifyQuery.data?.success ? (
        <>
          <div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center'>
            <Icons.check className='h-6 w-6 text-primary' />
          </div>
          <div className='space-y-2'>
            <h1 className='text-xl font-semibold tracking-tight'>Email Terverifikasi</h1>
            <p className='text-sm text-muted-foreground'>
              Anda akan segera diarahkan ke langkah berikutnya...
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}
