import { NextResponse } from 'next/server';
import { fetchFromAPI } from '@/lib/api';

export async function GET() {
  try {
    const data = await fetchFromAPI('/team-members/?limit=100');

    return NextResponse.json(data);
  } catch (error) {
    console.error('Team Members API Error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}