"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const slides = [
  "/slider1.png",
  "/slider2.jpg",
  "/slider3.webp",
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [loaded] = useState(true); // animation state (no setState-in-effect)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="hero-section"
      className="relative w-full overflow-hidden min-h-screen pt-16"
    >
      {/* Images */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === current ? "opacity-100" : "opacity-0"
            }`}
        >
          <Image
            src={slide}
            alt={`Hero slide ${index + 1}`}
            fill
            priority={index === 0}
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-4rem)] flex-col justify-center items-center text-center text-white px-4">

        {/* 🔹 Logo */}
        <div
          className={`rounded-full shadow-2xl p-5 backdrop-blur-sm transition-all duration-700 ease-out ${loaded
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 -translate-y-5 scale-95"
            }`}
        >
          <Image
            src="/elmotahidaLogo.png"
            alt="logo"
            width={200}
            height={200}
            className="rounded-full object-cover"
          />
        </div>

        {/* 🔹 h1 */}
        <h1
          className={`text-4xl sm:text-5xl md:text-5xl font-bold mb-4 mt-6 leading-tight transition-all duration-700 ease-out delay-300 ${loaded
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-5"
            }`}
        >
          El Motahida for artificial intelligent
        </h1>

        {/* 🔹 p */}
        <p
          className={`mb-6 text-base sm:text-lg md:text-xl max-w-2xl transition-all duration-700 ease-out delay-500 ${loaded
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-5"
            }`}
        >
          The Art Of Integrated Solutions AI Development
        </p>

        {/* 🔹 buttons */}
        <div
          className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 ease-out delay-700 ${loaded
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-5"
            }`}
        >
          <Link href="/products">
            <button className="cursor-pointer bg-cyan-400 w-full sm:w-auto px-6 py-3 rounded-md hover:bg-cyan-500 transition">
              Products
            </button>
          </Link>

          <button
            className="cursor-pointer border border-white w-full sm:w-auto px-6 py-3 rounded-md hover:bg-white hover:text-black transition"
            onClick={() => {
              document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Contact
          </button>

        </div>
      </div>

    </section>
  );
}
