'use client';

import { useState } from 'react';
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
// ✅ المكون الرئيسي لعرض تفاصيل الدورة
// ============================================================================
export default function WebinarDetails({ webinar }) {

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
 

 

  const getCourseEnrollmentId = (item) => `training-${item?._id || item?.slug?.current || item?.slug || item?.title}`;

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

  if (!webinar) {
    return <div className="min-h-screen flex items-center justify-center">Loading course...</div>;
  }

  // ✅ تجهيز روابط الصور (باستخدام الرابط مباشرة من الـ Query)


  

  const onSubmit = async (data) => {
  

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('phone', data.phone || '');
    formData.append('nationality', data.nationality || '');
    formData.append('id_number', data.id_number || '');
    formData.append('job_position', data.job_position || '');
    formData.append('message', data.message || '');
    formData.append('form_type', 'webinar');
    formData.append('related_item_title', webinar.title || '');
    formData.append('page_url', window.location.href);

    if (/^\d+$/.test(String(webinar.id))) {
      formData.append('related_item_id', webinar.id);
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
  const courseEnrollmentId = getCourseEnrollmentId(webinar);
  // ✅ تنسيق التاريخ
  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  };
  return (
    <div className={`w-full min-h-screen bg-white ${montserrat.variable} ${lato.variable}`}>

      {/* ✅ Breadcrumb + Hero Image */}
      <section
        className="relative h-150 md:h-100 flex items-end justify-center"
        style={{
          backgroundImage: `url(${getImageUrl(webinar.main_image)})`, backgroundPosition: 'center' ,backgroundRepeat: 'no-repeat',backgroundSize: 'cover' 
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>

        {/* Back Button */}
        <div className="absolute top-30 left-4 ">
          <Link
            href="/webinars"
            className="text-white/90 hover:text-white font-medium flex items-center gap-2 px-4 py-2 rounded-lg bg-black/30 backdrop-blur-sm [font-family:var(--font-lato)]"
          >
            <ArrowLeft size={18} /> Back to webinars
          </Link>
        </div>

        {/* Hero Content */}
        <div className="relative  text-center px-4 pb-8 max-w-4xl">
            {webinar?.is_recorded && <Badge className="bg-blue-100 text-blue-700 text-xs">Recorded</Badge>}
            <Badge variant="outline" className={` [font-family:var(--font-montserrat)]  text-white `}>
              {webinar.status?.charAt(0).toUpperCase() + webinar.status?.slice(1)}
            </Badge>
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight [font-family:var(--font-montserrat)]">
            {webinar.title}
          </h1>
          <p className="text-lg text-white/90 [font-family:var(--font-lato)]">
            {webinar.excerpt}
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
                  <span className="[font-family:var(--font-lato)]">{webinar.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe size={18} className="text-gray-400" />
                  <span className="[font-family:var(--font-lato)]">{webinar.language || 'English'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={18} className="text-gray-400" />
                  <span className="text-sm [font-family:var(--font-lato)]">{formatDate(webinar?.date)} {webinar?.time && `• ${webinar.time}`}</span>
                </div>
               
              </div>

              

              {/* Tab Content */}
              <div className="py-6 [font-family:var(--font-lato)]">


                
                  <div className="prose prose-lg max-w-none">

                    {/* speakers */}
                    {webinar.speakers && (
                      <div className="flex flex-col md:flex-row gap-6 mb-10 p-6 bg-gray-50 rounded-lg">
                        <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 ring-4 ring-primary-blue/10">
                          {webinar.speakers.image? (
                            <Image
                              src={getImageUrl(webinar.speakers.image)}
                              alt={webinar.speakers.name}
                              width={96}

                              height={96}
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-primary-blue-light flex items-center justify-center text-primary-blue text-2xl font-bold">
                              {webinar.speakers.name?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-primary-blue mb-1 [font-family:var(--font-montserrat)]">
                            {webinar.speakers.name}
                          </h4>
                          <p className="text-accent-teal font-medium mb-3 [font-family:var(--font-montserrat)]">
                            {webinar.speakers.title || 'speakers'}
                          </p>
                          <p className="text-gray-600 mb-4 [font-family:var(--font-lato)]">
                            {webinar.speakers.bio || 'No bio available.'}
                          </p>
                          
                        </div>
                      </div>
                    )}

                    {/* Full Description (HTML من CKEditor) */}
                    <div className="prose prose-lg max-w-none">
                      <PortableText value={webinar.full_description} components={CourseportableTextComponents} />
                    </div>

                  </div>
                

              



              </div>

            
            </div>

            {/* Right: Sticky Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">

                {/* Price Card */}
                <Card className="p-6 border-2 border-primary-blue/20">
                  


                  <Button onClick={() => {
                    
                    setIsModalOpen(true)
                    setSubmitMessage('');
                    setSelectedTraining({
                      id: courseEnrollmentId,
                      title: webinar.title || '',
                    })
                  }
                  }
                    
                    className=" cursor-pointer w-full bg-[#101828] hover:bg-primary-blue/90 text-white py-3 disabled:cursor-not-allowed disabled:bg-gray-400 [font-family:var(--font-montserrat)]">
                    Enroll Now
                  </Button>





                </Card>

              
              </div>
            </aside>

          </div>
        </div >
      </header >
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
                                value={selectedTraining?.title || webinar?.title || ''}
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
    </div >
  );
}
