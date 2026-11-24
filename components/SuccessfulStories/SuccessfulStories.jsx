"use client";

import Image from "next/image";
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { motion } from "framer-motion";

const DEFAULT_TESTIMONIALS = [];

const getImageUrl = (image) => {
  if (!image) return null;
  if (typeof image === "string") return image;
  if (typeof image.src === "string") return image.src;
  if (typeof image.asset?.url === "string") return image.asset.url;
  if (typeof image.url === "string") return image.url;
  return null;
};

export default function SuccessfulStories({ testimonials = [] }) {
  const stories = Array.isArray(testimonials) && testimonials.length > 0
    ? testimonials
    : DEFAULT_TESTIMONIALS;

  const cardVariants = {
    hidden: { opacity: 0, y: 80 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: { delay: index * 0.2, duration: 0.8, ease: "easeOut" },
    }),
  };

  return (
    <section className="bg-slate-950 py-24 px-6">
      <div className="border-b border-slate-200 pb-12">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h2 className="text-5xl uppercase text-white mb-4">Our Successful Stories</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              We are here to build our successful stories with valued clients.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-12">
        <div className="grid gap-8 md:grid-cols-3">
          {stories.map((item, index) => {
            const authorName = item.authorName || item.author_name || "Unknown";
            const authorTitle = item.authorTitle || item.author_title || "Valued Client";
            const imageUrl = getImageUrl(item.authorImage || item.author_image);
            const href = item.page_url || item.link || item.url || '#';
            const isExternal = /^https?:\/\//.test(href);

            return (
              <motion.div
                key={item._id || item.id || index}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="group rounded-[32px] border border-slate-200 bg-white text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                {isExternal ? (
                  
                    <Card className="h-full overflow-hidden rounded-[32px] bg-transparent border-0 shadow-none">
                      <div className="flex h-full flex-col">
                        <div className="relative h-64 bg-slate-900/90">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={authorName || 'testimonial image'}
                              fill
                              unoptimized
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 100vw"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-sm text-slate-400">
                              No image available
                            </div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col justify-between p-6 md:p-8">
                          <div>
                            <p className="text-gray-300 mb-6 leading-relaxed">{item.quote}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                 
                ) : (
                  <Link href={authorName} className="block h-full">
                    <Card className="h-160  rounded-[32px] bg-transparent border-0 shadow-none">
                      <div className="flex h-full flex-col">
                        <div className="relative h-64 bg-slate-900/90">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={authorName || 'testimonial image'}
                              fill
                              unoptimized
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 100vw"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-sm text-slate-400">
                              No image available
                            </div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col overflow-hidden justify-between p-6 md:p-8">
                          <div>
                            <p className="text-black mb-6 leading-relaxed">{item.quote}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
