"use client";

import { useEffect, useRef } from "react";

interface AutoAdsProps {
  publisherId: string;
}

// Global flag to prevent multiple auto ads initialization
let autoAdsInitialized = false;

export default function AutoAds({ publisherId }: AutoAdsProps) {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    // Don't load script if already initialized
    if (autoAdsInitialized || scriptLoaded.current) {
      return;
    }

    // Create and inject the AdSense script manually
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
    script.crossOrigin = "anonymous";

    script.onload = () => {
      scriptLoaded.current = true;

      // Small delay to ensure script is fully initialized
      setTimeout(() => {
        try {
          if (!autoAdsInitialized) {
            (window.adsbygoogle = window.adsbygoogle || []).push({
              google_ad_client: publisherId,
              enable_page_level_ads: true,
            });
            autoAdsInitialized = true;
          }
        } catch (error) {
          console.warn("AdSense auto ads initialization failed:", error);
        }
      }, 100);
    };

    script.onerror = () => {
      console.warn("Failed to load AdSense script");
    };

    // Append to head
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      // Don't remove the script as it might be used by other components
      // and AdSense doesn't like script tags being removed and re-added
    };
  }, [publisherId]);

  return null; // This component doesn't render anything
}
