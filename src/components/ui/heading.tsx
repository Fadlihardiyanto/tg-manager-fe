import { InfoButton } from '@/components/ui/info-button';
import type { InfobarContent } from '@/components/ui/infobar';

interface HeadingProps {
  title: string;
  description: string;
  infoContent?: InfobarContent;
}

export function Heading({ title, description, infoContent }: HeadingProps) {
  return (
    <div>
      <div className='flex items-center gap-1.5'>
        <h2 className='text-lg font-bold tracking-tight md:text-xl'>{title}</h2>
        {infoContent && (
          <div className='pt-0.5'>
            <InfoButton content={infoContent} />
          </div>
        )}
      </div>
      <p className='text-muted-foreground text-[10px] md:text-[11px]'>{description}</p>
    </div>
  );
}
