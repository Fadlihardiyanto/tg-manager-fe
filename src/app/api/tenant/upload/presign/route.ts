import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiClient } from '@/lib/api-client';

export async function POST(req: NextRequest) {
  const token = (await cookies()).get('access_token')?.value;
  if (!token)
    return NextResponse.json(
      { success: false, code: 401, message: 'Sesi habis, silakan login ulang' },
      { status: 401 }
    );
  try {
    const body = await req.json();
    const data = await apiClient<any>('/api/v1/tenant/upload/presign', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { success: false, code: 401, message: 'Sesi habis, silakan login ulang' },
      { status: 401 }
    );
  }
}
