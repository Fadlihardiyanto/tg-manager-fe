import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('admin_refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json({ accessToken: null });
    }

    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';

    const refreshRes = await fetch(`${BASE_URL}/admin/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (!refreshRes.ok) {
      return NextResponse.json({ accessToken: null });
    }

    const refreshData = await refreshRes.json();
    const accessToken = refreshData?.data?.access_token;

    if (!accessToken) {
      return NextResponse.json({ accessToken: null });
    }

    const meRes = await fetch(`${BASE_URL}/admin/v1/auth/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!meRes.ok) {
      return NextResponse.json({ accessToken: null });
    }

    const meData = await meRes.json();

    if (!meData?.success || !meData?.data) {
      return NextResponse.json({ accessToken: null });
    }

    return NextResponse.json({
      accessToken,
      admin: meData.data.admin || meData.data.user,
      role: meData.data.role,
      permissions: meData.data.permissions ?? []
    });
  } catch {
    return NextResponse.json({ error: 'Admin session error' }, { status: 500 });
  }
}
