"use client";

import { useEffect } from "react";
import Script from "next/script";

interface AutoAdsProps {
  publisherId: string;
}

export default function AutoAds({ publisherId }: AutoAdsProps) {
  useEffect(() => {
    // Only initialize after the script has loaded
    const initializeAds = () => {
      try {
        if (typeof window !== "undefined" && window.adsbygoogle) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (error) {
        console.warn("AdSense auto ads initialization failed:", error);
      }
    };

    // Small delay to ensure script is fully loaded
    const timer = setTimeout(initializeAds, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Script
      id="adsense-auto-ads"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
      onError={() => {
        console.warn("Failed to load AdSense script");
      }}
    />
  );
}
