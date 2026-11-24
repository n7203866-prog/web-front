// ✅ Server Component - مفيش 'use client'
import { fetchFromAPI } from '@/lib/api';
import TrainingClient from './TrainingClient';

// ✅ جلب تصنيفات التدريب
async function getTrainingCategories() {
  // try {
  //   const data = await fetchFromAPI('/categories/?type=course');
  //   return data.results?.map(cat => ({
  //     _id: cat.id,
  //     title: cat.name,
  //     slug: cat.slug,
  //     count: cat.courses_count || 0
  //   })) || [];
  // } catch (error) {
  //   console.error('❌ Error fetching training categories:', error);
  //   return [];
  // }
   try {
      const data = await fetchFromAPI('/categories/?type=course');
      return (data || []).map((cat) => ({
        _id: cat.id,
        title: cat.name,
        slug: cat.slug,
        count: cat.courses_count || 0,
      }));
    } catch {
      return [];
    }
}

// ✅ جلب الدورات مع الفلاتر
async function getCourses({ category, type, level, search, limit }) {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });

    if (category && category !== 'all') params.append('category__slug', category);
    if (type && type !== 'all') params.append('course_type', type);
    if (level && level !== 'all') params.append('level', level);
    if (search) params.append('search', search);

    const data = await fetchFromAPI(`/courses/?${params.toString()}`);

    return {
      courses: data.results || [],
      total: data.count || 0
    };
  } catch (error) {
    console.error('❌ Error fetching courses:', error);
    return { courses: [], total: 0 };
  }
}

export default async function TrainingPage({ searchParams }) {
  const { category, type, level, search, limit } = await searchParams;
  const initialLimit = parseInt(limit) || 8;

  const [categories, { courses, total }] = await Promise.all([
    getTrainingCategories(),
    getCourses({ category, type, level, search, limit: initialLimit }),
  ]);
  return (
    <TrainingClient
      initialCourses={courses}
      initialTotal={total}
      initialLimit={initialLimit}
      categories={categories}
      initialFilters={{ category, type, level, search }}
    />
  );
}
