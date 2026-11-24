// src/components/FeaturedBlogPreview/FeaturedBlogPreview.jsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { User, Clock, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';


const getImageUrl = (img) => {
  if (!img) return null;
  if (typeof img === 'string') return img;
  if ( typeof img === 'opject') return img.src;
  if (img.asset?.url && typeof img.asset.url === 'string') return img.asset.url;
  
};

export default function FeaturedBlogPreview({ featuredPost }) {
  // دمج البيانات القادمة من السيرفر مع البيانات الافتراضية
  // هذا السطر يحميك من أخطاء undefined
  const post = {
    ...featuredPost 
  };


  return (
    <section className="bg-white px-4 pt-15 md:px-8 text-center">
      <hr className="pb-20 w-3/4 mx-auto border-black" />
      <div className="mx-auto max-w-6xl rounded-2xl border border-gray-300 bg-white p-5 shadow-sm md:p-7">
        <div className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="relative h-64 md:h-full min-h-62.5">
              { 
                <img
                  src={post.image.src}
                  alt={post.title || 'Featured post'}
                  className="object-cover rounded-sm group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              }
              <Badge className="absolute top-4 left-4 bg-accent-teal text-white">Featured</Badge>
            </div>
            <div className="p-6 md:p-8 flex flex-col justify-center text-left ">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-accent-teal uppercase tracking-wide">{post.category || 'Uncategorized'}</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">{post.year || '2024'}</span>
              </div>
              <h2 className="text-2xl font-bold text-primary-blue mt-2 mb-4 group-hover:text-accent-teal transition-colors">{post.title || 'Untitled'}</h2>
              <p className="text-gray-600 mb-6 h-30 overflow-hidden ">{post.excerpt || 'No excerpt available.'}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><User size={14} /> {post.author || 'Unknown'}</span>

              </div>
              <div className="mt-6">
                <Link href={`/blog/${post.slug || post.id || '#'}`} className="inline-block bg-white text-black border h px-6 py-3 rounded-lg font-semibold hover:bg-cyan-400 transition">
                  Read Article
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-15">
        <Link href="/blog" className="cursor-pointer flex-col bg-cyan-400 w-full sm:w-auto px-6 py-3 rounded-md hover:bg-cyan-300 transition inline-block text-center font-semibold">

          Go to Blog page
        </Link>
      </div>
    </section>
  );
}