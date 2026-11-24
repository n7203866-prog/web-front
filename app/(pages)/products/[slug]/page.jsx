// ✅ Server Component - مفيش 'use client'
import { notFound } from 'next/navigation';
import { fetchFromAPI, getImageUrl } from '@/lib/api';
import ProductDetailsClient from './ProductDetailsClient';

// ✅ جلب منتج واحد من Django API بالـ slug
async function getProductBySlug(slug) {
  try {
    const data = await fetchFromAPI(`/products/?slug=${encodeURIComponent(slug)}&limit=1`);
    const p = data?.results?.[0];
    if (!p) return null;
    return {
      id: p.id,
      name: p.title,
      slug: p.slug,
      shortDescription: p.short_description,
      full_description:p.full_description,
      price: p.price ? `${p.price} ${p.currency || ''}`.trim() : null,
      category: p.category ? { title: p.category.name, slug: p.category.slug } : null,
      mainImage: p.main_image ? { asset: { url: getImageUrl(p.main_image) }, alt: p.title } : null,
      images: (p.images || []).map((img) => ({
        asset: { url: getImageUrl(img.image) },
        alt: p.title,
        caption: img.caption,
      })),
      specifications: (p.specifications || []).map((s) => ({ label: s.label, value: s.value })),
      brand: p.brand,
      status: p.status,
    };
  } catch (e) {
    console.error('Error fetching product by slug:', e);
    return null;
  }
}

// ✅ توليد الـ Meta Tags للـ SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found | El-Motahida',
      description: 'The requested product does not exist.',
    };
  }

  // ✅ التصحيح: استخدم الرابط مع بارامترز مباشرة (من غير urlFor().width())
  const imageUrl = product.mainImage?.asset?.url ? getImageUrl(product.mainImage.asset.url) : undefined;

  // ✅ تجهيز الوصف للـ SEO (أول 160 حرف)
  const metaDescription = product.shortDescription || 
    (product.fullDescription 
      ? JSON.stringify(product.fullDescription).slice(0, 160) + '...' 
      : '');

  return {
    title: `${product.name} | El-Motahida`,
    description: metaDescription,
    openGraph: {
      title: product.name,
      description: metaDescription,
      // ✅ التصحيح: غيّر من 'product' إلى 'article' (قيمة معتمدة في Next.js)
      type: 'article',
      url: `https://elmtahida.com/products/${product.slug}`,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: product.name }] : [],
      siteName: 'El-Motahida',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: metaDescription,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

// ✅ المكون الرئيسي
export default async function ProductDetails({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailsClient product={product} />;
}
