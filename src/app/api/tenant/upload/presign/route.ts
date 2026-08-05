import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const token = (await cookies()).get('access_token')?.value;
  if (!token) {
    return NextResponse.json({ success: false, code: 401, message: 'Sesi habis' }, { status: 401 });
  }
  const res = await fetch(`${BASE_URL}/api/v1/tenant/upload/presign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
