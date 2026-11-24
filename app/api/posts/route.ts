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

    const slug = searchParams.get('slug');
    const category = searchParams.get('category');
    const categorySlug = searchParams.get('category__slug');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const year = searchParams.get('year');

    if (slug) upstreamParams.set('slug', slug);
    if (category) upstreamParams.set('category', category);
    if (categorySlug) upstreamParams.set('category__slug', categorySlug);
    if (featured === 'true' || searchParams.get('is_featured') === 'true') upstreamParams.set('is_featured', 'true');
    if (search) upstreamParams.set('search', search);
    if (year) upstreamParams.set('year', year);

    const data = await fetchFromAPI(`/posts/?${upstreamParams.toString()}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
