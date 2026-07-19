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
      <div className='flex items-center gap-2'>
        <h1 className='text-foreground truncate text-2xl font-bold md:text-[28px]'>{title}</h1>
        {infoContent && (
          <div className='pt-0.5'>
            <InfoButton content={infoContent} />
          </div>
        )}
      </div>
      {description && (
        <p className='text-muted-foreground mt-1.5 max-w-2xl text-sm'>{description}</p>
      )}
    </div>
  );
}
