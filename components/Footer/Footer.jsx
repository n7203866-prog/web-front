"use client";

import Link from "next/link";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">

        {/* Logo + About */}
        <div>
          <Image
            src="/elmotahidaLogo.png"
            alt="El Motahida Logo"
            width={110}
            height={50}
            className="pb-3"
          />
          <h2 className="text-2xl font-bold text-white mb-4">
            EL Motahida <span className="text-cyan-400">.</span>
          </h2>
          <p className="text-sm leading-relaxed">
            The Art Of Integrated Solutions <br /> AI Development </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-white font-semibold mb-4">Links</h3>
          <ul className="space-y-2">
            <li><Link href="/">Main</Link></li>
            <li><Link href="/products">Products</Link></li>
            <li><Link href="/training">Courses</Link></li>
            <li><Link href="/webinars">Webinars</Link></li>
            <li><Link href="/blog">Blog</Link></li>

          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-white font-semibold mb-4">We Offer</h3>
          <ul className="space-y-2">
            <li>Forensic Solutions</li>
            <li>Security Solutions</li>
            <li>Case Examinations</li>
            <li>Training</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-semibold mb-4">Contact</h3>
          <p className="text-sm">Email: info@elmotahida.net</p>
          <p className="text-sm">Phone: +201024280018</p>

          {/* Social Icons */}
          <div className="flex gap-3 mt-4">
            <Link href="https://www.facebook.com/elmotahida.official" target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-cyan-400 hover:text-white transition">
              <FaFacebookF />
            </Link>
            {/* <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-cyan-400 hover:text-white transition">
              <FaTwitter />
            </Link> */}
            <Link href="https://www.instagram.com/elmotahida2002/" target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-cyan-400 hover:text-white transition">
              <FaInstagram />
            </Link>
            <Link href="https://www.linkedin.com/company/el-motahida/" target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-cyan-400 hover:text-white transition">
              <FaLinkedinIn />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-700 mt-10 pt-4 text-center text-sm">
        © {new Date().getFullYear()} El Motahida For Artificial Intelligent. All rights reserved.
      </div>
    </footer>


  );
}