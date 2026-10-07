import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { Icons } from '@/components/icons';
import FeatureMock, { type FeatureMockVariant } from './feature-mock';

const Features = () => {
  const t = useTranslations('Features');

  const features: {
    icon: React.FC<{ className?: string }>;
    title: string;
    description: string;
    mock: FeatureMockVariant;
  }[] = [
    {
      icon: Icons.creditCard,
      title: t('items.payment.title'),
      description: t('items.payment.description'),
      mock: 'payment'
    },
    {
      icon: Icons.shieldCheck,
      title: t('items.gatekeeping.title'),
      description: t('items.gatekeeping.description'),
      mock: 'gatekeeping'
    },
    {
      icon: Icons.coin,
      title: t('items.revenue.title'),
      description: t('items.revenue.description'),
      mock: 'revenue'
    },
    {
      icon: Icons.bolt,
      title: t('items.kick.title'),
      description: t('items.kick.description'),
      mock: 'kick'
    },
    {
      icon: Icons.chartBar,
      title: t('items.analytics.title'),
      description: t('items.analytics.description'),
      mock: 'analytics'
    },
    {
      icon: Icons.bot,
      title: t('items.bot.title'),
      description: t('items.bot.description'),
      mock: 'bot'
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
            className='group flex flex-col border border-border/40 bg-accent/20 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-primary/15 hover:bg-accent/30'
          >
            <CardHeader>
              <div className='flex size-10 items-center justify-center rounded-xl bg-background border border-border/60 shadow-sm'>
                <feature.icon className='h-5 w-5 text-foreground' />
              </div>
              <h4 className='mt-3! text-xl font-semibold tracking-tight'>{feature.title}</h4>
              <p className='mt-1 text-muted-foreground text-sm xs:text-[15px] leading-relaxed'>
                {feature.description}
              </p>
            </CardHeader>
            <CardContent className='mt-auto px-0 pb-0'>
              <div className='h-52 overflow-hidden'>
                <FeatureMock variant={feature.mock} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Features;
