import Link from 'next/link';
import { Icons } from '@/components/icons';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ForgotPasswordForm } from './forgot-password-form';

export default function ForgotPasswordPageLayout() {
  return (
    <div className='flex min-h-svh w-full items-center justify-center p-4 md:p-6 bg-background'>
      <div className='w-full max-w-md flex flex-col gap-4'>
        <div className="flex">
          <Button 
            asChild 
            variant='ghost' 
            className='text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent -ml-2'
          >
            <Link href='/'>
              <Icons.arrowLeft className='mr-2 h-4 w-4' />
              Back to Home
            </Link>
          </Button>
        </div>
        <Card className='w-full p-6 md:p-8 border-border shadow-[0_4px_12px_rgb(0,0,0,0.08)] dark:shadow-[0_4px_12px_rgb(0,0,0,0.3)]'>
          <ForgotPasswordForm />
        </Card>
      </div>
    </div>
  );
}
