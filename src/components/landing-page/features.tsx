import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Icons } from '@/components/icons';

const Features = () => {
  const t = useTranslations('Features');

  const features = [
    {
      icon: Icons.creditCard,
      title: t('items.payment.title'),
      description: t('items.payment.description'),
      image: '/E-Wallet-amico.svg'
    },
    {
      icon: Icons.shieldCheck,
      title: t('items.gatekeeping.title'),
      description: t('items.gatekeeping.description'),
      image: '/Privacy policy-bro.svg'
    },
    {
      icon: Icons.coin,
      title: t('items.revenue.title'),
      description: t('items.revenue.description'),
      image: '/Revenue-bro.svg'
    },
    {
      icon: Icons.bolt,
      title: t('items.kick.title'),
      description: t('items.kick.description'),
      image: '/Inbox cleanup-cuate.svg'
    },
    {
      icon: Icons.chartBar,
      title: t('items.analytics.title'),
      description: t('items.analytics.description'),
      image: '/Spreadsheets-pana.svg'
    },
    {
      icon: Icons.bot,
      title: t('items.bot.title'),
      description: t('items.bot.description'),
      image: '/Chat bot-bro.svg'
    }
  ];

  return (
    <div id='features' className='max-w-(--breakpoint-xl) mx-auto w-full py-20 lg:py-24 px-6'>
      <h2 className='text-3xl xs:text-4xl md:text-5xl md:leading-[3.5rem] font-semibold tracking-tight sm:max-w-xl sm:text-center sm:mx-auto'>
        {t('header')}
      </h2>
      <div className='mt-8 xs:mt-14 w-full mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12'>
        {features.map((feature) => (
          <Card
            key={feature.title}
            className='group flex flex-col border-0 bg-accent/30 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg'
          >
            <CardHeader>
              <feature.icon className='h-6 w-6 text-primary' />
              <h4 className='mt-3! text-xl font-semibold tracking-tight'>{feature.title}</h4>
              <p className='mt-1 text-muted-foreground text-sm xs:text-[17px]'>
                {feature.description}
              </p>
            </CardHeader>
            <CardContent className='mt-auto px-0 pb-0'>
              {feature.image ? (
                <div className='relative h-52 overflow-hidden'>
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className='object-contain object-center p-6 transition-transform duration-300 group-hover:scale-105'
                  />
                </div>
              ) : (
                <div className='h-52' />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Features;
