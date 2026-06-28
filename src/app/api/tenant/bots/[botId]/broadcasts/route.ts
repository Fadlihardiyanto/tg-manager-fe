import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiClient } from '@/lib/api-client';

const UNAUTHORIZED = { success: false, code: 401, message: 'Sesi habis, silakan login ulang' };

export async function GET(req: NextRequest, { params }: { params: Promise<{ botId: string }> }) {
  const { botId } = await params;
  const qs = req.nextUrl.searchParams.toString();
  const token = (await cookies()).get('access_token')?.value;
  if (!token) return NextResponse.json(UNAUTHORIZED, { status: 401 });
  try {
    const data = await apiClient<any>(
      `/api/v1/tenant/bots/${botId}/broadcasts${qs ? '?' + qs : ''}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(UNAUTHORIZED, { status: 401 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ botId: string }> }) {
  const { botId } = await params;
  const token = (await cookies()).get('access_token')?.value;
  if (!token) return NextResponse.json(UNAUTHORIZED, { status: 401 });
  try {
    const body = await req.json();
    const data = await apiClient<any>(`/api/v1/tenant/bots/${botId}/broadcasts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(UNAUTHORIZED, { status: 401 });
  }
}
