import Image from 'next/image';
import Link from 'next/link';

export const Logo = () => (
  <Link href='/' className='inline-block transition-transform hover:scale-[1.02] active:scale-95'>
    <Image
      src='/assets/urator.png'
      alt='Urator Logo'
      width={168}
      height={56}
      className='object-contain w-auto h-12 sm:h-16'
      priority
    />
  </Link>
);
