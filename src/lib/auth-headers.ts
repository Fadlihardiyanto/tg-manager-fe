import { cookies } from 'next/headers';

export async function getAuthHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  let token = cookieStore.get('access_token')?.value;

  if (!token) {
    const rToken = cookieStore.get('refresh_token')?.value;
    console.warn('[Auth] access_token missing');
    if (rToken) {
      console.warn('[Auth] refresh_token found — attempting refresh');
      try {
        const { refreshToken } = await import('@/features/auth/api/service');
        const refreshRes = await refreshToken();
        if (refreshRes.success && refreshRes.data?.access_token) {
          token = refreshRes.data.access_token;
          console.warn('[Auth] refresh succeeded — using new access_token');
        } else {
          console.warn('[Auth] refresh failed —', refreshRes.message);
        }
      } catch (e) {
        console.warn('[Auth] refresh threw —', e instanceof Error ? e.message : e);
      }
    } else {
      console.warn('[Auth] no refresh_token — redirecting to login');
    }
  }

  if (!token) {
    console.warn('[Auth] no valid token — redirecting to /login');
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');
    const { redirect } = await import('next/navigation');
    redirect('/login');
  }

  return { Authorization: `Bearer ${token}` };
}
