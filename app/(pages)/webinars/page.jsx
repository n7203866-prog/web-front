// ✅ Server Component - مفيش 'use client'
import { fetchFromAPI } from '@/lib/api';
import WebinarClient from './WebinarClient';

async function getWebinars({ category, search, limit }) {
  try {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (category && category !== 'all') params.append('category__slug', category);
    if (search) params.append('search', search);

    const data = await fetchFromAPI(`/webinars/?${params.toString()}`);
    const webinars = data.results || [];

    return { 
             webinars,
              total: data.count || 0 
      };
  } catch (error) {
    console.error('❌ Webinar fetch error:', error?.message || error);
    return { webinars: [], total: 0 };
  }
}

async function getWebinarCategories() {
  try {
    const data = await fetchFromAPI('/categories/?type=webinar');
    return (data || []).map((cat) => ({
      _id: cat.id,
      title: cat.name,
      slug: cat.slug,
      count: cat.webinars_count || 0,
    }));
  } catch {
    return [];
  }
}

export default async function WebinarsPage({ searchParams }) {
  const { category, search, limit } = await searchParams;
  const initialLimit = parseInt(limit) || 9;

  const [categories, { webinars, total }] = await Promise.all([
    getWebinarCategories(),
    getWebinars({ category, search, limit: initialLimit }),
  ]);
  return (
    <WebinarClient 
      initialWebinars={webinars}
      initialTotal={total}
      initialLimit={initialLimit}
      categories={categories}
      initialFilters={{ category, search }}
    />
  );
}
