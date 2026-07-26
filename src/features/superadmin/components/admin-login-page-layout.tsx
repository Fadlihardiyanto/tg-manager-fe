import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { AdminLoginForm } from './admin-login-form';

export default function AdminLoginPageLayout() {
  return (
    <div className='flex min-h-svh w-full items-center justify-center p-4 md:p-8'>
      <div className='absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-primary/[0.02] to-primary/[0.06]' />
      <div className='absolute inset-0 bg-dot-grid opacity-[0.04]' />

      <div className='relative z-10 w-full max-w-md flex flex-col gap-4 animate-fade-up'>
        <div className='rounded-2xl bg-gradient-to-br from-border/80 via-border/40 to-transparent p-[1px] shadow-xl shadow-black/5'>
          <Card className='rounded-[15px] w-full p-8 md:p-10 bg-background/80 backdrop-blur-sm'>
            <div className='flex justify-center mb-6'>
              <Image
                src='/uration-landscape.png'
                alt='Urator Logo'
                width={160}
                height={32}
                className='h-8 w-auto object-contain'
              />
            </div>
            <AdminLoginForm />
          </Card>
        </div>
      </div>
    </div>
  );
}
