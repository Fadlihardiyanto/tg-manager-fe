import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiClient } from '@/lib/api-client';

export async function GET(req: NextRequest, { params }: { params: Promise<{ botId: string }> }) {
  const { botId } = await params;
  const qs = req.nextUrl.searchParams.toString();
  const token = (await cookies()).get('access_token')?.value;
  const opts = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
  try {
    const data = await apiClient<any>(
      `/api/v1/tenant/bots/${botId}/broadcasts${qs ? '?' + qs : ''}`,
      opts
    );
    return NextResponse.json(data);
  } catch (e) {
    if (typeof e === 'object' && e && 'digest' in e) throw e;
    return NextResponse.json({ success: false, code: 401, message: 'Sesi habis' }, { status: 401 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ botId: string }> }) {
  const { botId } = await params;
  const body = await req.json();
  const token = (await cookies()).get('access_token')?.value;
  const opts: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  };
  try {
    const data = await apiClient<any>(`/api/v1/tenant/bots/${botId}/broadcasts`, opts);
    return NextResponse.json(data);
  } catch (e) {
    if (typeof e === 'object' && e && 'digest' in e) throw e;
    return NextResponse.json({ success: false, code: 401, message: 'Sesi habis' }, { status: 401 });
  }
}
