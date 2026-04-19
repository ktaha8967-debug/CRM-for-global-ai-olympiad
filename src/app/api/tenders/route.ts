import { NextResponse } from 'next/server';
import { gaioFetch } from '@/lib/api';

export async function GET() {
  try {
    const response = await gaioFetch('/tenders');
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch tenders' }, { status: response.status });
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/tenders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
