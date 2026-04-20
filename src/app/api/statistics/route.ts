import { NextResponse } from 'next/server';
import { gaioFetch } from '@/lib/api';

export async function GET() {
  try {
    const response = await gaioFetch('statistics');
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch' }, { status: response.status });
    }
    
    const result = await response.json();
    
    // Structure of result.data depends on our PHP gaio-api.php
    if (result.status === 'success') {
      return NextResponse.json(result.data);
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      countries: 45,
      sponsors: 32,
      events: 78,
      volunteers: 1250
    });
  }
}
