'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, User, Clock, Calendar, Filter, X, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getImageUrl } from '@/lib/api';

// ✅ استيراد الخطوط
import { Montserrat, Lato } from 'next/font/google';
const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-montserrat', display: 'swap' });
const lato = Lato({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-lato', display: 'swap' });

export default function BlogClient({
  initialPosts,
  initialTotal,
  initialLimit,
  categories,
  years,
  featuredPost,
  initialFilters
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [visibleCount, setVisibleCount] = useState(initialLimit);
  const [isLoading, setIsLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || 'all');
  const [selectedYear, setSelectedYear] = useState(initialFilters.year || 'all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // ✅ استخدام المقالات من الـ props بدل Hook
  const posts = initialPosts;
  const total = initialTotal;
  const hasMorePosts = visibleCount < total;

  const activeFiltersCount = [selectedCategory !== 'all', selectedYear !== 'all', searchTerm !== ''].filter(Boolean).length;
  // ✅ تحديث الـ URL لما الفلاتر تتغير
  const updateURL = (newFilters) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== 'all') params.set(key, value);
      else params.delete(key);
    });
    params.delete('limit');
    router.push(`/blog?${params.toString()}`, { scroll: false });
  };
  // ✅ دالة جلب المزيد من المقالات
  const handleLoadMore = async () => {
    setIsLoading(true);
    const newLimit = visibleCount + 6;
    setVisibleCount(newLimit);
    setIsLoading(false);
  };

  // ✅ دالة تغيير الفلتر
  const handleFilterChange = (type, value) => {
    if (type === 'category') setSelectedCategory(value);
    else if (type === 'year') setSelectedYear(value);

    setVisibleCount(initialLimit);
    setIsFilterOpen(false);

    updateURL({
      category: type === 'category' ? value : selectedCategory,
      year: type === 'year' ? value : selectedYear,
      search: searchTerm
    });
  };

  // ✅ دالة البحث (مع Debounce بسيط)
  useEffect(() => {
    const timer = setTimeout(() => {
        setVisibleCount(initialLimit);
        updateURL({ search: searchTerm, category: selectedCategory, year: selectedYear });
      
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ✅ دالة مسح الفلاتر
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedYear('all');
    setVisibleCount(initialLimit);
    updateURL({ search: '', category: 'all', year: 'all' });
  };

  // ✅ إعادة جلب البيانات لما الـ URL تتغير

  return (
    <div className={`w-full min-h-screen bg-white ${montserrat.variable} ${lato.variable}`}>

      {/* Hero */}
      <section className="relative h-75 md:h-100 flex items-center justify-center" style={{ backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/310519663501931725/NDH26YUVEhEqewFzJJMLzu/hero-main-JtKuYQ2rY9EeeUnjBU9uGQ.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="font-bold text-5xl md:text-7xl mb-6 text-white [font-family:var(--font-montserrat)]"> Articles</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto [font-family:var(--font-lato)]">Insights and updates from our experts</p>
        </div>
      </section>

      {/* Search Bar */}
      <div className="border-b border-border bg-white  top-16 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-teal [font-family:var(--font-lato)]"
              />
            </div>
            <Button variant="outline" size="sm" className="lg:hidden [font-family:var(--font-montserrat)] whitespace-nowrap" onClick={() => setIsFilterOpen(!isFilterOpen)}>
              <Filter size={16} className="mr-2" /> Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {isFilterOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsFilterOpen(false)} />}

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">

            {/* Featured Post */}
            {selectedCategory === 'all' && selectedYear === 'all' && !searchTerm && featuredPost && (
              <Link href={`/blog/${featuredPost.slug}`} className="group block">
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="relative h-64 md:h-full min-h-[250px]">
                      {featuredPost.featured_image && (
                        <Image
                          src={getImageUrl(featuredPost.featured_image)}
                          alt={featuredPost.title}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      )}
                      <Badge className="absolute top-4 left-4 bg-accent-teal text-white [font-family:var(--font-montserrat)]">Featured</Badge>
                    </div>
                    <div className="p-6 md:p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-accent-teal uppercase tracking-wide [font-family:var(--font-montserrat)]">{featuredPost.category?.name}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 [font-family:var(--font-lato)]">{new Date(featuredPost.published_at).getFullYear()}</span>
                      </div>
                      <h2 className="text-2xl font-bold text-primary-blue mt-2 mb-4 group-hover:text-accent-teal transition-colors [font-family:var(--font-montserrat)]">{featuredPost.title}</h2>
                      <p className="text-gray-600 mb-6 [font-family:var(--font-lato)]">{featuredPost.excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 [font-family:var(--font-lato)]">
                        <span className="flex items-center gap-1"><User size={14} /> {featuredPost.author_data}</span>
                        <span className="flex items-center gap-1"><Calendar size={16} className="text-gray-400" />
                          {featuredPost.published_at ? new Date(featuredPost.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'No date'}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            )}

            {/* Posts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                    <div className="relative w-full aspect-video flex-shrink-0">
                      {post.featured_image && (
                        <Image
                          src={getImageUrl(post.featured_image)}
                          alt={post.title}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, 50vw"
                        />
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs border-accent-teal text-accent-teal [font-family:var(--font-montserrat)]">
                          {post.category?.name}
                        </Badge>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 [font-family:var(--font-lato)]">{new Date(post.published_at).getFullYear()}</span>
                      </div>
                      <h3 className="text-base font-bold text-primary-blue mb-2 group-hover:text-accent-teal transition-colors line-clamp-2 [font-family:var(--font-montserrat)]">{post.title}</h3>
                      <p className="text-gray-600 text-xs mb-3 line-clamp-2 flex-1 [font-family:var(--font-lato)]">{post.excerpt}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                        <span className="text-xs text-gray-600 truncate max-w-[120px] [font-family:var(--font-lato)]"><User size={14} />{post.author_data}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1 [font-family:var(--font-lato)]"><Calendar size={16} className="text-gray-400" />
                          {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'No date'}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Loading State */}
            {isLoading && visibleCount < total && (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-primary-blue" size={24} />
              </div>
            )}

            {/* Empty State */}
            {!isLoading && posts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-gray-700 font-semibold mb-2 [font-family:var(--font-montserrat)]">No articles found</p>
                <p className="text-gray-500 text-sm mb-4 [font-family:var(--font-lato)]">Try adjusting your search terms or filters.</p>
                <Button variant="outline" onClick={handleClearFilters} className="[font-family:var(--font-montserrat)]">Clear All Filters</Button>
              </div>
            )}

            {/* Load More */}
            {!isLoading && hasMorePosts && posts.length > 0 && (
              <div className="flex justify-center pt-8">
                <Button onClick={handleLoadMore} disabled={isLoading} className="bg-primary-blue text-black hover:bg-primary-blue/90 px-8 py-2 [font-family:var(--font-montserrat)]">
                  {isLoading ? <><Loader2 className="animate-spin mr-2" size={16} /> Loading...</> : 'Load More Articles'}
                </Button>
              </div>
            )}

            {/* End Message */}
            {!isLoading && !hasMorePosts && posts.length > 0 && (
              <p className="text-center text-gray-500 py-6 [font-family:var(--font-lato)]">
                ✨ You&apos;ve reached the end of the articles.
              </p>
            )}

          </div>

          {/* Sidebar */}
          <aside className={`
            /* الموبايل: يظهر كقائمة منبثقة تحت شريط البحث مباشرة */
            ${isFilterOpen ? 'fixed top-[100px] left-0 right-0 z-50 bg-white p-4 shadow-xl border-b lg:hidden animate-in slide-in-from-top-4 duration-300 overflow-y-auto max-h-[85vh]' : 'hidden'}
            
            /* الديسكتوب: يرجع سايدبار عادي في الجريد */
            lg:col-span-1 lg:block lg:static lg:bg-transparent lg:shadow-none lg:p-0 lg:border-none lg:z-auto lg:top-auto lg:max-h-none lg:overflow-visible
          `}>
            <div className="bg-white p-5 rounded-lg border shadow-lg lg:shadow-none lg:border-none lg:bg-transparent lg:p-0">

              {/* Mobile Close Button */}
              <div className="flex items-center justify-between mb-4 lg:hidden border-b pb-3">
                <h3 className="font-bold text-lg text-primary-blue [font-family:var(--font-montserrat)]">Filters</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsFilterOpen(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} className="text-gray-500" /></Button>
              </div>

              {/* Categories */}
              <Card className="p-5 mb-4">
                <h3 className="font-bold text-lg mb-4 text-primary-blue [font-family:var(--font-montserrat)]">Categories</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat._id || cat.id}
                      onClick={() => handleFilterChange('category',  cat.slug)}
                      className={`w-full flex items-center justify-between py-2 px-3 rounded-lg transition-colors text-left text-sm [font-family:var(--font-lato)] ${selectedCategory === (cat.slug || cat.id) ? 'bg-accent-teal/10 text-accent-teal font-medium' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                    >
                      <span>{cat.name || cat.label}</span>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Years */}
              <Card className="p-5">
                <h3 className="font-bold text-lg mb-4 text-primary-blue [font-family:var(--font-montserrat)]">Year</h3>
                <div className="space-y-2">
                  {years.map((year) => (
                    <button
                      key={year.id}
                      onClick={() => handleFilterChange('year', year.id)}
                      className={`w-full flex items-center justify-between py-2 px-3 rounded-lg transition-colors text-left text-sm [font-family:var(--font-lato)] ${selectedYear === year.id ? 'bg-accent-teal/10 text-accent-teal font-medium' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                    >
                      <span>{year.label}</span>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <Button variant="outline" onClick={handleClearFilters} className="w-full mt-4 [font-family:var(--font-montserrat)]">
                  <X size={16} className="mr-2" /> Clear All Filters
                </Button>
              )}
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}
