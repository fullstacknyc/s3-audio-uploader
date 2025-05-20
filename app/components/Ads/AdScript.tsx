// app/components/Ads/AdScript.tsx
"use client";

import Script from "next/script";
import { useAds } from "@/lib/context/AdContext";

export default function AdScript() {
  const { publisherId, isAdBlockEnabled } = useAds();

  // Don't render script if no publisher ID or adblocker detected
  if (!publisherId || isAdBlockEnabled) return null;

  return (
    <Script
      id="adsbygoogle-init"
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      crossOrigin="anonymous"
      onError={(e) => {
        console.error("AdSense script failed to load", e);
      }}
    />
  );
}
