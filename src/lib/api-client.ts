const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';

export async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
  } catch (error) {
    console.error(`[API Client Network Error] ${endpoint}:`, error);
    throw error;
  }

  if (!res.ok) {
    if (res.status === 401 && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login')) {
      // Try to refresh token
      try {
        const { refreshToken } = await import('@/features/auth/api/service');
        const refreshRes = await refreshToken();
        
        if (refreshRes.success && refreshRes.data?.access_token) {
          // Retry original request with new token
          const newHeaders = new Headers(options?.headers);
          newHeaders.set('Authorization', `Bearer ${refreshRes.data.access_token}`);
          
          const retryRes = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers: newHeaders
          });
          
          if (retryRes.ok) {
            return retryRes.json() as Promise<T>;
          }
        }
      } catch {
        // refreshToken() may throw during SSR if cookies().set()
        // is called inside the render phase. Fall through —
        // the original 401 response body will carry the reason.
      }
    }

    let detail = '';
    try {
      const body = await res.json();
      detail =
        body?.message ||
        body?.error ||
        body?.detail ||
        (typeof body === 'string' ? body : '');
    } catch {
      // response body is not JSON — ignore
    }

    const message = detail || `API error: ${res.status} ${res.statusText}`;
    console.error(`[API Client Error] ${endpoint}:`, message);
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}
