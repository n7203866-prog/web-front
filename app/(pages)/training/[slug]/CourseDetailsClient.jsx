'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PortableText } from '@portabletext/react';

import {
  Calendar, Clock, Globe, Users, Star, CheckCircle,
  ChevronDown, ChevronUp, Share2, Bookmark, ArrowLeft,
  Play, FileText, Award, Shield, MessageCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// ✅ حذفنا استيراد urlFor - مش محتاجينه هنا

// ✅ استيراد الخطوط
import { Montserrat, Lato } from 'next/font/google';

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useEnrollment from '@/hooks/useEnrollment';
import { getImageUrl } from '@/lib/api';
// ✅ FIX #6: Import file validation utilities
import { validateFileForUpload, formatFileSize, getFileValidationErrorMessage } from '@/lib/fileValidation';
import { useDebounce } from '@/lib/debounce';

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

// ============================================================================
// ✅ مكون الأسئلة الشائعة (Accordion)
// ============================================================================

// ============================================================================
// ✅ مكون التبويبات
// ============================================================================
function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap [font-family:var(--font-montserrat)] ${active
        ? 'border-accent-teal text-black'
        : 'border-transparent text-gray-500 hover:text-primary-blue'
        }`}
    >
      {children}
    </button>
  );
}

// ============================================================================
// ✅ المكون الرئيسي لعرض تفاصيل الدورة
// ============================================================================
export default function CourseDetailsClient({ course }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [openFAQ, setOpenFAQ] = useState(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [submitMessage, setSubmitMessage] = useState('');
  


  // ============================================================================
// ✅ مكونات عرض المحتوى الغني (Portable Text) - زي مقال JetBrains
// ============================================================================
const CourseportableTextComponents = {
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

  const getCourseEnrollmentId = (item) => `training-${item?._id || item?.slug?.current || item?.slug || item?.title}`;
  const { enrollItem } = useEnrollment();
    const { register, watch, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(schema),
  });


  const selectedFile = watch("file_upload");
  const [fileValidationError, setFileValidationError] = useState('');
  const [submitError, setSubmitError] = useState('');

  // ✅ FIX #6: Memoize file validation to prevent unnecessary re-renders
  const validateFile = useCallback(async () => {
    setFileValidationError('');
    
    if (!selectedFile?.[0]) {
      return; // File is optional
    }

    try {
      const validationResult = await validateFileForUpload(selectedFile[0]);
      
      if (!validationResult.valid) {
        setFileValidationError(getFileValidationErrorMessage(validationResult.error || ''));
      }
    } catch (error) {
      setFileValidationError('Error validating file. Please try another file.');
      console.error('File validation error:', error);
    }
  }, [selectedFile]);

  // ✅ FIX #6: Debounce file validation to prevent excessive validation calls
  const debouncedValidateFile = useDebounce(validateFile, 300);

  // Re-validate file when it changes
  useEffect(() => {
    debouncedValidateFile();
  }, [selectedFile, debouncedValidateFile]);

  const onSubmit = async (data) => {
    // Validate file before submission if present
    if (data.file_upload?.[0]) {
      const validationResult = await validateFileForUpload(data.file_upload[0]);
      if (!validationResult.valid) {
        setSubmitError(getFileValidationErrorMessage(validationResult.error || ''));
        return;
      }
    }

    const trainingId = getCourseEnrollmentId(course);
    const formData = new FormData();

    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('phone', data.phone || '');
    formData.append('nationality', data.nationality || '');
    formData.append('id_number', data.id_number || '');
    formData.append('job_position', data.job_position || '');
    formData.append('message', data.message || '');
    formData.append('form_type', 'training');
    formData.append('related_item_title', selectedTraining?.title || course?.title || '');
    if (course?.id) formData.append('related_item_id', course.id);
    formData.append('page_url', window.location.href);

    if (data.file_upload?.[0]) {
      formData.append('file_upload', data.file_upload[0]);
    }

    try {
      setSubmitError('');
      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || errorData.message || 'Submission failed');
      }

      setSubmitMessage('✅ Enrollment submitted successfully. We will contact you soon!');
      enrollItem(trainingId);
      reset();
      
      // Auto-close modal after 3 seconds
      setTimeout(() => {
        setIsModalOpen(false);
      }, 3000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to submit. Please try again.');
      console.error('Enrollment submission error:', error);
    }
  };
  const courseEnrollmentId = getCourseEnrollmentId(course);
  const galleryImages = course.gallery_images || [];
  return (
    <div className={`w-full min-h-screen bg-white ${montserrat.variable} ${lato.variable}`}>

      {/* ✅ Breadcrumb + Hero Image */}
      <section
        className="relative h-150 md:h-100 flex items-end justify-center"
        style={{
          backgroundImage: `url(${getImageUrl(course.main_image)})`, backgroundPosition: 'center' ,backgroundRepeat: 'no-repeat',backgroundSize: 'cover' 
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>

        {/* Back Button */}
        <div className="absolute top-30 left-4 ">
          <Link
            href="/training"
            className="text-white/90 hover:text-white font-medium flex items-center gap-2 px-4 py-2 rounded-lg bg-black/30 backdrop-blur-sm [font-family:var(--font-lato)]"
          >
            <ArrowLeft size={18} /> Back to Courses
          </Link>
        </div>

        {/* Hero Content */}
        <div className="relative  text-center px-4 pb-8 max-w-4xl">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            
            <Badge variant="outline" className={`${getTypeBadgeColor(course.course_type)} [font-family:var(--font-montserrat)]`}>
              {course.course_type?.charAt(0).toUpperCase() + course.course_type?.slice(1)}
            </Badge>
            <Badge variant="outline" className={`${getLevelBadgeColor(course.level)} [font-family:var(--font-montserrat)]`}>
              {course.level?.charAt(0).toUpperCase() + course.level?.slice(1)}
            </Badge>
            {course.certificate && (
              <Badge variant="outline" className="border-white text-white [font-family:var(--font-montserrat)]">
                <Award size={12} className="mr-1" /> Certificate
              </Badge>
            )}
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight [font-family:var(--font-montserrat)]">
            {course.title}
          </h1>
          <p className="text-lg text-white/90 [font-family:var(--font-lato)]">
            {course.excerpt}
          </p>
        </div>
      </section>

      {/*  Main Content */}
      <header className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left: Content */}
            <div className="lg:col-span-2">

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={18} className="text-gray-400" />
                  <span className="[font-family:var(--font-lato)]">{course.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe size={18} className="text-gray-400" />
                  <span className="[font-family:var(--font-lato)]">{course.language || 'English'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={18} className="text-gray-400" />
                  <span>{course.start_date ? new Date(course.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'}</span>
                </div>
               
              </div>

              {/* Tabs Navigation */}
              <div className="border-b border-border overflow-x-auto">
                <div className="flex gap-1 min-w-max">
                  <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Overview</TabButton>
                  <TabButton active={activeTab === 'curriculum'} onClick={() => setActiveTab('curriculum')}>Curriculum</TabButton>
                  <TabButton active={activeTab === 'requirements'} onClick={() => setActiveTab('requirements')}>Requirements</TabButton>
                  {course.faqs?.length > 0 && (
                    <TabButton active={activeTab === 'faq'} onClick={() => setActiveTab('faq')}>FAQ</TabButton>
                  )}
                  {course.testimonials?.length > 0 && (
                    <TabButton active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')}>Reviews</TabButton>
                  )}
                </div>
              </div>

              {/* Tab Content */}
              <div className="py-6 [font-family:var(--font-lato)]">

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="prose prose-lg max-w-none">

                    {/* Instructor */}
                    {course.instructor && (
                      <div className="flex flex-col md:flex-row gap-6 mb-10 p-6 bg-gray-50 rounded-lg">
                        <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 ring-4 ring-primary-blue/10">
                          {course.instructor.image? (
                            <Image
                              src={getImageUrl(course.instructor.image)}
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
                        <div>
                          <h4 className="text-xl font-bold text-primary-blue mb-1 [font-family:var(--font-montserrat)]">
                            {course.instructor.name}
                          </h4>
                          <p className="text-accent-teal font-medium mb-3 [font-family:var(--font-montserrat)]">
                            {course.instructor.title || 'Instructor'}
                          </p>
                          <p className="text-gray-600 mb-4 [font-family:var(--font-lato)]">
                            {course.instructor.bio || 'No bio available.'}
                          </p>
                          {course.instructor.credentials?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {course.instructor.credentials.map((cred, idx) => (
                                <Badge key={idx} variant="outline" className="[font-family:var(--font-montserrat)]">
                                  {cred}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Full Description (HTML من CKEditor) */}
                    <div className="prose prose-lg max-w-none">
                      <PortableText value={course.full_description} components={CourseportableTextComponents} />
                    </div>

                  </div>
                )}

                {/* Curriculum Tab */}
                {activeTab === 'curriculum' &&  (
                  <div className="space-y-6">
                    <PortableText value={course.curriculum} components={CourseportableTextComponents} />
                  </div>
                )}

                {/* Requirements Tab */}
                {activeTab === 'requirements' && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-primary-blue [font-family:var(--font-montserrat)]">Prerequisites</h4>
                      <PortableText value={course.requirements} components={CourseportableTextComponents} />


                    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-amber-800 [font-family:var(--font-lato)]">
                        <strong>Note:</strong> Participants should have a computer with stable internet connection and be able to install required software prior to the course. Detailed setup instructions will be provided upon enrollment.
                      </p>
                    </div>
                  </div>
                )}




              </div>

              {/* Gallery Section */}
              {galleryImages.length > 0 && (
                <section className="py-12 border-t border-border">
                  <h3 className="text-xl font-bold text-primary-blue mb-6 text-center [font-family:var(--font-montserrat)]">
                    Course Preview
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    {galleryImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-video rounded-lg overflow-hidden group">
                        {img.url ? (
                          <Image
                            src={img.url}
                            alt={img.alt || `Preview ${idx + 1}`}
                            fill
                            unoptimized
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No image</div>
                        )}
                        {img.caption && (
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                            <p className="text-white text-xs">{img.caption}</p>
                          </div>
                        )}
                        {idx === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center">

                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

            </div>

            {/* Right: Sticky Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">

                {/* Price Card */}
                <Card className="p-6 border-2 border-primary-blue/20">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-bold text-primary-blue [font-family:var(--font-montserrat)]">
                      {course.price || 'Contact for pricing'}
                    </span>
                    {course.originalPrice && (
                      <span className="text-lg text-gray-400 line-through">
                        {course.originalPrice}
                      </span>
                    )}
                  </div>


                  <Button onClick={() => {
                    
                    setIsModalOpen(true)
                    setSubmitMessage('');
                    setSelectedTraining({
                      id: courseEnrollmentId,
                      title: course.title || '',
                    })
                  }
                  }
                    
                    className=" cursor-pointer w-full bg-[#101828] hover:bg-primary-blue/90 text-white py-3 disabled:cursor-not-allowed disabled:bg-gray-400 [font-family:var(--font-montserrat)]">
                    Enroll Now
                  </Button>


                </Card>

                {/* Quick Facts */}
                <Card className="p-6">
                  <h4 className="font-bold text-primary-blue mb-4 [font-family:var(--font-montserrat)]">
                    Quick Facts
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 [font-family:var(--font-lato)]">Duration</span>
                      <span className="font-medium [font-family:var(--font-montserrat)]">{course.duration}</span>
                    </div>
                    {course.format && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 [font-family:var(--font-lato)]">Format</span>
                        <span className="font-medium [font-family:var(--font-montserrat)]">{course.format}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 [font-family:var(--font-lato)]">Language</span>
                      <span className="font-medium [font-family:var(--font-montserrat)]">{course.language || 'English'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 [font-family:var(--font-lato)]">Level</span>
                      <span className="font-medium [font-family:var(--font-montserrat)] capitalize">{course.level}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 [font-family:var(--font-lato)]">Certificate</span>
                      <span className="font-medium text-green-600 [font-family:var(--font-montserrat)]">
                        {course.certificate ? 'Yes ✓' : 'No'}
                      </span>
                    </div>
                  </div>
                </Card>



              </div>
            </aside>
            
                  {/* ✅ Contact Modal */}
                  {isModalOpen && (
                    <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-100 px-4">
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
                                value={selectedTraining?.title || course?.title || ''}
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
        </div >
      </header >
    </div >
  );
}
