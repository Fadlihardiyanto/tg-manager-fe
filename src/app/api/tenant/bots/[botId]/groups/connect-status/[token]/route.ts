import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiClient } from '@/lib/api-client';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ botId: string; token: string }> }
) {
  const { botId, token } = await params;
  const accessToken = (await cookies()).get('access_token')?.value;
  const opts = accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined;
  try {
    const data = await apiClient<any>(
      `/api/v1/tenant/bots/${botId}/groups/connect-status/${token}`,
      opts
    );
    return NextResponse.json(data);
  } catch (e) {
    if (typeof e === 'object' && e && 'digest' in e) throw e;
    return NextResponse.json({ success: false, code: 401, message: 'Sesi habis' }, { status: 401 });
  }
}
