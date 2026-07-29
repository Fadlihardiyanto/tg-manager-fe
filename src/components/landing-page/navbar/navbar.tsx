import { Button } from '@/components/ui/button';
import { Logo } from './logo';
import { NavMenu } from './nav-menu';
import { NavigationSheet } from './navigation-sheet';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

const Navbar = () => {
  const t = useTranslations('Navbar');

  return (
    <nav className='sticky top-0 z-50 h-16 bg-background/80 backdrop-blur-lg border-b border-accent'>
      <div className='h-full flex items-center justify-between max-w-(--breakpoint-xl) mx-auto px-4 sm:px-6'>
        <Logo />

        {/* Desktop Menu */}
        <NavMenu className='hidden md:block' />

        <div className='flex items-center gap-3'>
          <Button variant='outline' className='hidden sm:inline-flex' asChild>
            <Link href='/login'>{t('signIn')}</Link>
          </Button>
          <Button className='hidden xs:inline-flex' asChild>
            <Link href='/register-tenant'>{t('getStarted')}</Link>
          </Button>

          {/* Mobile Menu */}
          <div className='md:hidden'>
            <NavigationSheet />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
