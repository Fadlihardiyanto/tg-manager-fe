import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ botId: string; token: string }> }
) {
  const { botId, token } = await params;
  const accessToken = (await cookies()).get('access_token')?.value;
  if (!accessToken) {
    return NextResponse.json({ success: false, code: 401, message: 'Sesi habis' }, { status: 401 });
  }
  const res = await fetch(
    `${BASE_URL}/api/v1/tenant/bots/${botId}/groups/connect-status/${token}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
