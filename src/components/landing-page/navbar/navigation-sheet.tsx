'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { VisuallyHidden as VisuallyHiddenPrimitive } from 'radix-ui';
import { Logo } from './logo';
import { NavMenu } from './nav-menu';
import { Icons } from '@/components/icons';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export const NavigationSheet = () => {
  const t = useTranslations('NavigationSheet');
  const navT = useTranslations('Navbar');

  return (
    <Sheet>
      <VisuallyHiddenPrimitive.Root>
        <SheetTitle>{t('title')}</SheetTitle>
      </VisuallyHiddenPrimitive.Root>
      <SheetTrigger asChild>
        <Button variant='outline' size='icon'>
          <Icons.menu />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <Logo />
        <NavMenu orientation='vertical' className='mt-12' />

        <div className='mt-8 space-y-4'>
          <Button variant='outline' className='w-full sm:hidden' asChild>
            <Link href='/login'>{navT('signIn')}</Link>
          </Button>
          <Button className='w-full xs:hidden' asChild>
            <Link href='/register-tenant'>{navT('getStarted')}</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
