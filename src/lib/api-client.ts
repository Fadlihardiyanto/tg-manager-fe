const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';
const FETCH_TIMEOUT_MS = 15_000;

export async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort('Request timeout'), FETCH_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal
    });
  } catch (error) {
    console.error(`[API Client Network Error] ${endpoint}:`, error);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    if (
      res.status === 401 &&
      !endpoint.includes('/auth/refresh') &&
      !endpoint.includes('/auth/login')
    ) {
      try {
        const { refreshToken } = await import('@/features/auth/api/service');
        const refreshRes = await refreshToken();

        if (refreshRes.success && refreshRes.data?.access_token) {
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
        // refreshToken() may throw during SSR
      }
    }

    let detail = '';
    try {
      const body = await res.json();
      detail =
        body?.message || body?.error || body?.detail || (typeof body === 'string' ? body : '');
    } catch {
      // response body is not JSON — ignore
    }

    const message = detail || `API error: ${res.status} ${res.statusText}`;
    console.error(`[API Client Error] ${endpoint}:`, message);
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}
