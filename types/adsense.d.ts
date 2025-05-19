// types/adsense.d.ts - Fixed TypeScript declarations for AdSense

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

// Component prop types
export interface AutoAdsProps {
  publisherId: string;
}

export interface DisplayAdProps {
  adSlot: string;
  adFormat?: "auto" | "rectangle" | "banner" | "leaderboard";
  style?: React.CSSProperties;
  className?: string;
}

export {};
