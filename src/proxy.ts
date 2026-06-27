import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const protectedRoutes = ['/dashboard'];
const authRoutes = ['/login', '/register-tenant', '/forgot-password', '/verify-email', '/check-email'];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Strip locale prefix to check auth
  const locales = routing.locales;
  const localePattern = new RegExp(`^/(${locales.join('|')})(/.*)?$`);
  const match = pathname.match(localePattern);
  
  let pathnameWithoutLocale = pathname;
  let currentLocale = routing.defaultLocale;
  
  if (match) {
    currentLocale = match[1] as any;
    pathnameWithoutLocale = match[2] || '/';
  }

  const accessToken = req.cookies.get('access_token')?.value;
  const refreshToken = req.cookies.get('refresh_token')?.value;
  const hasToken = !!accessToken || !!refreshToken;
  
  const isProtectedRoute = protectedRoutes.some((route) => pathnameWithoutLocale.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathnameWithoutLocale === route || pathnameWithoutLocale === '/');

  if (isProtectedRoute && !hasToken) {
    const loginUrl = new URL(currentLocale === routing.defaultLocale ? '/login' : `/${currentLocale}/login`, req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && hasToken) {
    return NextResponse.redirect(new URL(currentLocale === routing.defaultLocale ? '/dashboard/overview' : `/${currentLocale}/dashboard/overview`, req.url));
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    '/((?!_next|api|trpc|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp4)).*)',
  ]
};
