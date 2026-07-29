'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import DashboardMock from '@/components/landing-page/dashboard-mock';
import { Icons } from '@/components/icons';

const Hero = () => {
  const t = useTranslations('Hero');
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <div className='relative min-h-[calc(100vh-4rem)] w-full flex items-center justify-center overflow-hidden'>
      <div className='absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_60%),radial-gradient(ellipse_at_bottom_left,hsl(var(--primary)/0.04),transparent_50%)]' />
      <div className='max-w-(--breakpoint-xl) w-full flex flex-col lg:flex-row mx-auto items-center justify-between gap-y-14 gap-x-10 px-6 py-12 lg:py-0'>
        <div className='max-w-xl animate-fade-up'>
          <h1 className='mt-6 max-w-[20ch] text-4xl xs:text-5xl sm:text-6xl lg:text-[4rem] xl:text-7xl font-bold leading-[1.1]! tracking-tight'>
            {t.rich('title', {
              br: () => <br />,
              highlight: (chunks) => <span className='text-primary'>{chunks}</span>
            })}
          </h1>
          <p className='mt-6 max-w-[60ch] xs:text-lg text-muted-foreground animate-fade-up-delay-1'>
            {t('description')}
          </p>
          <div className='mt-12 flex flex-col sm:flex-row items-center gap-4 animate-fade-up-delay-2'>
            <Button size='lg' className='w-full sm:w-auto rounded-full text-base' asChild>
              <Link href='/register-tenant'>
                {t('getStarted')} <Icons.arrowUpRight className='h-5! w-5!' />
              </Link>
            </Button>
            <Button
              variant='outline'
              size='lg'
              className='w-full sm:w-auto rounded-full text-base shadow-none'
              onClick={() => setIsDemoOpen(true)}
            >
              <Icons.play className='h-5! w-5!' /> {t('watchDemo')}
            </Button>
          </div>
        </div>
        <div className='relative lg:max-w-lg xl:max-w-xl w-full animate-fade-up-delay-3'>
          <DashboardMock />
        </div>
      </div>

      <Modal
        title={t('demoTitle')}
        description={t('demoDescription')}
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
      >
        <div className='overflow-hidden rounded-lg border border-border bg-background'>
          <video
            key={isDemoOpen ? 'open' : 'closed'}
            src='/Urator.mp4'
            controls
            autoPlay
            muted
            playsInline
            className='aspect-video w-full max-h-[70vh] object-cover'
          >
            {t('browserNotSupported')}
          </video>
        </div>
      </Modal>
    </div>
  );
};

export default Hero;
