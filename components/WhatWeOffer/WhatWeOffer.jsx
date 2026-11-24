"use client";

import { useEffect, useState } from "react";
import { FaCode, FaMicrochip, FaCogs, FaGraduationCap } from "react-icons/fa";

export default function WhatWeOffer() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById("offer-section");
      if (!section) return;

      const top = section.getBoundingClientRect().top;
      if (top < window.innerHeight - 100) {
        setVisible(true);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      id="offer-section"
      className="bg-white py-20"
    >
      <hr className="pb-20 w-3/4 mx-auto border-black" />

      <div className="max-w-7xl mx-auto px-4">

        {/* Title */}
        <div
          className={`text-center mb-14 transition-all duration-700 ${visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
            }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What We Offer
          </h2>
          <p className=" max-w-2xl mx-auto">
            Harnessing cutting-edge technology to solve complex business challenges
            with precision and scale.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Card 1 */}
          <div
            className={`bg-[#1e2a3d] rounded-2xl text-white p-8 transition-all duration-700 delay-100 hover:-translate-y-2 hover:shadow-xl ${visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
              }`}
          >
            <FaCode className="text-cyan-400 text-2xl mb-4" />
            <h3 className="text-2xl font-semibold mb-4">Forensic Solutions</h3>
            <p className="text-gray-400 mb-6">

              Tailored forensic solutions, investigative tools, and digital analysis systems
              designed for accuracy and seamless intelligence.
            </p>
          </div>

          {/* Card 2 */}
          <div
            className={`bg-linear-to-r from-blue-600 text-white to-cyan-500 rounded-2xl p-8 flex flex-col justify-between transition-all duration-700 delay-200 hover:-translate-y-2 hover:shadow-xl ${visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
              }`}
          >
            <div>
              <FaMicrochip className="text-white text-2xl mb-4" />
              <h3 className="text-2xl font-semibold mb-4">Security Solutions</h3>
              <p className="text-white/80">
                Custom security solutions, surveillance systems,
                and protection technologies built for reliability and real-time defense.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div
            className={`bg-[#1e2a3d] rounded-2xl text-white p-8 transition-all duration-700 delay-300 hover:-translate-y-2 hover:shadow-xl ${visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
              }`}
          >
            <FaCogs className="text-cyan-400 text-2xl mb-4" />
            <h3 className="text-xl font-semibold mb-4">
              Case Examinations
            </h3>
            <p className="text-gray-400">
              Advanced case examinations and structured investigations engineered for clarity,
              accuracy, and dependable results.
            </p>
          </div>

          {/* Card 4 */}
          <div
            className={`bg-[#1e2a3d] rounded-2xl text-white p-8 transition-all duration-700 delay-500 hover:-translate-y-2 hover:shadow-xl ${visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
              }`}
          >
            <FaGraduationCap className="text-cyan-400 text-2xl mb-4" />
            <h3 className="text-xl font-semibold mb-3">
              Training
            </h3>
            <p className="text-gray-400">
              Comprehensive training solutions and structured learning paths built for performance,
              expertise, and continuous improvement.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}