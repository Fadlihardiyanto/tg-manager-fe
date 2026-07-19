import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';

export async function GET(req: NextRequest) {
  const token = (await cookies()).get('access_token')?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, code: 401, message: 'Sesi habis', data: [] },
      { status: 401 }
    );
  }

  const response = await fetch(`${BASE_URL}/api/v1/tenant/billing/history${req.nextUrl.search}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
