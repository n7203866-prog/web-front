"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import { Autoplay } from "swiper/modules";
import Image from "next/image";
import { motion } from 'framer-motion';

const images = [
    "/partner1.png",
    "/partner2.png",
    "/partner3.webp",
    "/partner4.png",
    "/partner5.webp",
];

export default function ImageCarousel() {
    return (
        <section className="pt-20 ">
            <hr className="pb-20 w-3/4 mx-auto border-black" />
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-16"
            >
                <h2 className="text-5xl uppercase text-black mb-4">OUR PARTINARS</h2>
                {/* <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    We are here to build our successful Stories with valued clients
                </p> */}

                <div className="max-w-7xl mx-auto ">

                    <Swiper
                        modules={[Autoplay]}
                        loop={true}
                        freeMode={true} // 🔥 مهم جدا
                        speed={2000} // مدة الحركة (كل ما تكبر = أبطأ)
                        autoplay={{
                            delay: 1000 / 2, // 🔥 يخليه continuous
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}
                        slidesPerView={"auto"} // 🔥 يخلي العرض flexible
                        spaceBetween={30}
                        className="ease-linear!" // 🔥 يمنع التقطيع
                    >
                        {images.map((img, index) => (
                            <SwiperSlide key={index} className="w-75! py-5">
                                <div className="relative  w-full h-65 rounded-2xl overflow-hidden shadow-xl">
                                    <Image
                                        src={img}
                                        alt={`image-${index}`}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                </div>
            </motion.div>
        </section>
    );
}