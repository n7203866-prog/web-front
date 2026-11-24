import { NextResponse } from 'next/server';
import { fetchFromAPI } from '@/lib/api';

export async function GET() {
  try {
    const data = await fetchFromAPI('/leadership/');

    return NextResponse.json(data);
  } catch (error) {
    console.error('Leadership API Error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch leadership' },
      { status: 500 }
    );
  }
}