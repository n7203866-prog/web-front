'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar, Clock, ArrowLeft,MessageCircle,
  Link as LinkIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getImageUrl } from '@/lib/api';
import { PortableText } from '@portabletext/react';
// ✅ استيراد الخطوط
import { Montserrat, Lato } from 'next/font/google';
const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-montserrat', display: 'swap' });
const lato = Lato({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-lato', display: 'swap' });

// (Sanity PortableText removed — we render HTML from Django/CKEditor)

// ============================================================================
// ✅ مكون المشاركة (أيقونات مباشرة - زي JetBrains)
// ============================================================================
function ShareButtons({ articleUrl, articleTitle , community_link }) {
  return (
    <div className="flex items-center gap-4 pt-6 border-t border-border">
      <span className="text-sm font-medium text-gray-600 [font-family:var(--font-montserrat)]">Share:</span>
      <div className="flex items-center gap-2">
        {/* Facebook */}
        <Link
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-lg border border-border hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all"
          aria-label="Share on Facebook"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
          </svg>
        </Link>

        {/* Twitter / X */}
        <Link
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(articleTitle)}&url=${encodeURIComponent(articleUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-lg border border-border hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2] transition-all"
          aria-label="Share on Twitter"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
          </svg>
        </Link>

        {/* LinkedIn */}
        <Link
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-lg border border-border hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-all"
          aria-label="Share on LinkedIn"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect x="2" y="9" width="4" height="12" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        </Link>


        {/* Copy Link */}
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(articleUrl);
              alert('✅ Link copied to clipboard!');
            } catch { }
          }}
          className="p-2.5 rounded-lg border border-border hover:bg-[#101828] hover:text-white hover:border-primary-blue transition-all"
          aria-label="Copy link"
        >
          <LinkIcon size={16} />
        </button>
        {/* comunity link */}
        <Link
          href={community_link || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-lg border border-border hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-all"
          aria-label="Share on LinkedIn"
        >
         
          <MessageCircle size={16} />
         
        </Link>
        
      </div>
    </div>
  );
}
// ============================================================================
// ✅ مكونات عرض المحتوى الغني (Portable Text) - زي مقال JetBrains
// ============================================================================
const portableTextComponents = {
  // 📝 تنسيق العناوين والفقرات
  block: {
    h2: ({ children }) => (
      <h2 id={children?.toString().toLowerCase().replace(/\s+/g, '-')}
        className="text-2xl md:text-3xl font-bold text-primary-blue mt-10 mb-5 scroll-mt-24 [font-family:var(--font-montserrat)]">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl md:text-2xl font-bold text-primary-blue mt-8 mb-4 [font-family:var(--font-montserrat)]">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg font-bold text-primary-blue mt-6 mb-3 [font-family:var(--font-montserrat)]">
        {children}
      </h4>
    ),
    normal: ({ children }) => (
      <p className="mb-5 text-gray-700 leading-relaxed [font-family:var(--font-lato)]">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-accent-teal pl-6 py-5 my-8 italic text-gray-700 bg-gray-50 rounded-r-lg [font-family:var(--font-lato)]">
        {children}
      </blockquote>
    ),
  },

  // 🔸 تنسيق القوائم
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-outside ml-6 space-y-2 mb-6 text-gray-700 [font-family:var(--font-lato)]">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-outside ml-6 space-y-2 mb-6 text-gray-700 [font-family:var(--font-lato)]">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="mb-1 pl-1">{children}</li>,
    number: ({ children }) => <li className="mb-1 pl-1">{children}</li>,
  },

  // 🖼️ تنسيق الصور جوه المحتوى (زي JetBrains)
  types: {
  image: ({ value }) => (
    <img
      src={getImageUrl(value.url)}
      alt={value.alt || ''}
      className="rounded-xl my-8 w-full"
    />
  ),

  code: ({ value }) => (
    <pre className="bg-black text-white p-4 rounded-xl overflow-x-auto my-6">
      <code>{value.code}</code>
    </pre>
  ),
},

  // 🔗 تنسيق الروابط والنص العريض/المائل
  marks: {
  link: ({ value, children }) => (
    <a
      href={value?.href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 underline"
    >
      {children}
    </a>
  ),
},
};
// ============================================================================
// ✅ المكون الرئيسي لعرض المقال
// ============================================================================
export default function ArticleContent({ article }) {
  const articleUrl = typeof window !== 'undefined' ? window.location.href : '';
  const community_link = article.community_link
  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center p-8">
          <p className="text-gray-600 [font-family:var(--font-lato)]">No article data available.</p>
          <Link href="/blog" className="text-accent-teal hover:underline mt-2 inline-block">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className={`w-full min-h-screen bg-white ${montserrat.variable} ${lato.variable}`}>

      {/* ✅ Back Button */}
      <nav className="bg-[#101828] pt-30 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/blog"
            className="text-white hover:text-primary-blue font-medium flex items-center gap-2 [font-family:var(--font-lato)]"
          >
            <ArrowLeft size={18} />
            Back to Blog
          </Link>
        </div>
      </nav>

      {/* ✅ Article Header */}
      <header className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-10 max-w-4xl">

          {/* Category Badge */}
          <Badge className="mb-4 bg-accent-teal text-white [font-family:var(--font-montserrat)]">
            {article.category?.name || 'Uncategorized'}
          </Badge>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold text-primary-blue mb-6 leading-tight [font-family:var(--font-montserrat)]">
            {article.title}
          </h1>
          {/* Excerpt */}
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed [font-family:var(--font-lato)]">
            {article.excerpt}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 [font-family:var(--font-lato)] pb-6 border-b border-border">

            {/* Author */}
            <div className="flex items-center gap-3">
              {article.author?.image ? (
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-primary-blue/10">
                  <Image
                    src={urlFor(article.author.image).width(80).url()}
                    alt={article.author.name}
                    width={40}
                    height={40}
                    className="object-cover"

                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-blue-light flex items-center justify-center text-primary-blue font-semibold flex-shrink-0">
                  {article.author?.name?.charAt(0) || 'A'}
                </div>
              )}
              <div>
                <p className="font-semibold text-primary-blue">{article.author_data || 'Unknown Author'}</p>
                <p className="text-xs text-gray-500">Author</p>
              </div>
            </div>

            {/* Date & Read Time */}
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Calendar size={16} className="text-gray-400" />
                {article.published_at ? new Date(article.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'No date'}
              </span>
              
            </div>
          </div>
        </div>
      </header>

      {/* ✅ Featured Image */}
      { (
        <div className="relative w-full h-75 md:h-125  bg-gray-100">
          <Image
            src={article.featured_image}
            alt={article.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
            unoptimized
          />
        </div>
      )}

      {/* ✅ Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-6xl mx-auto">

          {/* Article Body */}
          <article className="lg:col-span-12">

            {/* ✅ Render HTML content from CKEditor */}
            {/* <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content || '' }}
            /> */}

           
           
           <div className="prose prose-lg max-w-none">
              <PortableText value={article.content} components={portableTextComponents} />
            </div>

            {/* Share Buttons */}
            <ShareButtons articleUrl={articleUrl} articleTitle={article.title} community_link={community_link} />

              
          </article>



        </div>
      </main>
    </div>
  );
}
