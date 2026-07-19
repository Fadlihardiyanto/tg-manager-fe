'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

type MidtransEnvironment = 'sandbox' | 'production';

type SnapResult = {
  order_id?: string;
  transaction_status?: string;
  status_code?: string;
  status_message?: string;
};

type SnapCallbacks = {
  onSuccess?: (result: SnapResult) => void;
  onPending?: (result: SnapResult) => void;
  onError?: (result: SnapResult) => void;
  onClose?: () => void;
};

type SnapInstance = {
  pay: (token: string, callbacks?: SnapCallbacks) => void;
};

declare global {
  interface Window {
    snap?: SnapInstance;
  }
}

interface MidtransSnapCheckoutProps {
  snapToken?: string | null;
  paymentUrl?: string | null;
  clientKey?: string | null;
  orderId?: string | null;
  environment?: MidtransEnvironment;
  successRedirectUrl: string;
  pendingRedirectUrl?: string;
  children?: ReactNode;
  fallbackLabel?: string;
  autoOpen?: boolean;
  className?: string;
  size?: ComponentProps<typeof Button>['size'];
  variant?: ComponentProps<typeof Button>['variant'];
}

const SNAP_SCRIPT_ID = 'midtrans-snap-script';
export const MIDTRANS_PENDING_PAYMENT_STORAGE_KEY = 'midtrans-pending-payment';

function getSnapScriptUrl(environment: MidtransEnvironment) {
  return environment === 'production'
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js';
}

function getConfiguredEnvironment(): MidtransEnvironment {
  return process.env.NEXT_PUBLIC_MIDTRANS_ENV === 'production' ? 'production' : 'sandbox';
}

function getClientKey(clientKey?: string | null) {
  return clientKey || process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';
}

function buildRedirectUrl(baseUrl: string, fallbackOrderId?: string | null, result?: SnapResult) {
  const orderId = result?.order_id || fallbackOrderId;
  if (!orderId) return baseUrl;

  const [pathname, search = ''] = baseUrl.split('?');
  const params = new URLSearchParams(search);
  if (!params.has('order_id')) params.set('order_id', orderId);

  return `${pathname}?${params.toString()}`;
}

export function MidtransSnapCheckout({
  snapToken,
  paymentUrl,
  clientKey,
  orderId,
  environment = getConfiguredEnvironment(),
  successRedirectUrl,
  pendingRedirectUrl,
  children = 'Bayar Sekarang',
  fallbackLabel = 'Buka Pembayaran',
  autoOpen = false,
  className,
  size,
  variant
}: MidtransSnapCheckoutProps) {
  const router = useRouter();
  const [isScriptReady, setIsScriptReady] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [didAutoOpen, setDidAutoOpen] = useState(false);
  const resolvedClientKey = useMemo(() => getClientKey(clientKey), [clientKey]);
  const scriptUrl = useMemo(() => getSnapScriptUrl(environment), [environment]);

  useEffect(() => {
    if (!snapToken && !paymentUrl) return;

    sessionStorage.setItem(
      MIDTRANS_PENDING_PAYMENT_STORAGE_KEY,
      JSON.stringify({
        snapToken,
        paymentUrl,
        clientKey,
        orderId
      })
    );
  }, [clientKey, orderId, paymentUrl, snapToken]);

  useEffect(() => {
    if (!snapToken || !resolvedClientKey) return;

    const existingScript = document.getElementById(SNAP_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      const hasSameConfig =
        existingScript.src === scriptUrl && existingScript.dataset.clientKey === resolvedClientKey;

      if (hasSameConfig && window.snap) {
        setIsScriptReady(true);
        return;
      }

      existingScript.remove();
      delete window.snap;
    }

    setIsScriptReady(false);

    const script = document.createElement('script');
    script.id = SNAP_SCRIPT_ID;
    script.src = scriptUrl;
    script.async = true;
    script.dataset.clientKey = resolvedClientKey;
    const handleLoad = () => setIsScriptReady(Boolean(window.snap));
    const handleError = () => {
      setIsScriptReady(false);
      toast.error('Gagal memuat Midtrans Snap. Coba lagi sebentar lagi.');
    };

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);
    document.body.appendChild(script);

    return () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    };
  }, [resolvedClientKey, scriptUrl, snapToken]);

  const redirectToResult = useCallback(
    (url: string, result?: SnapResult) => {
      router.push(buildRedirectUrl(url, orderId, result));
    },
    [orderId, router]
  );

  const handleSnapPay = useCallback(() => {
    if (!snapToken) return;

    if (!resolvedClientKey) {
      toast.error('Client key Midtrans belum tersedia.');
      return;
    }

    if (!window.snap || !isScriptReady) {
      toast.error('Midtrans Snap masih dimuat. Coba klik lagi sebentar.');
      return;
    }

    setIsOpening(true);
    document.body.style.pointerEvents = 'auto';
    window.snap.pay(snapToken, {
      onSuccess: (result) => {
        setIsOpening(false);
        redirectToResult(successRedirectUrl, result);
      },
      onPending: (result) => {
        setIsOpening(false);
        redirectToResult(pendingRedirectUrl || successRedirectUrl, result);
      },
      onError: (result) => {
        setIsOpening(false);
        toast.error(result.status_message || 'Pembayaran belum berhasil diproses.');
        redirectToResult(pendingRedirectUrl || successRedirectUrl, result);
      },
      onClose: () => {
        setIsOpening(false);
        toast.info('Checkout ditutup. Anda bisa melanjutkan pembayaran dari halaman billing.');
        if (pendingRedirectUrl) redirectToResult(pendingRedirectUrl);
      }
    });
  }, [
    isScriptReady,
    pendingRedirectUrl,
    redirectToResult,
    resolvedClientKey,
    snapToken,
    successRedirectUrl
  ]);

  useEffect(() => {
    setDidAutoOpen(false);
  }, [snapToken]);

  useEffect(() => {
    if (!autoOpen || didAutoOpen || !snapToken || !isScriptReady) return;
    setDidAutoOpen(true);
    handleSnapPay();
  }, [autoOpen, didAutoOpen, handleSnapPay, isScriptReady, snapToken]);

  if (snapToken && resolvedClientKey) {
    return (
      <Button
        type='button'
        className={className}
        size={size}
        variant={variant}
        isLoading={isOpening}
        disabled={!isScriptReady}
        onClick={handleSnapPay}
      >
        <Icons.creditCard className='h-4 w-4' />
        {children}
      </Button>
    );
  }

  if (paymentUrl) {
    return (
      <Button asChild className={className} size={size} variant={variant}>
        <a href={paymentUrl} target='_blank' rel='noreferrer'>
          <Icons.externalLink className='h-4 w-4' />
          {fallbackLabel}
        </a>
      </Button>
    );
  }

  return (
    <Button type='button' className={className} size={size} variant={variant} disabled>
      <Icons.creditCard className='h-4 w-4' />
      Pembayaran belum tersedia
    </Button>
  );
}
