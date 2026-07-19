import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';

export async function GET() {
  const token = (await cookies()).get('access_token')?.value;

  if (!token) {
    return NextResponse.json({ success: false, code: 401, message: 'Sesi habis' }, { status: 401 });
  }

  const response = await fetch(`${BASE_URL}/api/v1/tenant/billing/active`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
