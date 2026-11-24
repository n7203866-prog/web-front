'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Calendar, Users, Clock, Search, ChevronRight , ExternalLink, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Montserrat, Lato } from 'next/font/google';

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useEnrollment from '@/hooks/useEnrollment';

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

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-montserrat', display: 'swap' });
const lato = Lato({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-lato', display: 'swap' });

export default function WebinarClient({
  initialWebinars,
  initialTotal = 0,
  initialLimit = 9,
  categories = [],
  initialFilters = {}
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ نستخدم الـ props مباشرة للعرض (من غير fetch من الكلينت)
  const webinars = initialWebinars||[];
  const total = initialTotal||0;

  const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || 'all');
  const [selectedWebinar, setSelectedWebinar] = useState(null);
  const [submitMessage, setSubmitMessage] = useState('');
  

  const activeFiltersCount = [selectedCategory !== 'all', searchTerm !== ''].filter(Boolean).length;

  // ✅ تحديث الـ URL - ده هيخلي الـ Server Component يعيد الجلب
  const updateURL = useCallback((newFilters) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== 'all') params.set(key, value);
      else params.delete(key);
    });
    router.replace(`/webinars?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // ✅ دالة تغيير الفلتر - بتحدّث الـ URL بس
  const handleFilterChange = useCallback((type, value) => {
    if (type === 'category') setSelectedCategory(value);
    updateURL({
      category: type === 'category' ? value : selectedCategory,
      search: searchTerm
    });
  }, [selectedCategory, searchTerm, updateURL]);

  // ✅ دالة البحث (Debounce) - بتحدّث الـ URL بس
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== (initialFilters.search || '')) {
        updateURL({ search: searchTerm, category: selectedCategory });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, initialFilters.search, selectedCategory, updateURL]);

  // ✅ دالة مسح الفلاتر
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('all');
    updateURL({ search: '', category: 'all' });
  }, [updateURL]);

  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const getWebinarEnrollmentId = (webinar) => `webinar-${webinar?._id || webinar?.slug?.current || webinar?.slug || webinar?.title}`;

  const onSubmit = async (data) => {
    if (!selectedWebinar?.id) return;

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('phone', data.phone || '');
    formData.append('nationality', data.nationality || '');
    formData.append('id_number', data.id_number || '');
    formData.append('job_position', data.job_position || '');
    formData.append('message', data.message || '');
    formData.append('form_type', 'webinar');
    formData.append('related_item_title', selectedWebinar.title || '');
    formData.append('page_url', window.location.href);

    if (/^\d+$/.test(String(selectedWebinar.id))) {
      formData.append('related_item_id', selectedWebinar.id);
    }

    if (data.file_upload?.[0]) {
      formData.append('file_upload', data.file_upload[0]);
    }

    const response = await fetch("/api/contact", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      setSubmitMessage('Unable to submit right now. Please try again.');
      return;
    }

    
    setSubmitMessage('Enrollment submitted successfully.');
    reset();
    setIsModalOpen(false)
  };


  // ✅ دالة التسجيل
  const handleRegister = (webinar) => {
    const webinarId = getWebinarEnrollmentId(webinar);
    

    if (webinar?.registrationLink) {
      window.open(webinar.registrationLink, '_blank', 'noopener,noreferrer');
    } else {
      setSelectedWebinar({
        id: webinarId,
        title: webinar?.title || '',
      });
      setSubmitMessage('');
      return setIsModalOpen(true);


    }
  };

  // ✅ تنسيق التاريخ
  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div className={`w-full ${montserrat.variable} ${lato.variable}`}>
      {/* Hero */}
      <section className="hero-section relative h-75 md:h-100 flex items-center justify-center" style={{ backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/310519663501931725/NDH26YUVEhEqewFzJJMLzu/hero-main-JtKuYQ2rY9EeeUnjBU9uGQ.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="hero-content relative z-10 text-center px-4">
          <h1 className="font-bold text-5xl md:text-7xl mb-6 text-white [font-family:var(--font-montserrat)]">Webinars & Events</h1>
          <p className="text-xl md:text-2xl text-white max-w-2xl mx-auto [font-family:var(--font-lato)]">Join our expert-led online sessions</p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="Search webinars..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-teal [font-family:var(--font-lato)]" />
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => handleFilterChange('category', 'all')} className={`px-6 py-2 rounded-lg font-bold transition-colors [font-family:var(--font-montserrat)] ${selectedCategory === 'all' ? 'bg-accent-teal text-cyan-400' : 'bg-light-gray text-primary-blue hover:bg-accent-teal/10'}`}>All</button>
              {categories?.map((cat) => (
                <button key={cat._id} onClick={() => handleFilterChange('category', cat.slug)} className={`px-6 py-2 rounded-lg font-bold transition-colors [font-family:var(--font-montserrat)] ${selectedCategory === cat.slug ? 'bg-accent-teal text-cyan-400' : 'bg-light-gray text-primary-blue hover:bg-accent-teal/10'}`}>{cat.title}</button>
              ))}
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-6 [font-family:var(--font-lato)]">
            Showing <span className="font-semibold text-primary-blue">{webinars?.length || 0}</span> of <span className="font-semibold">{total || 0}</span> webinars
            {searchTerm && ` for "${searchTerm}"`}
          </p>

          {/* Webinars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {webinars?.map((webinar) => {
              const webinarEnrollmentId = getWebinarEnrollmentId(webinar);
              

              return (
              <Card key={webinar.id} className="p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col">
                {webinar.main_image &&(
                  <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden">
                    <Image src={webinar.main_image} unoptimized alt={webinar.main_image.alt || webinar.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                  </div>
                )}
                <h3 className="font-bold text-lg mb-3 text-primary-blue [font-family:var(--font-montserrat)]">{webinar?.title || 'Untitled'}</h3>
                {webinar?.category?.name && (
                  <span className="inline-block text-xs bg-accent-teal-light text-accent-teal px-3 py-1 rounded-full self-start mb-4 capitalize [font-family:var(--font-montserrat)]">
                    {webinar.category.name}
                  </span>
                )}
                <div className="space-y-3 mb-6 grow">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={18} className="text-accent-teal shrink-0" />
                    <span className="text-sm [font-family:var(--font-lato)]">{formatDate(webinar?.date)} {webinar?.time && `• ${webinar.time}`}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={18} className="text-accent-teal shrink-0" />
                    <span className="text-sm [font-family:var(--font-lato)]">{webinar?.duration || '60 min'}</span>
                  </div>
                  
                </div>
                {webinar?.speakers && (
                  <p className="text-sm text-gray-600 mb-4 [font-family:var(--font-lato)]">
                    <span className="font-semibold text-primary-blue">Speaker:</span> {webinar.speakers.name}
                  </p>
                )}
                {webinar?.title &&(
                  <p className="text-sm text-gray-500 mb-6 line-clamp-2 [font-family:var(--font-lato)]">{webinar.title}</p>
                )}
                <div className="flex flex-wrap gap-2 mb-4">
                  {webinar?.is_live && <Badge className="bg-green-100 text-green-700 text-xs">{webinar.status}</Badge>}
                  {webinar?.is_recorded && <Badge className="bg-blue-100 text-blue-700 text-xs">Recorded</Badge>} 
                </div>
                <Button size="lg"  className="cursor-pointer w-full bg-[#101828] hover:bg-cyan-700 text-white font-bold disabled:cursor-not-allowed disabled:bg-gray-400 [font-family:var(--font-montserrat)]" onClick={() => {
                  handleRegister(webinar)
                }}>
                Enroll
                </Button>
                <Link href={`/webinars/${webinar.slug}`}>
                        <Button size="lg" variant="outline" className="cursor-pointer w-full [font-family:var(--font-montserrat)]">Details <ChevronRight size={16} className="ml-1" /></Button>
                      </Link>
              </Card>
            )})}
          </div>


        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50 px-4">
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-[#0f172a] text-white p-5 sm:p-6 rounded-2xl w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl shadow-xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute cursor-pointer top-2 right-3 text-xl font-bold">×</button>
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-center">Contact Us</h2>
            <form
              onSubmit={handleSubmit(onSubmit)}
              encType="multipart/form-data"
              className="bg-[#1e293b] p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg 
                 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3"
            >
              <div className="flex items-center gap-2 mb-2 sm:col-span-2 ">
                <label className="block mb-1 text-sm font-medium text-gray-300">Webinar Name :  </label>
                <input
                  type="text"
                  name="webinar"
                  value={selectedWebinar?.title || ''}
                  className={`w-1/2 mb-2 px-4 py-2 rounded-lg bg-[#0f172a] border ${errors.name ? "border-red-500" : "border-gray-700"
                    } focus:ring-2 focus:ring-cyan-400`}
                  readOnly
                  placeholder="Webinar Name"

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
                {submitMessage && (
                  <p className={`mb-2 text-sm ${submitMessage.includes('successfully') ? 'text-emerald-300' : 'text-red-300'}`}>
                    {submitMessage}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full cursor-pointer bg-cyan-400 text-black py-3 rounded-lg font-semibold hover:bg-cyan-500 transition disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
