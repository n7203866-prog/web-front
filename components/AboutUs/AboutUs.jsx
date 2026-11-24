"use client";

import Image from 'next/image';
import { motion } from "framer-motion";

export default function AboutUs() {

  return (
    <section className="p-20 pb-0 bg-white">

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8 }}
        className="text-5xl uppercase text-center text-black mb-4 pb-10"
      >
        Who We Are
      </motion.h3>

      <div className='grid md:grid-cols-2 md:py-10 items-center'>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1 }}
          className="max-w-3xl mx-auto lg:px-15"
        >
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-4">
            El Motahida Companies it&apos;s Egyptian companies founded in 2002,
            and located in Cairo, Egypt. Our companies operate across Egypt,
            the Middle East and Africa… also through our scientific research
            Lab and various partnerships with global collaborators, we can offer
            state-of-the-art solutions. We also provide technical support, training
            and consulting services in our working areas of expertise.
          </p>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8">
            Our MAI Brand has become a trusted manufacturer of reliable
            forensic software & integrated equipment, and tools to help solve
            various crimes, training and consulting services in the field of information
            technology and forensic investigation.
          </p>
        </motion.div>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1 }}
          className="mx-auto pt-15"
        >
          <Image
            src={"/elmotahidaLogo.png"}
            width={200}
            height={200}
            alt="logo"
          />
        </motion.div>

      </div>

    </section>
  );
}