// ✅ Server Component - مفيش 'use client'
import { fetchFromAPI, getImageUrl } from '@/lib/api';
import ProductsClient from './ProductsClient';

async function getProducts({ category, search, limit }) {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });
    if (category && category !== 'all') {
      params.append('category__slug', category);
    }
    if (search) params.append('search', search);

    const data = await fetchFromAPI(`/products/?${params.toString()}`);

    const products = (data.results || []).map((p) => ({
      _id: p.id,
      name: p.title,
      shortDescription: p.short_description,
      price: p.price ? `${p.price} ${p.currency || ''}`.trim() : null,
      slug: p.slug,
      category: p.category ? { title: p.category.name, slug: p.category.slug } : null,
      mainImage: p.main_image ? { asset: { url: getImageUrl(p.main_image) }, alt: p.title } : null,
    }));

    return { products, total: data.count || 0 };
  } catch (e) {
    console.error('❌ Error fetching products:', e);
    return { products: [], total: 0 };
  }
}

async function getProductCategories() {
  try {
    const data = await fetchFromAPI('/categories/?type=product');
    return (data || []).map((cat) => ({
      _id: cat.id,
      title: cat.name,
      slug: cat.slug,
      count: cat.products_count || 0,
    }));
  } catch {
    return [];
  }
}

export default async function ProductsPage({ searchParams }) {
  const { category, search, limit } = await searchParams;
  const initialLimit = parseInt(limit) || 9;

  const [categories, { products, total }] = await Promise.all([
    getProductCategories(),
    getProducts({ category, search, limit: initialLimit }),
  ]);
  return (
    <ProductsClient 
      initialProducts={products}
      initialTotal={total}
      initialLimit={initialLimit}
      categories={categories}
      initialFilters={{ category, search }}
    />
  );
}
