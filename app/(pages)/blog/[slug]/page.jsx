// ✅ Server Component - مفيش 'use client'
import ArticleContent from './ArticleContent';
import { notFound } from 'next/navigation';
import { fetchFromAPI, getImageUrl } from '@/lib/api';

export const revalidate = 3600; // ISR: revalidate every hour

// ✅ جلب مقال واحد كامل من Django API
async function getPostBySlug(slug) {
  try {
    

    const data = await fetchFromAPI(`/posts/?slug=${slug}&limit=1`);
    const post = data?.results?.[0];
    

    return post
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    return null;
  }
}

// ✅ توليد الـ Meta Tags للـ SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  
  if (!post) return { title: 'Article Not Found' };
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const imageUrl = post.featured_image ? getImageUrl(post.featured_image) : null;
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: `${baseUrl}/blog/${post.slug}`,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: post.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = await getPostBySlug(slug);
  
  if (!article) {
    notFound(); // ✅ يظهر صفحة 404 الرسمية في Next.js
  }
  
  return <ArticleContent article={article} />;
}
