// app/components/Ads/AdUnit.tsx
"use client";

import { useEffect, useRef } from "react";
import styles from "./AdUnit.module.css";

export type AdSize =
  | "banner" // 468x60
  | "leaderboard" // 728x90
  | "medium-rectangle" // 300x250
  | "large-rectangle" // 336x280
  | "half-page" // 300x600
  | "mobile-banner" // 320x50
  | "responsive";

interface AdUnitProps {
  adSlot: string;
  size: AdSize;
  className?: string;
}

export default function AdUnit({ adSlot, size, className = "" }: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const adSizeClass = `ad-${size}`;

  useEffect(() => {
    // Only run in browser, not during SSR
    if (typeof window === "undefined" || !adRef.current) return;

    try {
      const adsbygoogle = window.adsbygoogle || [];
      adsbygoogle.push({});
    } catch (error) {
      console.error("Error loading ad unit:", error);
    }

    // Clean up function
    return () => {
      // If needed in the future for ad cleanup
    };
  }, []);

  return (
    <div
      className={`${styles.adContainer} ${styles[adSizeClass]} ${className}`}
      data-ad-layout={size === "responsive" ? "in-article" : undefined}
      data-ad-format={size === "responsive" ? "fluid" : undefined}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
        data-ad-slot={adSlot}
        data-ad-format={size === "responsive" ? "auto" : undefined}
        data-full-width-responsive={size === "responsive" ? "true" : undefined}
      />
    </div>
  );
}
