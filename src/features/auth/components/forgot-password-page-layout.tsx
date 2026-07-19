import Link from 'next/link';
import { Icons } from '@/components/icons';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ForgotPasswordForm } from './forgot-password-form';

export default function ForgotPasswordPageLayout() {
  return (
    <div className='w-full min-h-svh flex items-center justify-center p-4 md:p-6'>
      <div className='w-full max-w-md flex flex-col gap-4 animate-fade-up'>
        <div className='flex'>
          <Button
            asChild
            variant='ghost'
            className='text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent -ml-2'
          >
            <Link href='/'>
              <Icons.arrowLeft className='mr-2 h-4 w-4' />
              Kembali ke Beranda
            </Link>
          </Button>
        </div>
        <div className='rounded-2xl bg-gradient-to-br from-border/80 via-border/40 to-transparent p-[1px] shadow-xl shadow-black/5'>
          <Card className='rounded-[15px] w-full p-6 md:p-8 bg-background/80 backdrop-blur-sm'>
            <ForgotPasswordForm />
          </Card>
        </div>
      </div>
    </div>
  );
}
