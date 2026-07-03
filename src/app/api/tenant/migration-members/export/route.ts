import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';

export async function GET() {
  const token = (await cookies()).get('access_token')?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const response = await fetch(`${BASE_URL}/api/v1/tenant/migration-members/export`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    return NextResponse.json(
      { success: false, message: 'Failed to export CSV' },
      { status: response.status }
    );
  }

  const content = await response.text();

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="migration-members-export.csv"'
    }
  });
}
