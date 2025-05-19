import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "@/lib/context/AuthContext";
import AutoAds from "./components/AdSense/AutoAds";

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
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
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
    creator: "@fullstacknyc",
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
        {/* Google AdSense Auto Ads */}
        {process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID && (
          <AutoAds publisherId={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID} />
        )}

        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
