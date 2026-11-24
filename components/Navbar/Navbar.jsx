"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import GTranslate from '@/components/GTranslate/GTranslate';


const NAV_ITEMS = [
  { href: "/", label: "Main" },
  { href: "/products", label: "Products" },
  { href: "/training", label: "Courses" }, // ✅ مسار مطلق صحيح
  { href: "/webinars", label: "Webinars" },
  { href: "/blog", label: "Blogs" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true); // 👈 جديد

  useEffect(() => {
    const handleScroll = () => {
      const hero = document.getElementById("hero-section");

      if (!hero) {
        setScrolled(window.scrollY > 50);
        setShowNavbar(true);
        return;
      }

      const heroBottom = hero.getBoundingClientRect().bottom;

      // 👇 نفس القديم (تغيير اللون)
      setScrolled(heroBottom <= 64);

      // 👇 الجديد (إخفاء وإظهار)
      if (window.scrollY === 0) {
        setShowNavbar(true); // فوق خالص يظهر
      } else if (heroBottom > 64) {
        setShowNavbar(false); // جوه الهيرو → اختفى
      } else {
        setShowNavbar(true); // بعد الهيرو → يظهر
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full h-30 z-30 transition-all  duration-500 ${showNavbar ? "translate-y-0" : "-translate-y-full"
        } ${scrolled
          ? "bg-white/95 text-black shadow-md backdrop-blur"
          : "bg-transparent text-white"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between  items-center h-full">


        <Link href={'/'}>
          <Image
                      src="/elmotahidaLogo.png"
                      alt="logo"
                      width={75}
                      height={75}
                      className="rounded-full object-cover"
                    />
        </Link>

        <ul className="hidden md:flex flex-1 justify-center items-center gap-6 lg:gap-8">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <Link href={item.href} className="hover:text-cyan-400 transition-colors">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex m-4 items-center gap-5 text-lg shrink-0">
          <Link href="https://www.facebook.com/elmotahida.official" target="_blank" rel="noopener noreferrer">
            <FaFacebookF />
          </Link>
          {/* <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <FaTwitter />
          </Link> */}
          <Link href="https://www.linkedin.com/company/el-motahida/" target="_blank" rel="noopener noreferrer">
            <FaLinkedin />
          </Link>
          <Link href="https://www.instagram.com/elmotahida2002/" target="_blank" rel="noopener noreferrer">
            <FaInstagram />
          </Link>
          
        </div>
            <GTranslate />

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden cursor-pointer p-2 rounded-md hover:bg-white/10"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden absolute left-0 right-0 top-16 bg-black/85 text-white">
          <ul className="flex flex-col gap-4 px-6 py-5">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <Link href={item.href} onClick={() => setMenuOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
             
          </ul>
          
        </div>
      )}
    </nav>
  );
}
