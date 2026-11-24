// ✅ Server Component - مفيش 'use client'
import { fetchFromAPI } from '@/lib/api';
import BlogClient from './BlogClient';

// ✅ جلب تصنيفات الـ Blog
async function getBlogCategories() {
  try {
    const data = await fetchFromAPI('/categories/');

    if (Array.isArray(data)) {
      return data;
    }

    return data.results || [];
    
  } catch {
    console.error('❌ Error fetching categories');
    return [];
  }
}

// ✅ جلب السنوات المتاحة
async function getBlogYears() {
  try {
    const data = await fetchFromAPI('/posts/years/');
    return data.map(year => ({
      id: year.year.toString(),
      label: year.year.toString(),
      count: year.count
    })) || [];
  } catch (e) {
    console.error('❌ Error fetching years:', e);
    return [{ id: 'all', label: 'All Years', count: 0 }];
  }
}

// ✅ جلب المقالات مع الفلاتر
async function getBlogPosts({ category, year, search, limit }) {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });

    if (category && category !== 'all') params.append('category__slug', category);
    if (year && year !== 'all') params.append('year', year);
    if (search) params.append('search', search);

    const data = await fetchFromAPI(`/posts/?${params.toString()}`);

    return {
      posts: data.results || [],
      total: data.count || 0
    };
  } catch (error) {
    console.error('❌ Error fetching blog posts:', error);
    return { posts: [], total: 0 };
  }
}

// ✅ جلب المقال المميز
async function getFeaturedPost() {
  try {
    const data = await fetchFromAPI('/posts/?is_featured=true&limit=1');
    return data.results?.[0] || null;
  } catch (error) {
    console.error('❌ Error fetching featured post:', error);
    return null;
  }
  

}

export default async function BlogPage({ searchParams }) {
  const { category, year, search, limit } = await searchParams;
  const initialLimit = parseInt(limit) || 6;

  const [categories, years, { posts, total }, featuredPost] = await Promise.all([
    getBlogCategories(),
    getBlogYears(),
    getBlogPosts({ category, year, search, limit: initialLimit }),
    getFeaturedPost(),
  ]);

  return (
    <BlogClient
      initialPosts={posts}
      initialTotal={total}
      initialLimit={initialLimit}
      categories={categories}
      years={years}
      featuredPost={featuredPost}
      initialFilters={{ category, year, search }}
    />
  );
}