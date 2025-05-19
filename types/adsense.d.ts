// types/adsense.d.ts - TypeScript declarations for AdSense

declare global {
  interface Window {
    adsbygoogle: {
      loaded?: boolean;
      push?: (ad: unknown) => void;
    }[];
  }
}

// AdSense ad configuration types
export interface AdConfig {
  google_ad_client: string;
  enable_page_level_ads?: boolean;
  google_ad_slot?: string;
  google_ad_format?: "auto" | "rectangle" | "banner" | "leaderboard";
  google_ad_layout?: string;
  google_ad_test?: "on" | "off";
}

// Component prop types
export interface AutoAdsProps {
  publisherId: string;
  pageUrl?: string;
}

export interface DisplayAdProps {
  adSlot: string;
  adFormat?: "auto" | "rectangle" | "banner" | "leaderboard";
  adLayout?: string;
  style?: React.CSSProperties;
  className?: string;
  responsive?: boolean;
}

export {};
