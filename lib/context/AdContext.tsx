// lib/context/AdContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AdContextType {
  isAdBlockEnabled: boolean;
  publisherId: string | null;
}

const AdContext = createContext<AdContextType>({
  isAdBlockEnabled: false,
  publisherId: null,
});

export function AdProvider({
  children,
  publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID,
}: {
  children: React.ReactNode;
  publisherId?: string | undefined;
}) {
  const [isAdBlockEnabled, setIsAdBlockEnabled] = useState(false);

  useEffect(() => {
    // Simple AdBlock detection
    const detectAdBlock = async () => {
      try {
        const testAd = document.createElement("div");
        testAd.className = "adsbox";
        testAd.style.cssText =
          "position:absolute;left:-999px;top:-999px;height:1px;width:1px;";
        document.body.appendChild(testAd);

        // Wait a moment for potential adblock to hide the element
        await new Promise((resolve) => setTimeout(resolve, 100));

        const isBlocked = testAd.offsetHeight === 0;
        setIsAdBlockEnabled(isBlocked);

        document.body.removeChild(testAd);
      } catch (e) {
        console.log("Ad blocker detection failed:", e);
        setIsAdBlockEnabled(false);
      }
    };

    if (typeof window !== "undefined") {
      detectAdBlock();
    }
  }, []);

  return (
    <AdContext.Provider
      value={{
        isAdBlockEnabled,
        publisherId: publisherId || null,
      }}
    >
      {children}
    </AdContext.Provider>
  );
}

export function useAds() {
  return useContext(AdContext);
}
