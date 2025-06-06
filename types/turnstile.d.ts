// types/turnstile.d.ts

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: TurnstileOptions
      ) => string;
      reset: (widgetId: string) => void;
      getResponse: (widgetId: string) => string | undefined;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileOptions {
  sitekey: string;
  action?: string;
  cData?: string;
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: (error: unknown) => void;
  theme?: "light" | "dark" | "auto";
  tabindex?: number;
  appearance?: "always" | "execute" | "interaction-only";
  size?: "normal" | "compact";
  retry?: "auto" | "never";
  "retry-interval"?: number;
  "refresh-expired"?: "auto" | "never" | "manual";
  language?: string;
}

export {};
