import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';

    const refreshRes = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (!refreshRes.ok) {
      return NextResponse.json({ error: 'Refresh failed' }, { status: 401 });
    }

    const refreshData = await refreshRes.json();
    const accessToken = refreshData?.data?.access_token;

    if (!accessToken) {
      return NextResponse.json({ error: 'No access token in refresh response' }, { status: 401 });
    }

    const meRes = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!meRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 401 });
    }

    const meData = await meRes.json();

    if (!meData?.success || !meData?.data) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 401 });
    }

    return NextResponse.json({
      accessToken,
      user: meData.data.user,
      client: meData.data.client,
      role: meData.data.role,
      permissions: meData.data.permissions ?? [],
      needsOnboarding: meData.data.needs_onboarding ?? false
    });
  } catch {
    return NextResponse.json({ error: 'Session error' }, { status: 500 });
  }
}
