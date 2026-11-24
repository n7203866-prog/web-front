'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaFacebook, FaPinterest, FaLinkedin, FaWhatsapp, FaLink, FaPrint } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
// ✅ حذفنا استيراد urlFor - مش محتاجينه هنا
import { useForm } from "react-hook-form";
import { PortableText } from '@portabletext/react';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { portableTextToHtml } from "@/lib/portableTextRenderer";
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


export default function ProductContent({ product }) {
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");

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

  formData.append(
    "related_item_title",
    product.name || product.title || selectedProduct || ""
  );

  if (product.id || product._id) {
    formData.append(
      "related_item_id",
      product.id || product._id
    );
  }

  formData.append("page_url", window.location.href);

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
      setSubmitStatus({
        success: false,
        message:
          result.error ||
          result.message ||
          "Failed to send inquiry",
      });

      return;
    }

    setSubmitStatus({
      success: true,
      message:
        result.message ||
        "Inquiry sent successfully ✅",
    });

    reset();

    setTimeout(() => {
      setIsModalOpen(false);
    }, 1200);

  } catch (error) {
    console.error(error);

    setSubmitStatus({
      success: false,
      message: "Server connection error",
    });

  } finally {
    setIsSending(false);
  }
};
  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Loading product...</div>;
  }


  const allImages = [
    product.mainImage,
    ...(product.images || []),
  ].filter((img) => !!img?.asset?.url);

  const mainImage = allImages[mainImageIndex];

  const mainImageUrl = mainImage?.asset?.url || '/product-placeholder.jpg';

  const imageUrls = allImages
    .map((img) => img.asset?.url || null)
    .filter((url) => url);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Check this product: ${product.name}`;

  // ✅ دوال المشاركة
  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };


  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
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
  // ✅ دالة الطباعة


  return (
    <>
      {/* Hero Spacer */}
      <nav className="bg-[#101828] pt-30 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/products"
            className="text-white hover:text-primary-blue font-medium flex items-center gap-2 [font-family:var(--font-lato)]"
          >
            <ArrowLeft size={18} />
            Back to Products
          </Link>
        </div>
      </nav>

      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 md:gap-12">

          {/* LEFT: Image Gallery */}
          <div>
            {/* Main Image */}
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg min-h-100 flex items-center justify-center">
              <div className="relative w-full h-75 md:h-100">
                <Image
                  src={mainImageUrl}
                  alt={mainImage?.alt || product.name}
                  unoptimized
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 700px) 100vw, 50vw"
                />
              </div>
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex flex-wrap gap-3 mt-4 overflow-x-auto pb-2">
                {allImages.map((img, index) => {
                  // ✅ استخدم الرابط مباشرة للـ thumbnail مع بارامترز بسيطة
                  const thumbUrl = img.asset?.url
                    ? `${img.asset.url}?w=150&h=150&fit=crop`
                    : '/product-placeholder.jpg';
                  return (
                    <div
                      key={index}
                      onClick={() => setMainImageIndex(index)}
                      className={`border-2 rounded-lg p-1 cursor-pointer shrink-0 transition-all ${mainImageIndex === index
                        ? 'border-accent-teal shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="relative w-16 h-16 md:w-20 md:h-20">
                        <Image
                          src={thumbUrl}
                          unoptimized
                          alt={img.alt || `Thumbnail ${index + 1}`}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Product Info */}
          <div>
            {/* Category Badge */}
            {product.category?.title && (
              <span className="inline-block px-3 py-1 bg-accent-teal/10 text-accent-teal text-sm font-semibold rounded-full mb-3">
                {product.category.title}
              </span>
            )}

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-primary-blue mb-4">
              {product.name}
              {product.isFeatured && (
                <span className="ml-2 px-2 py-1 bg-amber-500 text-white text-xs rounded">Featured</span>
              )}
            </h2>

            {/* Price */}
            {product.price && (
              <p className="text-xl font-bold text-primary-blue mb-4">
                {product.price}
              </p>
            )}

            {/* Description */}
            <div className="text-gray-700 mb-6 leading-relaxed">
              <div className="prose prose-lg max-w-none">
              <PortableText value={product.full_description} components={portableTextComponents} />
            </div>
            </div>

            {/* Features */}
            {product.features?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-primary-blue mb-3">Key Features</h3>
                <ul className="space-y-3">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <span className="text-accent-teal mt-1">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specifications */}
            {product.specifications?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-primary-blue mb-3">Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.specifications.map((spec, i) => (
                    <div key={i} className="p-3 bg-white rounded-lg border border-border">
                      <p className="text-xs font-medium text-gray-500">{spec.label}</p>
                      <p className="text-sm font-semibold text-gray-900">{spec.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Brand */}
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm text-gray-500 uppercase tracking-wide">Brand</p>
              <p className="text-lg font-semibold text-primary-blue">{product.brand}</p>
            </div>

            {/* Share + Actions */}
            <div className="mt-6 border rounded-xl flex items-center gap-4 bg-white p-4 md:p-5 flex-wrap shadow-sm">
              <span className="font-bold text-lg text-gray-700">Share:</span>

              <FaFacebook onClick={shareOnFacebook} className="cursor-pointer hover:text-[#1877F2] transition-colors" size={22} aria-label="Share on Facebook" />
              <FaLinkedin onClick={shareOnLinkedIn} className="cursor-pointer hover:text-[#0A66C2] transition-colors" size={22} aria-label="Share on LinkedIn" />
              <FaWhatsapp onClick={shareOnWhatsApp} className="cursor-pointer hover:text-[#25D366] transition-colors" size={22} aria-label="Share on WhatsApp" />

              
              {/* Copy Link */}
              <div onClick={copyLink} className="flex items-center gap-2 cursor-pointer hover:text-accent-teal transition-colors">
                <FaLink size={18} />
                <span className="text-sm font-medium">
                  {copied ? 'Copied!' : 'Copy Link'}
                </span>
              </div>
            </div>
            <div className='mt-8'>

              <Button onClick={() => {
                setIsModalOpen(true)
                setSelectedProduct(product.name || product.title || '')
                setSelectedProductId(product.id);
              }} className="cursor-pointer text-2xl w-full py-7 bg-[#101828] hover:bg-cyan-700 text-white [font-family:var(--font-montserrat)]">Contact</Button>
            </div>

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
                        <label className="block mb-1 text-sm font-medium text-gray-300">Product Name :</label>
                        <input
                          type="text"
                          name="Product Name"
                          value={selectedProduct}
                          className={`w-1/2 mb-2 px-4 py-2 rounded-lg bg-[#0f172a] border ${errors.name ? "border-red-500" : "border-gray-700"
                            } focus:ring-2 focus:ring-cyan-400`}
                          readOnly
                          placeholder="Product Name"

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
                        {...register("file_upload")}
                        className="w-full px-4 py-2 rounded-lg bg-[#0f172a] border border-gray-700 text-white"
                      />
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
  <p
    className={`mb-2 text-sm ${
      submitStatus.success
        ? "text-emerald-300"
        : "text-red-300"
    }`}
  >
    {submitStatus.message}
  </p>
)}
                      <button
                        type="submit"
                        disabled={isSending || isSubmitting}
                        className="w-full cursor-pointer bg-cyan-400 text-black py-3 rounded-lg font-semibold hover:bg-cyan-500 transition disabled:opacity-50"
                      >
                        {isSending || isSubmitting
  ? "Sending..."
  : "Send"}
                      </button>
                    </div>
                  </form>

                </div>
              </div>
            )}
          </div>


        </div >
      </section >

    </>
  );
}
