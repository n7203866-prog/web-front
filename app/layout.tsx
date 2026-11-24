import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import Footer from './../components/Footer/Footer';
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "El Motahida",
  description: "El-Motahida is a leading company specializing in providing comprehensive solutions for the construction industry. With a strong commitment to excellence and innovation, we offer a wide range of services including project management, engineering, procurement, and construction. Our team of experienced professionals is dedicated to delivering high-quality results while ensuring safety and sustainability in every project we undertake. At El-Motahida, we strive to build lasting relationships with our clients by consistently exceeding their expectations and contributing to the growth and development of the construction sector.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html

      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
    

      <body className="min-h-full flex flex-col">

        <Navbar />

        {children}

        <Footer />
        <Script
          src="https://cdn.gtranslate.net/widgets/latest/dropdown.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
