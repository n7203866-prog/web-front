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
    const categorySlug = searchParams.get('category__slug');
    const slug = searchParams.get('slug');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    if (category) upstreamParams.set('category', category);
    if (categorySlug) upstreamParams.set('category__slug', categorySlug);
    if (slug) upstreamParams.set('slug', slug);
    if (status) upstreamParams.set('status', status);
    if (search) upstreamParams.set('search', search);

    const data = await fetchFromAPI(`/webinars/?${upstreamParams.toString()}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching webinars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webinars' },
      { status: 500 }
    );
  }
}
