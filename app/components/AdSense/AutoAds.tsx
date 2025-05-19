"use client";

import { useEffect } from "react";
import Script from "next/script";

interface AutoAdsProps {
  publisherId: string;
}

export default function AutoAds({ publisherId }: AutoAdsProps) {
  useEffect(() => {
    // Initialize auto ads after the script loads
    if (typeof window !== "undefined" && window.adsbygoogle) {
      try {
        // Push auto ads configuration
        (window.adsbygoogle = window.adsbygoogle || []).push({
        //   google_ad_client: publisherId,
        //   enable_page_level_ads: true,
        });
      } catch (error) {
        console.error("Error initializing auto ads:", error);
      }
    }
  }, [publisherId]);

  return (
    <>
      {/* AdSense Auto Ads Script */}
      <Script
        id="adsense-auto-ads"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
        onLoad={() => {
          // Enable auto ads after script loads
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({
            //   google_ad_client: publisherId,
            //   enable_page_level_ads: true,
            });
          } catch (error) {
            console.error("Error enabling auto ads:", error);
          }
        }}
      />
    </>
  );
}
