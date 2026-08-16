import Providers from '@/components/layout/providers';
import { Toaster } from '@/components/ui/sonner';
import { fontVariables } from '@/components/themes/font.config';
import ThemeProvider from '@/components/themes/theme-provider';
import { ThemeScript } from '@/components/themes/theme-script';
import { cn } from '@/lib/utils';
import type { Metadata, Viewport } from 'next';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import '../../styles/globals.css';

const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b'
};

export const metadata: Metadata = {
  title: 'Urator',
  description: 'Urator - Platform untuk mengordinasi komunitas dan monetisasi telegram.',
  icons: {
    icon: '/uration-blue-version.png',
    shortcut: '/uration-blue-version.png',
    apple: '/uration-blue-version.png'
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: META_THEME_COLORS.light },
    { media: '(prefers-color-scheme: dark)', color: META_THEME_COLORS.dark }
  ]
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning data-scroll-behavior='smooth'>
      <body
        className={cn(
          'bg-background overflow-x-hidden overscroll-none font-sans antialiased',
          fontVariables
        )}
      >
        <ThemeScript />
        <NextTopLoader color='var(--primary)' showSpinner={false} />
        <a
          href='#main-content'
          className='sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[9999] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg'
        >
          Lewati ke konten utama
        </a>
        <NuqsAdapter>
          <NextIntlClientProvider messages={messages}>
            <ThemeProvider>
              <Providers>
                <Toaster />
                {children}
              </Providers>
            </ThemeProvider>
          </NextIntlClientProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
