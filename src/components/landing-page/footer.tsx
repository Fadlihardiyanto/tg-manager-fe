import { Separator } from '@/components/ui/separator';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Icons } from '@/components/icons';

const Footer = () => {
  const t = useTranslations('Footer');

  const footerSections = [
    {
      title: t('product'),
      links: [
        { title: t('features'), href: '#features' },
        { title: t('pricing'), href: '#pricing' },
        { title: t('signIn'), href: '/login' },
        { title: t('signUp'), href: '/register-tenant' }
      ]
    },
    {
      title: t('resources'),
      links: [
        { title: t('documentation'), href: '#' },
        { title: t('faq'), href: '#faq' },
        { title: t('contactSupport'), href: 'https://t.me/UrationSupportBot' }
      ]
    },
    {
      title: t('legal'),
      links: [
        { title: t('termsOfService'), href: '/terms-of-service' as const },
        { title: t('privacyPolicy'), href: '/privacy-policy' as const }
      ]
    }
  ];

  return (
    <footer className='mt-20 bg-background border-t'>
      <div className='max-w-(--breakpoint-xl) mx-auto py-12 flex flex-col md:flex-row justify-between gap-10 px-6'>
        {/* Brand Section */}
        <div className='flex flex-col max-w-sm'>
          {/* Logo */}
          <Link href='/'>
            <Image
              src='/uration-landscape.png'
              alt='Urator Logo'
              width={96}
              height={32}
              className='h-12 w-auto object-contain -ml-2'
            />
          </Link>
          <p className='mt-4 text-sm text-muted-foreground leading-relaxed'>
            {t('brandDescription')}
          </p>
        </div>

        {/* Links Section */}
        <div className='flex gap-12 sm:gap-16 flex-wrap'>
          {footerSections.map(({ title, links }) => (
            <div key={title} className='flex flex-col gap-4'>
              <h6 className='font-semibold text-foreground'>{title}</h6>
              <ul className='space-y-3'>
                {links.map(({ title, href }) =>
                  href === '#' ? (
                    <li key={title}>
                      <span className='inline-flex items-center gap-1.5 text-sm text-muted-foreground/60 cursor-not-allowed'>
                        {title}
                        <span className='text-[10px] bg-muted px-1.5 py-0.5 rounded-full font-medium text-muted-foreground'>
                          Segera
                        </span>
                      </span>
                    </li>
                  ) : (
                    <li key={title}>
                      <Link
                        href={
                          href as
                            | '/'
                            | '/login'
                            | '/register-tenant'
                            | '/terms-of-service'
                            | '/privacy-policy'
                            | '#features'
                            | '#pricing'
                            | '#faq'
                            | 'https://t.me/UrationSupportBot'
                        }
                        className='text-sm text-muted-foreground hover:text-foreground transition-colors'
                      >
                        {title}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className='max-w-(--breakpoint-xl) mx-auto py-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-x-2 gap-y-5 px-6'>
        {/* Copyright */}
        <span className='text-sm text-muted-foreground text-center xs:text-start'>
          &copy; {new Date().getFullYear()}{' '}
          <Link href='/' className='hover:text-foreground transition-colors'>
            Urator
          </Link>
          . {t('rightsReserved')}
        </span>

        {/* Social Icons */}
        <div className='flex items-center gap-5 text-muted-foreground'>
          <Link
            href='https://t.me/urator'
            target='_blank'
            rel='noopener noreferrer'
            className='hover:text-sky-500 transition-colors'
          >
            <Icons.telegram className='h-5 w-5' />
          </Link>
          <Link
            href='https://twitter.com/urator'
            target='_blank'
            rel='noopener noreferrer'
            className='hover:text-foreground transition-colors'
          >
            <Icons.twitter className='h-5 w-5' />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
