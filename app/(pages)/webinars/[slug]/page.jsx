// ✅ Server Component - مفيش 'use client'
import { notFound } from 'next/navigation';
import { fetchFromAPI, getImageUrl } from '@/lib/api';
import WbinarDetails from './WebinarDetails.jsx';

// ✅ جلب دورة واحدة من Django
async function getWebinarBySlug(slug) {
  try {
    const data = await fetchFromAPI(`/webinars/?slug=${encodeURIComponent(slug)}&limit=1`);
    const webinar = data?.results?.[0];
    

    return webinar
  } catch (e) {
    console.error('Error fetching course by slug:', e);
    return null;
  }
}

// ✅ توليد الـ Meta Tags للـ SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const webinar = await getWebinarBySlug(slug);

  if (!webinar) {
    return { title: 'Course Not Found | El-Motahida' };
  }

  // ✅ التصحيح: استخدم الرابط مع بارامترز مباشرة (من غير urlFor().width())
  const imageUrl = webinar.main_image ? getImageUrl(webinar.main_image) : undefined;

  return {
    title: `${webinar.title} | El-Motahida Training`,
    description: webinar.excerpt,
    openGraph: {
      title: webinar.title,
      description: webinar.excerpt,
      type: 'article',
      url: `https://elmtahida.com/training/${webinar.slug}`,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: webinar.title }] : [],
    },
  };
}

// ✅ المكون الرئيسي
export default async function CourseDetails({ params }) {
  const { slug } = await params;
  const webinar = await getWebinarBySlug(slug);

  if (!webinar) {
    notFound();
  }

  return <WbinarDetails webinar={webinar} />;
}
