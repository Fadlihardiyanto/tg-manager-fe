import localFont from 'next/font/local';
import { cn } from '@/lib/utils';

const satoshi = localFont({
  src: [
    { path: '../../fonts/Satoshi-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../fonts/Satoshi-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../../fonts/Satoshi-Bold.woff2', weight: '700', style: 'normal' }
  ],
  variable: '--font-sans',
  display: 'swap'
});

const jetbrainsMono = localFont({
  src: [{ path: '../../fonts/JetBrainsMono-Regular.woff2', weight: '400', style: 'normal' }],
  variable: '--font-mono',
  display: 'swap'
});

export const fontVariables = cn(satoshi.variable, jetbrainsMono.variable);
