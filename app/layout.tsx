import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "@/lib/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_FRONTEND_URL ||
      "https://s3-audio-uploader.vercel.app"
  ),
  title: {
    template: "%s | AudioCloud",
    default: "AudioCloud - Secure Audio Storage for Musicians",
  },
  description:
    "Upload, store, and share your audio files securely with AudioCloud. The perfect cloud storage solution for musicians, producers, and audio professionals.",
  keywords:
    "audio storage, secure cloud storage, music files, audio sharing, musician tools",
  authors: [{ name: "Camilo G." }],
  verification: {
    google: "google4585d79a345a47f8.html",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: 'any' },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    // other: [
    //   {
    //     rel: "mask-icon",
    //     url: "/safari-pinned-tab.svg",
    //     color: "#3b82f6", // Use your brand color
    //   },
    // ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    siteName: "AudioCloud",
    title: "AudioCloud - Secure Audio Storage for Musicians",
    description:
      "Upload, store, and share your audio files securely with AudioCloud.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AudioCloud - Secure Audio Storage",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AudioCloud - Secure Audio Storage",
    description:
      "Upload, store, and share your audio files securely with AudioCloud.",
    images: ["/twitter-card.png"],
    creator: "@fullstacknyc", // If applicable
  },
  appleWebApp: {
    title: "AudioCloud",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2330891452848767"
          crossOrigin="anonymous"
        ></script>

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-JJMFNDZXLC"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JJMFNDZXLC'); // Replace with a valid ID
          `}
        </Script>
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
