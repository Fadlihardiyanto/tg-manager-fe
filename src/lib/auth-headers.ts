import { cookies } from 'next/headers';

export async function getAuthHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  return {
    Authorization: `Bearer ${token}`
  };
}
