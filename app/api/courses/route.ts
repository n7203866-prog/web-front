import { NextRequest, NextResponse } from 'next/server';
import { fetchFromAPI } from '@/lib/api';

function positiveInteger(value: string | null, fallback: string) {
  return value && /^\d+$/.test(value) ? value : fallback;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const upstreamParams = new URLSearchParams({
      page: positiveInteger(searchParams.get('page'), '1'),
      limit: positiveInteger(searchParams.get('limit'), '10'),
    });

    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    if (category) upstreamParams.set('category', category);
    if (level) upstreamParams.set('level', level);
    if (type) upstreamParams.set('course_type', type);
    if (search) upstreamParams.set('search', search);

    const data = await fetchFromAPI(`/courses/?${upstreamParams.toString()}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
