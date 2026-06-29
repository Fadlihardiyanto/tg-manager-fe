import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiClient } from '@/lib/api-client';

export async function POST(req: NextRequest) {
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
    const data = await apiClient<any>('/api/v1/tenant/upload/presign', opts);
    return NextResponse.json(data);
  } catch (e) {
    if (typeof e === 'object' && e && 'digest' in e) throw e;
    return NextResponse.json({ success: false, code: 401, message: 'Sesi habis' }, { status: 401 });
  }
}
