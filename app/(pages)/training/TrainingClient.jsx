'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, Calendar, Clock, Users, ChevronRight, X, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCourses } from '@/hooks/useCourses';
import { getImageUrl } from '@/lib/api';


// ✅ استيراد الخطوط
import { Montserrat, Lato } from 'next/font/google';
const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-montserrat', display: 'swap' });
const lato = Lato({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-lato', display: 'swap' });

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

export default function TrainingClient({
  initialCourses ,
  initialTotal = 0,
  initialLimit = 9,
  categories = [],
  initialFilters = {}
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || 'all');
  const [selectedType, setSelectedType] = useState(initialFilters.type || 'all');
  const [selectedLevel, setSelectedLevel] = useState(initialFilters.level || 'all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openCourseId, setOpenCourseId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [submitMessage, setSubmitMessage] = useState('');


 const courses = initialCourses || [];
const total = initialTotal || 0;

  // ✅ فورم التحكم
  const { register, watch, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(schema),
  });

  const selectedFile = watch("file_upload");

  const getCourseEnrollmentId = (course) => `training-${course?._id || course?.slug?.current || course?.slug || course?.title}`;

  const onSubmit = async (data) => {
    if (!selectedTraining?.id) return;

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('phone', data.phone || '');
    formData.append('nationality', data.nationality || '');
    formData.append('id_number', data.id_number || '');
    formData.append('job_position', data.job_position || '');
    formData.append('message', data.message || '');
    formData.append('form_type', 'training');
    formData.append('related_item_title', selectedTraining.title || '');
    formData.append('page_url', window.location.href);

    if (/^\d+$/.test(String(selectedTraining.id))) {
      formData.append('related_item_id', selectedTraining.id);
    }

    if (data.file_upload?.[0]) {
      formData.append('file_upload', data.file_upload[0]);
    }

    const response = await fetch('/api/contact', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      setSubmitMessage(result.error || 'Unable to submit right now. Please try again.');
      return;
    }

    setSubmitMessage(result.message || 'Enrollment submitted successfully.');
    reset();
    setIsModalOpen(false);
  };



  const activeFiltersCount = [selectedCategory !== 'all', selectedType !== 'all', selectedLevel !== 'all', searchTerm !== ''].filter(Boolean).length;

  // ✅ بديل: استخدم window.location.href لعمل ري لود كامل (أقل كفاءة لكن مضمون)
  const updateURL = (newFilters) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== 'all') params.set(key, value);
      else params.delete(key);
    });

    // ✅ ري لود كامل للصفحة بالـ URL الجديد
    router.replace(`/training?${params.toString()}`);
  };

  // ✅ دالة تغيير الفلتر - بتحدّث الـ URL بس
  const handleFilterChange = (type, value) => {
    if (type === 'category') setSelectedCategory(value);
    else if (type === 'courseType') setSelectedType(value);
    else if (type === 'level') setSelectedLevel(value);

    setIsFilterOpen(false);
    updateURL({
      category: type === 'category' ? value : selectedCategory,
      type: type === 'courseType' ? value : selectedType,
      level: type === 'level' ? value : selectedLevel,
      search: searchTerm
    });
  };

  // ✅ دالة البحث (Debounce) - بتحدّث الـ URL بس
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== (initialFilters.search || '')) {
        updateURL({ search: searchTerm, category: selectedCategory, type: selectedType, level: selectedLevel });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, initialFilters.search, selectedCategory, selectedType, selectedLevel]);

  // ✅ دالة مسح الفلاتر
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedType('all');
    setSelectedLevel('all');
    updateURL({ search: '', category: 'all', type: 'all', level: 'all' });
  };

  // ✅ منع السكرول لما المودال مفتوح
  useEffect(() => {
    if (openCourseId) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [openCourseId]);

  // ✅ Helper: لون البادج حسب النوع
  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'online': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'onsite': return 'bg-green-100 text-green-700 border-green-200';
      case 'webinar': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // ✅ Helper: لون البادج حسب المستوى
  const getLevelBadgeColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-emerald-100 text-emerald-700';
      case 'intermediate': return 'bg-amber-100 text-amber-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className={`w-full min-h-screen bg-white ${montserrat.variable} ${lato.variable}`}>

      {/* Hero */}
      <section className="relative  h-110 md:h-100 flex items-center justify-center" style={{ backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/310519663501931725/NDH26YUVEhEqewFzJJMLzu/hero-main-JtKuYQ2rY9EeeUnjBU9uGQ.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="font-bold text-4xl md:text-5xl mb-6 text-white [font-family:var(--font-montserrat)]">Advance Your Forensics Skills</h1>
          <p className="text-xl md:text-2xl text-white max-w-2xl mx-auto [font-family:var(--font-lato)]">Hands-on courses designed by industry experts. Learn practical techniques you can apply immediately.</p>
        </div>
      </section>

      {/* Search & Filters */}
      <div className="border-b border-border bg-white  top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">

           

            {/* Type Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600 [font-family:var(--font-lato)]">Type:</span>
              <button onClick={() => handleFilterChange('courseType', 'all')} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors [font-family:var(--font-montserrat)] ${selectedType === 'all' ? 'bg-primary-blue text-[#101828]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>All</button>
              <button onClick={() => handleFilterChange('courseType', 'online')} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors [font-family:var(--font-montserrat)] ${selectedType === 'online' ? 'bg-primary-blue text-[#101828]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Online</button>
              <button onClick={() => handleFilterChange('courseType', 'onsite')} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors [font-family:var(--font-montserrat)] ${selectedType === 'onsite' ? 'bg-primary-blue text-[#101828]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>On-Site</button>

            </div>

             {/* category Filter */}
<div className="flex flex-wrap items-center gap-2">
  <span className="text-sm text-gray-600 [font-family:var(--font-lato)]">
    Categories:
  </span>

  <button
    onClick={() => handleFilterChange('category', 'all')}
    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors [font-family:var(--font-montserrat)]
    ${
      selectedCategory === 'all'
        ? 'bg-primary-blue text-[#101828]'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    All
  </button>

  {categories?.map((cat) => (
    <button
      key={cat.slug}
      onClick={() => handleFilterChange('category', cat.slug)}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors [font-family:var(--font-montserrat)]
      ${
        selectedCategory === cat.slug
          ? 'bg-primary-blue text-[#101828]'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {cat.title}
    </button>
  ))}
</div>

            {/* Level Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600 [font-family:var(--font-lato)]">Level:</span>
              <button onClick={() => handleFilterChange('level', 'all')} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors [font-family:var(--font-montserrat)] ${selectedLevel === 'all' ? 'bg-accent-teal text-[#101828]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>All</button>
              <button onClick={() => handleFilterChange('level', 'beginner')} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors [font-family:var(--font-montserrat)] ${selectedLevel === 'beginner' ? 'bg-accent-teal text-[#101828]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Beginner</button>
              <button onClick={() => handleFilterChange('level', 'intermediate')} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors [font-family:var(--font-montserrat)] ${selectedLevel === 'intermediate' ? 'bg-accent-teal text-[#101828]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Intermediate</button>
              <button onClick={() => handleFilterChange('level', 'advanced')} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors [font-family:var(--font-montserrat)] ${selectedLevel === 'advanced' ? 'bg-accent-teal text-[#101828]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Advanced</button>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-gray-500 hover:text-primary-blue [font-family:var(--font-montserrat)]">
                <X size={16} className="mr-1" /> Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">

        {/* Results Count */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-gray-600 [font-family:var(--font-lato)]">
            Showing <span className="font-semibold text-primary-blue">{courses?.length || 0}</span> of <span className="font-semibold">{total || 0}</span> courses
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses?.map((course) => {
            const courseEnrollmentId = getCourseEnrollmentId(course);
            return (
              <Card key={course.id} className="overflow-hidden p-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">

                {/* Image */}
                <div className="relative w-full aspect-video shrink-0">
                  {course.main_image ? (
                    <Image src={getImageUrl(course.main_image)} unoptimized alt={course.title} fill   className="object-cover group-hover:scale-105 transition-transform duration-300"   />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No image</div>
                  )}
                  <Badge className={`absolute top-3 left-3 text-xs border ${getTypeBadgeColor(course.course_type)} [font-family:var(--font-montserrat)]`}>
                    {course.course_type?.charAt(0).toUpperCase() + course.course_type?.slice(1)}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">

                  {/* Title & Level */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-bold text-primary-blue group-hover:text-accent-teal transition-colors line-clamp-2 [font-family:var(--font-montserrat)]">{course.title}</h3>
                    <Badge variant="outline" className={`text-xs shrink-0 ${getLevelBadgeColor(course.level)} [font-family:var(--font-montserrat)]`}>{course.level}</Badge>
                  </div>

                  {/* Excerpt */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1 [font-family:var(--font-lato)]">{course.excerpt}</p>

                  {/* Meta Info */}
                  <div className="space-y-2 mb-4 text-sm text-gray-600 [font-family:var(--font-lato)]">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span>{course.start_date ? new Date(course.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      <span>{course.duration}</span>
                    </div>
                    {course.status==="published"?<div className="flex items-center gap-2">
                      <Users size={14} className="text-gray-400" />
                      <span>Enrollment available</span>
                      </div>
                    :null}
                  </div>

                  {/* Instructor */}
                  <div className="flex items-center gap-2 mb-4 bg-gray-50 p-4 border-b border-border">
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 ">
                          {course.instructor.image? (
                            <Image
                              src={course.instructor.image}
                              alt={course.instructor.name}
                              width={96}

                              height={96}
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-primary-blue-light flex items-center justify-center text-primary-blue text-2xl font-bold">
                              {course.instructor.name?.charAt(0)}
                            </div>
                          )}
                        </div>
                    <span className="text-sm text-gray-700 [font-family:var(--font-lato)]">{course.instructor?.name || 'TBA'}</span>
                  </div>

                  {/* Footer: Price + CTA */}
                  <div className="flex items-center justify-between pt-2 mt-auto">
                    <div>
                      <span className="text-xl font-bold text-primary-blue [font-family:var(--font-montserrat)]">{course.price ? `${course.price} ${course.currency}` : 'Contact for pricing'}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => {
                        setIsModalOpen(true)
                        setSubmitMessage('');
                        setSelectedTraining({
                          id: course.id,
                          title: course.title,
                        })
                      }} size="sm" className="bg-[#101828] cursor-pointer text-white hover:bg-primary-blue/90 [font-family:var(--font-montserrat)]">Enroll</Button>
                      <Link href={`/training/${course.slug}`}>
                        <Button size="sm" variant="outline" className="cursor-pointer [font-family:var(--font-montserrat)]">Details <ChevronRight size={16} className="ml-1" /></Button>
                      </Link>
                    </div>
                  </div>

                </div>
              </Card>
            );
          })}
        </div>

        {/* Loading - اختياري: لو عايز تضيفه، هتحتاج Server Actions */}
        {/* Empty State */}
        {(!courses || courses.length === 0) && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🎓</div>
            <p className="text-gray-700 font-semibold mb-2 [font-family:var(--font-montserrat)]">No courses found</p>
            <p className="text-gray-500 text-sm mb-6 [font-family:var(--font-lato)]">Try adjusting your search terms or filters.</p>
            <Button variant="outline" onClick={handleClearFilters} className="[font-family:var(--font-montserrat)]">Clear All Filters</Button>
          </div>
        )}





      </main>

      {/* ✅ Contact Modal */}
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
              {/* Name (full width) */}
              <div className="sm:col-span-2 ">
                <div className="flex items-center gap-2 mb-2 sm:col-span-2">
                  <label className="block mb-1 text-sm font-medium text-gray-300">Training Name :</label>
                  <input
                    type="text"
                    name="Training Name"
                    value={selectedTraining?.title || ''}
                    className={`w-1/2 mb-2 px-4 py-2 rounded-lg bg-[#0f172a] border ${errors.name ? "border-red-500" : "border-gray-700"
                      } focus:ring-2 focus:ring-cyan-400`}
                    readOnly
                    placeholder="Training Name"

                  />
                </div>
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
                  <p className={`mb-2 text-xl ${submitMessage.includes('successfully') ? 'text-emerald-300' : 'text-red-300'}`}>
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
