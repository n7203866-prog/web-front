// ✅ Server Component - مفيش 'use client'
import { notFound } from 'next/navigation';
import { fetchFromAPI, getImageUrl } from '@/lib/api';
import CourseDetailsClient from './CourseDetailsClient.jsx';

// ✅ جلب دورة واحدة من Django
async function getCourseBySlug(slug) {
  try {
    const data = await fetchFromAPI(`/courses/?slug=${encodeURIComponent(slug)}&limit=1`);
    const course = data?.results?.[0];
    

    return course
  } catch (e) {
    console.error('Error fetching course by slug:', e);
    return null;
  }
}

// ✅ توليد الـ Meta Tags للـ SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    return { title: 'Course Not Found | El-Motahida' };
  }

  // ✅ التصحيح: استخدم الرابط مع بارامترز مباشرة (من غير urlFor().width())
  const imageUrl = course.main_image ? getImageUrl(course.main_image) : undefined;

  return {
    title: `${course.title} | El-Motahida Training`,
    description: course.excerpt,
    openGraph: {
      title: course.title,
      description: course.excerpt,
      type: 'article',
      url: `https://elmtahida.com/training/${course.slug}`,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: course.title }] : [],
    },
  };
}

// ✅ المكون الرئيسي
export default async function CourseDetails({ params }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  return <CourseDetailsClient course={course} />;
}
