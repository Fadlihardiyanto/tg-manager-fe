import { NextResponse } from 'next/server';
import type { PublicPlansResponse } from '@/features/billing/api/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';

type LegacyPublicPlansResponse = {
  meta?: {
    success?: boolean;
    message?: string;
  };
  data?: unknown;
};

function normalizePublicPlansResponse(raw: unknown): PublicPlansResponse {
  if (
    typeof raw === 'object' &&
    raw !== null &&
    'success' in raw &&
    'data' in raw &&
    Array.isArray((raw as { data: unknown }).data)
  ) {
    return raw as PublicPlansResponse;
  }

  const legacy = raw as LegacyPublicPlansResponse;
  const data = Array.isArray(legacy?.data) ? legacy.data : [];

  return {
    success: legacy?.meta?.success ?? true,
    code: 200,
    message: legacy?.meta?.message ?? '',
    data: data as PublicPlansResponse['data']
  };
}

export async function GET() {
  const response = await fetch(`${BASE_URL}/api/v1/public/plans`);
  const data = normalizePublicPlansResponse(await response.json());

  return NextResponse.json(data, { status: response.status });
}
