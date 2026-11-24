'use client';

import { useEffect } from 'react';

export default function GTranslate() {

  useEffect(() => {

    window.gtranslateSettings = {
      default_language: "en",
      languages: ["en", "fr", "es", "ar", "pt"],
      wrapper_selector: ".gtranslate_wrapper",
      flag_style: "3d",
      switcher_horizontal_position: "right",
      switcher_vertical_position: "top",
    };

 

    // ✅ مراقبة اللغة الحالية
    const interval = setInterval(() => {

      const currentLang =
        document.documentElement.lang ||
        localStorage.getItem('gtranslate-lang');

      // ✅ عربي → RTL
      if (currentLang?.includes('ar')) {

        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('lang', 'ar');

        document.body.classList.add('rtl');

      } else {

        // ✅ باقي اللغات → LTR
        document.documentElement.setAttribute('dir', 'ltr');
        document.documentElement.setAttribute('lang', 'en');

        document.body.classList.remove('rtl');
      }

    }, 500);

    return () => {

      clearInterval(interval);

      
    };

  }, []);

  return (
    <div className="gtranslate_wrapper"></div>
  );
}