import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiClient } from '@/lib/api-client';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ botId: string; token: string }> }
) {
  const { botId, token } = await params;
  const cookie = (await cookies()).get('access_token')?.value;
  if (!cookie)
    return NextResponse.json({ success: false, code: 401, message: 'Sesi habis' }, { status: 401 });

  try {
    const data = await apiClient<any>(
      `/api/v1/tenant/bots/${botId}/groups/connect-status/${token}`,
      { headers: { Authorization: `Bearer ${cookie}` } }
    );
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ success: false, code: 401, message: 'Sesi habis' }, { status: 401 });
  }
}
