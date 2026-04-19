import { NextResponse } from 'next/server';
import { gaioFetch } from '@/lib/api';

export async function GET() {
  try {
    const response = await gaioFetch('/organisers');
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch organisers' }, { status: response.status });
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/organisers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await gaioFetch('/organisers/apply', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error in POST /api/organisers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
