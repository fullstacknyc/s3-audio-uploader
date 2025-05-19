"use client";

import { useEffect, useRef } from "react";
import styles from "./DisplayAd.module.css";

interface DisplayAdProps {
  adSlot: string;
  adFormat?: "auto" | "rectangle" | "banner" | "leaderboard";
  style?: React.CSSProperties;
  className?: string;
}

export default function DisplayAd({
  adSlot,
  adFormat = "auto",
  style,
  className = "",
}: DisplayAdProps) {
  const adRef = useRef<HTMLModElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    const loadAd = () => {
      if (window.adsbygoogle && adRef.current && !hasInitialized.current) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          hasInitialized.current = true;
        } catch (error) {
          console.warn("Failed to load display ad:", error);
        }
      }
    };

    // Wait a bit for the AdSense script to be ready
    const timer = setTimeout(loadAd, 100);

    return () => {
      clearTimeout(timer);
      // Reset initialization flag on cleanup
      hasInitialized.current = false;
    };
  }, []);

  // Don't render if we don't have the required props
  if (!process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || !adSlot) {
    return null;
  }

  return (
    <div className={`${styles.adContainer} ${styles[className] || ""}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: "block",
          ...style,
        }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
}
