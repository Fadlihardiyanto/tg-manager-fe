import { cookies } from 'next/headers';

export async function getAuthHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  let token = cookieStore.get('access_token')?.value;

  if (!token) {
    const rToken = cookieStore.get('refresh_token')?.value;
    if (rToken) {
      try {
        const { refreshToken } = await import('@/features/auth/api/service');
        const refreshRes = await refreshToken();
        if (refreshRes.success && refreshRes.data?.access_token) {
          token = refreshRes.data.access_token;
        }
      } catch {
        // Refresh failed — proceed to redirect
      }
    }
  }

  if (!token) {
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');
    const { redirect } = await import('next/navigation');
    redirect('/login');
  }

  return { Authorization: `Bearer ${token}` };
}
