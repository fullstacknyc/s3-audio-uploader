"use client";

import { useEffect, useRef } from "react";
import styles from "./DisplayAd.module.css";

interface DisplayAdProps {
  adSlot: string; // Your ad unit ID
  adFormat?: "auto" | "rectangle" | "banner" | "leaderboard";
  adLayout?: string;
  style?: React.CSSProperties;
  className?: string;
}

export default function DisplayAd({
  adSlot,
  adFormat = "auto",
  adLayout,
  style,
  className = "",
}: DisplayAdProps) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.adsbygoogle && adRef.current) {
      try {
        // Check if the ad has already been pushed
        if (!adRef.current.hasAttribute("data-adsbygoogle-status")) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (error) {
        console.error("Error loading display ad:", error);
      }
    }
  }, []);

  return (
    <div className={`${styles.adContainer} ${className}`}>
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
        data-ad-layout={adLayout}
        data-full-width-responsive="true"
      />
    </div>
  );
}
