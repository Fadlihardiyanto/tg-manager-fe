import Link from 'next/link';
import { Icons } from '@/components/icons';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RegisterForm from './register-form';

export default function RegisterPageLayout() {
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
        <Card className='rounded-xl w-full p-6 md:p-8'>
          <RegisterForm />
        </Card>
      </div>
    </div>
  );
}
