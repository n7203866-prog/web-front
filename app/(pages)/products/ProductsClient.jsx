'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// ✅ حذفنا sanityFetch - مش محتاجينه هنا
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getImageUrl } from '@/lib/api';

// Validation Schema
const schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9]{10,15}$/.test(val), {
      message: "Phone must be 10-15 digits",
    }),
  nationality: z.string().min(2, "Country is required"),
  email: z.string().email("Invalid email"),
  id_number: z.string().regex(/^[0-9]{6,20}$/, "ID must be 6-20 digits"),
  job_position: z.string().min(2, "Job position is required"),
  file_upload: z.any().optional(),
  message: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 10, {
      message: "Message must be at least 10 characters",
    }),
});

// ✅ استيراد الخطوط
import { Montserrat, Lato } from 'next/font/google';
const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-montserrat', display: 'swap' });
const lato = Lato({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-lato', display: 'swap' });

export default function ProductsClient({
  initialProducts = [],
  initialTotal = 0,
  initialLimit = 9,
  categories = [],
  initialFilters = {}
}) {
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isSending, setIsSending] = useState(false);
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
  // ✅ نستخدم الـ props مباشرة للعرض (من غير fetch من الكلينت)


const products = initialProducts;
const total = initialTotal;;

  const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || 'all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const activeFiltersCount = [selectedCategory !== 'all', searchTerm !== ''].filter(Boolean).length;

  // ✅ تحديث الـ URL - ده هيخلي الـ Server Component يعيد الجلب
  const updateURL = (newFilters) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== 'all') params.set(key, value);
      else params.delete(key);
    });
    router.replace(`/products?${params.toString()}`, { scroll: false });
  };

  // ✅ دالة تغيير الفلتر - بتحدّث الـ URL بس
  const handleFilterChange = (type, value) => {
    if (type === 'category') setSelectedCategory(value);
    setIsFilterOpen(false);
    updateURL({
      category: type === 'category' ? value : selectedCategory,
      search: searchTerm
    });
  };

  // ✅ دالة البحث (Debounce) - بتحدّث الـ URL بس
  useEffect(() => {
    const timer = setTimeout(() => {
        updateURL({ search: searchTerm, category: selectedCategory })
        ;
      
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, initialFilters.search, selectedCategory]);

  // ✅ دالة مسح الفلاتر
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    updateURL({ search: '', category: 'all' });
  };

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const selectedFile = watch("file_upload");

 const onSubmit = async (data) => {
  setSubmitStatus(null);
  setIsSending(true);

  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("email", data.email);
  formData.append("phone", data.phone || "");
  formData.append("nationality", data.nationality || "");
  formData.append("id_number", data.id_number || "");
  formData.append("job_position", data.job_position || "");
  formData.append("message", data.message || "");
  formData.append("form_type", "product");
  formData.append("related_item_title", selectedProduct?.name || "");
  formData.append("page_url", window.location.href);

  if (selectedProduct?.id) {
    formData.append("related_item_id", selectedProduct.id);
  }

  if (data.file_upload?.[0]) {
    formData.append("file_upload", data.file_upload[0]);
  }

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      body: formData,
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      setSubmitStatus({ success: false, message: result.error || "Failed to send inquiry" });
      return;
    }

    setSubmitStatus({ success: true, message: result.message || "Inquiry sent successfully" });
    reset();
    setSelectedProduct(null);
    setIsModalOpen(false);
  } catch {
    setSubmitStatus({ success: false, message: "Server connection error" });
  } finally {
    setIsSending(false);
  }
};
  
  return (
    <div className={`w-full ${montserrat.variable} ${lato.variable}`}>

      {/* Hero */}
      <section className="relative h-110 md:h-100 flex items-center justify-center" style={{ backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/310519663501931725/NDH26YUVEhEqewFzJJMLzu/hero-main-JtKuYQ2rY9EeeUnjBU9uGQ.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="font-bold text-5xl md:text-7xl mb-6 text-white [font-family:var(--font-montserrat)]">Our Products</h1>
          <p className="text-xl md:text-2xl text-white max-w-2xl mx-auto [font-family:var(--font-lato)]">Comprehensive security and intelligence solutions</p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">

          <div className="mb-12">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-teal [font-family:var(--font-lato)]" />
            </div>

            {/* Category Buttons */}
            <div className="flex flex-wrap gap-3">
              <button onClick={() => handleFilterChange('category', 'all')} className={`px-6 py-2 rounded-lg font-bold transition-colors capitalize [font-family:var(--font-montserrat)] ${selectedCategory === 'all' ? 'bg-accent-teal text-cyan-700' : 'bg-light-gray text-primary-blue hover:bg-accent-teal/10'}`}>All</button>
              {categories?.map((cat) => (
                <button key={cat._id} onClick={() => handleFilterChange('category', cat.slug)} className={`px-6 py-2 rounded-lg font-bold transition-colors capitalize [font-family:var(--font-montserrat)] ${selectedCategory === cat.slug ? 'bg-accent-teal text-cyan-700' : 'bg-light-gray text-primary-blue hover:bg-accent-teal/10'}`}>{cat.title}</button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <p className="text-sm text-gray-500 mb-6 [font-family:var(--font-lato)]">
            Showing {products?.length || 0} of {total || 0} products
            {searchTerm && ` for "${searchTerm}"`}
            {selectedCategory !== 'all' && ` in ${categories?.find(c => c.slug === selectedCategory)?.title}`}
          </p>
          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products?.map((product) => (
              <Card key={product._id} className="relative mx-auto w-full max-w-sm overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full border-gray-200">

                {/* Image Container - Fixed Height */}
                <div className="relative w-full h-56 bg-gray-100 overflow-hidden">
                  {product.mainImage?.asset?.url ? (
                    <Image 
                      src={product.mainImage.asset.url} 
                      fill
                      alt={product.mainImage.alt || product.name} 
                      unoptimized 
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No image
                    </div>
                  )}
                  {/* Badge Overlay */}
                  <div className="absolute top-4 left-4 z-10">
                    <Badge variant="default" className="bg-cyan-700 text-white text-xs font-semibold px-3 py-1 [font-family:var(--font-montserrat)]">
                      {product.category?.title || 'Product'}
                    </Badge>
                  </div>
                </div>

                {/* Content Container - Flexible Growth */}
                <div className="flex flex-col flex-grow p-5">
                  {/* Title - Fixed Height Area */}
                  <h3 className="text-lg font-bold text-primary-blue mb-3 line-clamp-2 min-h-[3.5rem] [font-family:var(--font-montserrat)]">
                    {product.name}
                  </h3>

                  {/* Description - Fixed Height Area */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 min-h-[4.5rem] leading-relaxed [font-family:var(--font-lato)]">
                    {product.shortDescription}
                  </p>

                  {/* Pricing - Fixed Height */}
                  <p className="text-base text-primary-blue font-bold mb-6 min-h-[1.5rem] [font-family:var(--font-montserrat)]">
                    {product.price || 'Contact for pricing'}
                  </p>

                  {/* Buttons - Fixed at Bottom */}
                  <div className="flex gap-3 mt-auto">
                    <Link href={`/products/${product.slug}`} className="w-1/2">
                      <Button className="cursor-pointer w-full bg-[#101828] hover:bg-cyan-700 text-white font-semibold py-2.5 rounded-lg transition-colors [font-family:var(--font-montserrat)]">
                        Read More
                      </Button>
                    </Link>
                    <Button 
                      onClick={() => {
                        setIsModalOpen(true);
                        setSelectedProduct({
                          id: product.id || product._id,
                          name: product.name || product.title
                        });
                      }}
                      className="cursor-pointer w-1/2 bg-[#101828] hover:bg-cyan-700 text-white font-semibold py-2.5 rounded-lg transition-colors [font-family:var(--font-montserrat)]"
                    >
                      Contact
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {(!products || products.length === 0) && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-gray-700 font-semibold mb-2 [font-family:var(--font-montserrat)]">No products found</p>
              <p className="text-gray-500 text-sm mb-4 [font-family:var(--font-lato)]">Try adjusting your search terms or selecting a different category.</p>
              <Button variant="outline" onClick={handleClearFilters} className="[font-family:var(--font-montserrat)]">Clear Filters</Button>
            </div>
          )}

        </div>
      </section>

      {/* ✅ Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50 px-4">
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-[#0f172a] text-white p-3 sm:p-5 rounded-2xl w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl shadow-xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute cursor-pointer top-2 right-3 text-xl font-bold">×</button>
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-center">Contact Us</h2>
            <form
              onSubmit={handleSubmit(onSubmit)}

              
              encType="multipart/form-data"
              className="bg-[#1e293b] p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg 
                 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3"
            >
              <div className="flex items-center gap-2 mb-2 sm:col-span-2">
                <label className="block mb-1 text-sm font-medium text-gray-300">Product Name :</label>
                <input
                  type="text"
                  name="Product Name"
                  value={selectedProduct?.name || ""}   
                  className={`w-1/2 mb-2 px-4 py-2 rounded-lg bg-[#0f172a] border ${errors.name ? "border-red-500" : "border-gray-700"
                    } focus:ring-2 focus:ring-cyan-400`}
                  readOnly
                  placeholder="Product Name"

                />
              </div>

              {/* Name (full width) */}
              <div className="sm:col-span-2">
                <input
                  {...register("name")}
                  placeholder="Name"
                  className={`w-full px-4 py-2 rounded-lg bg-[#0f172a] border ${errors.name ? "border-red-500" : "border-gray-700"
                    } focus:ring-2 focus:ring-cyan-400`}
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <input
                  {...register("phone")}
                  placeholder="Phone Number"
                  className={`w-full px-4 py-2 rounded-lg bg-[#0f172a] border ${errors.phone ? "border-red-500" : "border-gray-700"
                    } focus:ring-2 focus:ring-cyan-400`}
                />
                {errors.phone && (
                  <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              {/* Country */}
              <div>
                <input
                  {...register("nationality")}
                  placeholder="Country"
                  className={`w-full px-4 py-2 rounded-lg bg-[#0f172a] border ${errors.nationality ? "border-red-500" : "border-gray-700"
                    } focus:ring-2 focus:ring-cyan-400`}
                />
                {errors.nationality && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.nationality.message}
                  </p>
                )}
              </div>

              {/* Email (full width) */}
              <div className="sm:col-span-2">
                <input
                  {...register("email")}
                  placeholder="Email"
                  className={`w-full px-4 py-2 rounded-lg bg-[#0f172a] border ${errors.email ? "border-red-500" : "border-gray-700"
                    } focus:ring-2 focus:ring-cyan-400`}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* ID */}
              <div>
                <input
                  {...register("id_number")}
                  placeholder="ID Number"
                  className={`w-full px-4 py-2 rounded-lg bg-[#0f172a] border ${errors.id_number ? "border-red-500" : "border-gray-700"
                    } focus:ring-2 focus:ring-cyan-400`}
                />
                {errors.id_number && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.id_number.message}
                  </p>
                )}
              </div>

              {/* Job */}
              <div>
                <input
                  {...register("job_position")}
                  placeholder="Job Position"
                  className={`w-full px-4 py-2 rounded-lg bg-[#0f172a] border ${errors.job_position ? "border-red-500" : "border-gray-700"
                    } focus:ring-2 focus:ring-cyan-400`}
                />
                {errors.job_position && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.job_position.message}
                  </p>
                )}
              </div>

              {/* File (full width) */}
              <div className="sm:col-span-2">
                <label className="block mb-1 text-sm font-medium text-gray-300">Upload File (ID)</label>

                <input
                  type="file"
                  accept="image/*,.pdf"
                  {...register("file_upload")}
                  className="w-full px-4 py-2 rounded-lg bg-[#0f172a] border border-gray-700 text-white"
                />
                {selectedFile?.[0] && (
                  <p className="text-gray-300 text-sm mt-1">Selected file: {selectedFile[0].name}</p>
                )}
              </div>

              {/* Message (full width) */}
              <div className="sm:col-span-2">
                <textarea
                  {...register("message")}
                  placeholder="Message (optional)"
                  rows="4"
                  className={`w-full px-4 py-2 rounded-lg bg-[#0f172a] border ${errors.message ? "border-red-500" : "border-gray-700"
                    } focus:ring-2 focus:ring-cyan-400`}
                />
                {errors.message && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.message.message}
                  </p>
                )}
              </div>

              {/* Button */}
              <div className="sm:col-span-2">
                {submitStatus && (
                  <p className={`mb-2 text-sm ${submitStatus.success ? 'text-emerald-300' : 'text-red-300'}`}>
                    {submitStatus.message}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isSending || isSubmitting}
                  className="w-full cursor-pointer bg-cyan-400 text-black py-3 rounded-lg font-semibold hover:bg-cyan-500 transition disabled:opacity-50"
                >
                  {isSending || isSubmitting ? "Sending..." : "Send"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
